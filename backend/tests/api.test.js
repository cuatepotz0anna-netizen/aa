const request = require('supertest');
const crypto = require('crypto');
if (!process.env.JWT_SECRET) {
  process.env.JWT_SECRET = crypto.randomBytes(32).toString('hex');
}
const app = require('../src/app');

describe('ERP API bootstrap', () => {
  test('GET / should return the API welcome object', async () => {
    const response = await request(app).get('/');

    expect(response.status).toBe(200);
    expect(response.body.success).toBe(true);
    expect(response.body.data).toHaveProperty('name');
  });

  test('GET /api/health should return a healthy status', async () => {
    const response = await request(app).get('/api/health');

    expect(response.status).toBe(200);
    expect(response.body.success).toBe(true);
    expect(response.body.data).toHaveProperty('timestamp');
    expect(response.body.data).toHaveProperty('databaseConnected', false);
  });

  test.each(['http://localhost:5173', 'http://127.0.0.1:5173'])(
    'OPTIONS /api/auth/login allows the %s frontend origin',
    async (origin) => {
      const response = await request(app)
        .options('/api/auth/login')
        .set('Origin', origin)
        .set('Access-Control-Request-Method', 'POST')
        .set('Access-Control-Request-Headers', 'content-type');

      expect(response.status).toBe(204);
      expect(response.headers['access-control-allow-origin']).toBe(origin);
      expect(response.headers['access-control-allow-credentials']).toBe('true');
    }
  );

  test('should include Helmet and rate-limit headers', async () => {
    const response = await request(app).get('/');

    expect(response.headers['content-security-policy']).toBeTruthy();
    expect(response.headers['ratelimit-limit']).toBe('200');
  });

  test('POST /api/auth/login should explain when the database is unavailable', async () => {
    const response = await request(app)
      .post('/api/auth/login')
      .send({ email: 'user@example.com', password: 'password' });

    expect(response.status).toBe(503);
    expect(response.body.success).toBe(false);
    expect(response.body.message).toContain('base de datos');
  });

  test('GET /api/not-found should return 404 formatted error', async () => {
    const response = await request(app).get('/api/not-found');

    expect(response.status).toBe(404);
    expect(response.body.success).toBe(false);
  });
});
