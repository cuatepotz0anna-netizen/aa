const request = require('supertest');
const mongoose = require('mongoose');
const jwt = require('jsonwebtoken');
const { MongoMemoryServer } = require('mongodb-memory-server');
const app = require('../src/app');
const User = require('../src/modules/users/user.model');

const JWT_SECRET = process.env.JWT_SECRET || 'dev_secret_change_me';

let mongoServer;

beforeAll(async () => {
  mongoServer = await MongoMemoryServer.create();
  process.env.MONGODB_URI = mongoServer.getUri();
  await mongoose.connect(process.env.MONGODB_URI);
});

afterAll(async () => {
  await mongoose.disconnect();
  await mongoServer.stop();
});

describe('Authentication module', () => {
  test('registers a new user with a hashed password and default role', async () => {
    const response = await request(app)
      .post('/api/auth/register')
      .send({
        name: 'Admin Demo',
        email: 'admin@demo.com',
        password: 'Password123!',
        role: 'ADMIN',
        tenantId: '507f1f77bcf86cd799439011',
      });

    expect(response.status).toBe(201);
    expect(response.body.success).toBe(true);
    expect(response.body.data.user.email).toBe('admin@demo.com');
    expect(response.body.data.user.role).toBe('EMPLEADO');
    expect(response.body.data.user.tenantId).toBeNull();
    expect(response.body.data.user.password).toBeUndefined();
    expect(response.body.data.refreshToken).toBeTruthy();
    const storedUser = await User.findOne({ email: 'admin@demo.com' }).select('+password');
    expect(storedUser.password).toMatch(/^\$2[aby]\$/);
    expect(storedUser.password).not.toBe('Password123!');
    const accessClaims = jwt.decode(response.body.data.accessToken);
    expect(accessClaims).not.toHaveProperty('email');
    expect(accessClaims).not.toHaveProperty('role');
    expect(accessClaims).not.toHaveProperty('password');
  });

  test('logs in with valid credentials', async () => {
    const response = await request(app)
      .post('/api/auth/login')
      .send({
        email: 'admin@demo.com',
        password: 'Password123!',
      });

    expect(response.status).toBe(200);
    expect(response.body.success).toBe(true);
    expect(response.body.data.token).toBeTruthy();
    expect(response.body.data.user.password).toBeUndefined();
  });

  test('rejects invalid login credentials', async () => {
    const response = await request(app)
      .post('/api/auth/login')
      .send({
        email: 'admin@demo.com',
        password: 'wrongpass',
      });

    expect(response.status).toBe(401);
    expect(response.body.success).toBe(false);
  });

  test('returns 401 for invalid JWT', async () => {
    const response = await request(app)
      .get('/api/auth/profile')
      .set('Authorization', 'Bearer invalid-token');

    expect(response.status).toBe(401);
    expect(response.body.success).toBe(false);
  });

  test('requires a JWT for the current profile', async () => {
    const response = await request(app).get('/api/auth/profile');

    expect(response.status).toBe(401);
  });

  test('rejects expired access tokens', async () => {
    const user = await User.findOne({ email: 'admin@demo.com' });
    const expiredToken = jwt.sign(
      { sub: user._id.toString(), type: 'access' },
      JWT_SECRET,
      { expiresIn: '-1s' }
    );

    const response = await request(app)
      .get('/api/auth/profile')
      .set('Authorization', `Bearer ${expiredToken}`);

    expect(response.status).toBe(401);
  });

  test('uses the database role instead of a role claim supplied in a signed token', async () => {
    const user = await User.findOne({ email: 'admin@demo.com' });
    const forgedRoleToken = jwt.sign(
      { sub: user._id.toString(), type: 'access', role: 'ADMIN' },
      JWT_SECRET
    );

    const response = await request(app)
      .get('/api/users')
      .set('Authorization', `Bearer ${forgedRoleToken}`);

    expect(response.status).toBe(403);
  });

  test('rejects access for an inactive user', async () => {
    const user = await User.create({
      name: 'Inactive User',
      email: 'inactive@demo.com',
      password: 'Password123!',
      role: 'EMPLEADO',
      isActive: false,
    });
    const token = jwt.sign(
      { sub: user._id.toString(), type: 'access' },
      JWT_SECRET
    );

    const response = await request(app)
      .get('/api/auth/profile')
      .set('Authorization', `Bearer ${token}`);

    expect(response.status).toBe(401);
  });

  test('denies user administration to EMPLEADO and allows ADMIN', async () => {
    const employee = await request(app)
      .post('/api/auth/login')
      .send({ email: 'admin@demo.com', password: 'Password123!' });
    const deniedResponse = await request(app)
      .get('/api/users')
      .set('Authorization', `Bearer ${employee.body.data.accessToken}`);

    expect(deniedResponse.status).toBe(403);

    const administrator = await User.create({
      name: 'Administrator',
      email: 'administrator@demo.com',
      password: 'Password123!',
      role: 'ADMIN',
    });
    const adminLogin = await request(app)
      .post('/api/auth/login')
      .send({ email: administrator.email, password: 'Password123!' });
    const allowedResponse = await request(app)
      .get('/api/users')
      .set('Authorization', `Bearer ${adminLogin.body.data.accessToken}`);

    expect(allowedResponse.status).toBe(200);
    expect(allowedResponse.body.data.every((user) => !('password' in user))).toBe(true);
  });

  test('prevents GERENTE from assigning a privileged role or editing one', async () => {
    const manager = await User.create({
      name: 'Manager',
      email: 'manager@demo.com',
      password: 'Password123!',
      role: 'GERENTE',
    });
    const employee = await User.create({
      name: 'Employee',
      email: 'employee@demo.com',
      password: 'Password123!',
      role: 'EMPLEADO',
    });
    const managerLogin = await request(app)
      .post('/api/auth/login')
      .send({ email: manager.email, password: 'Password123!' });
    const token = managerLogin.body.data.accessToken;

    const createResponse = await request(app)
      .post('/api/users')
      .set('Authorization', `Bearer ${token}`)
      .send({ name: 'Escalation', email: 'escalation@demo.com', password: 'Password123!', role: 'ADMIN' });
    const updateResponse = await request(app)
      .put(`/api/users/${employee._id}`)
      .set('Authorization', `Bearer ${token}`)
      .send({ role: 'ADMIN' });

    expect(createResponse.status).toBe(403);
    expect(updateResponse.status).toBe(403);
    await expect(User.findOne({ email: 'escalation@demo.com' })).resolves.toBeNull();
  });

  test('rotates refresh tokens and revokes reused tokens', async () => {
    const loginResponse = await request(app)
      .post('/api/auth/login')
      .send({
        email: 'admin@demo.com',
        password: 'Password123!',
      });

    expect(loginResponse.status).toBe(200);
    const originalRefreshToken = loginResponse.body.data.refreshToken;
    expect(originalRefreshToken).toBeTruthy();

    const refreshResponse = await request(app)
      .post('/api/auth/refresh')
      .send({ refreshToken: originalRefreshToken });

    expect(refreshResponse.status).toBe(200);
    expect(refreshResponse.body.data.refreshToken).toBeTruthy();
    expect(refreshResponse.body.data.refreshToken).not.toBe(originalRefreshToken);

    const reusedResponse = await request(app)
      .post('/api/auth/refresh')
      .send({ refreshToken: originalRefreshToken });

    expect(reusedResponse.status).toBe(401);
    expect(reusedResponse.body.success).toBe(false);

    const logoutResponse = await request(app)
      .post('/api/auth/logout')
      .set('Authorization', `Bearer ${loginResponse.body.data.accessToken}`)
      .send({ refreshToken: refreshResponse.body.data.refreshToken });

    expect(logoutResponse.status).toBe(200);
    expect(logoutResponse.body.success).toBe(true);
  });
});
