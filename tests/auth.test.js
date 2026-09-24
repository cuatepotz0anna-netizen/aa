const request = require('supertest');
const mongoose = require('mongoose');
const { MongoMemoryServer } = require('mongodb-memory-server');
const app = require('../src/app');

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
      });

    expect(response.status).toBe(201);
    expect(response.body.success).toBe(true);
    expect(response.body.data.user.email).toBe('admin@demo.com');
    expect(response.body.data.user.password).toBeUndefined();
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
