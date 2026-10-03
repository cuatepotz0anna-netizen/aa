const request = require('supertest');
const mongoose = require('mongoose');
const jwt = require('jsonwebtoken');
const path = require('path');
const { spawnSync } = require('child_process');
const crypto = require('crypto');
const { MongoMemoryServer } = require('mongodb-memory-server');
if (!process.env.JWT_SECRET) {
  process.env.JWT_SECRET = crypto.randomBytes(32).toString('hex');
}
const JWT_SECRET = process.env.JWT_SECRET;
const User = require('../src/modules/users/user.model');
const app = require('../src/app');

let mongoServer;
let employeeUserId;

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
        tenantId: 'tenant-selected-by-client',
      });

    expect(response.status).toBe(201);
    expect(response.body.success).toBe(true);
    employeeUserId = response.body.data.user.id;
    expect(response.body.data.user.email).toBe('admin@demo.com');
    expect(response.body.data.user.role).toBe('EMPLEADO');
    expect(response.body.data.user.password).toBeUndefined();
    expect(response.body.data.refreshToken).toBeTruthy();

    const storedUser = await User.findById(response.body.data.user.id).select('+password');
    expect(storedUser.role).toBe('EMPLEADO');
    expect(storedUser.tenantId).toBeNull();
    expect(storedUser.companyId).toBeNull();
    expect(storedUser.branchId).toBeNull();
    expect(storedUser.password).toMatch(/^\$2[aby]\$/);
    expect(storedUser.password).not.toBe('Password123!');
  });

  test('registers a normal public account as EMPLEADO', async () => {
    const response = await request(app)
      .post('/api/auth/register')
      .send({
        name: 'Public Employee',
        email: 'public-employee@demo.com',
        password: 'Password123!',
      });

    expect(response.status).toBe(201);
    expect(response.body.data.user.role).toBe('EMPLEADO');
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
    expect(response.body.data.refreshToken).toBeTruthy();
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

  test('returns the authenticated profile for a valid access token', async () => {
    const loginResponse = await request(app)
      .post('/api/auth/login')
      .send({ email: 'admin@demo.com', password: 'Password123!' });
    const response = await request(app)
      .get('/api/auth/profile')
      .set('Authorization', `Bearer ${loginResponse.body.data.accessToken}`);

    expect(loginResponse.status).toBe(200);
    expect(response.status).toBe(200);
    expect(response.body.data.user.email).toBe('admin@demo.com');
  });

  test('requires an access token for the current profile', async () => {
    const response = await request(app).get('/api/auth/profile');

    expect(response.status).toBe(401);
  });

  test('returns 401 for invalid JWT', async () => {
    const response = await request(app)
      .get('/api/auth/profile')
      .set('Authorization', 'Bearer invalid-token');

    expect(response.status).toBe(401);
    expect(response.body.success).toBe(false);
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

  test('does not trust role claims supplied in a signed access token', async () => {
    const user = await User.findOne({ email: 'admin@demo.com' });
    const tokenWithForgedRole = jwt.sign(
      { sub: user._id.toString(), type: 'access', role: 'ADMIN' },
      JWT_SECRET
    );
    const response = await request(app)
      .get('/api/users')
      .set('Authorization', `Bearer ${tokenWithForgedRole}`);

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

  test('rejects user administration without a token', async () => {
    const response = await request(app).get('/api/users');

    expect(response.status).toBe(401);
    expect(response.body.success).toBe(false);
  });

  test('rejects EMPLEADO on administrator endpoints and allows ADMIN', async () => {
    const employeeLogin = await request(app)
      .post('/api/auth/login')
      .send({ email: 'admin@demo.com', password: 'Password123!' });

    const employeeResponse = await request(app)
      .get('/api/users')
      .set('Authorization', `Bearer ${employeeLogin.body.data.token}`);

    expect(employeeLogin.status).toBe(200);
    expect(employeeResponse.status).toBe(403);

    await User.create({
      name: 'Admin Route Test',
      email: 'admin-route-test@demo.com',
      password: 'Password123!',
      role: 'ADMIN',
    });
    const adminLogin = await request(app)
      .post('/api/auth/login')
      .send({ email: 'admin-route-test@demo.com', password: 'Password123!' });

    const adminResponse = await request(app)
      .get('/api/users')
      .set('Authorization', `Bearer ${adminLogin.body.data.token}`);

    expect(adminLogin.status).toBe(200);
    expect(adminResponse.status).toBe(200);
  });

  test('prevents GERENTE from assigning administrative roles', async () => {
    await User.create({
      name: 'Manager Route Test',
      email: 'manager-route-test@demo.com',
      password: 'Password123!',
      role: 'GERENTE',
    });
    const managerLogin = await request(app)
      .post('/api/auth/login')
      .send({ email: 'manager-route-test@demo.com', password: 'Password123!' });
    const headers = { Authorization: `Bearer ${managerLogin.body.data.token}` };

    const createResponse = await request(app)
      .post('/api/users')
      .set(headers)
      .send({
        name: 'Attempted Admin',
        email: 'attempted-admin@demo.com',
        password: 'Password123!',
        role: 'ADMIN',
      });
    const updateResponse = await request(app)
      .put(`/api/users/${employeeUserId}`)
      .set(headers)
      .send({ role: 'ADMIN' });
    const scopeUpdateResponse = await request(app)
      .put(`/api/users/${employeeUserId}`)
      .set(headers)
      .send({ isActive: false });

    expect(managerLogin.status).toBe(200);
    expect(createResponse.status).toBe(403);
    expect(updateResponse.status).toBe(403);
    expect(scopeUpdateResponse.status).toBe(403);
    expect((await User.findById(employeeUserId)).isActive).toBe(true);
    expect(await User.findOne({ email: 'attempted-admin@demo.com' })).toBeNull();
  });

  test('protects the defaults seeding endpoint for ADMIN only', async () => {
    const publicResponse = await request(app).get('/api/seed-defaults');
    expect(publicResponse.status).toBe(401);

    const adminLogin = await request(app)
      .post('/api/auth/login')
      .send({ email: 'admin-route-test@demo.com', password: 'Password123!' });
    const adminResponse = await request(app)
      .get('/api/seed-defaults')
      .set('Authorization', `Bearer ${adminLogin.body.data.token}`);

    expect(adminResponse.status).toBe(200);
  });

  test('rotates refresh tokens and revokes a reused token family', async () => {
    const loginResponse = await request(app)
      .post('/api/auth/login')
      .send({ email: 'admin@demo.com', password: 'Password123!' });
    const originalRefreshToken = loginResponse.body.data.refreshToken;

    expect(loginResponse.status).toBe(200);
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
  });

  test('logout revokes the supplied refresh token', async () => {
    const loginResponse = await request(app)
      .post('/api/auth/login')
      .send({ email: 'admin@demo.com', password: 'Password123!' });
    const { accessToken, refreshToken } = loginResponse.body.data;
    const logoutResponse = await request(app)
      .post('/api/auth/logout')
      .set('Authorization', `Bearer ${accessToken}`)
      .send({ refreshToken });
    const refreshResponse = await request(app)
      .post('/api/auth/refresh')
      .send({ refreshToken });

    expect(logoutResponse.status).toBe(200);
    expect(refreshResponse.status).toBe(401);
  });

  test('requires a strong JWT secret in production', () => {
    const result = spawnSync(
      process.execPath,
      ['-e', "require('./src/config/jwt')"],
      {
        cwd: path.resolve(__dirname, '..'),
        encoding: 'utf8',
        env: {
          ...process.env,
          NODE_ENV: 'production',
          JWT_SECRET: 'short',
        },
      }
    );

    expect(result.status).not.toBe(0);
    expect(result.stderr).toContain('JWT_SECRET must be at least 32 bytes in production');
  });
});
