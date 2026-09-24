const request = require('supertest');
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
  });

  test('GET /api/not-found should return 404 formatted error', async () => {
    const response = await request(app).get('/api/not-found');

    expect(response.status).toBe(404);
    expect(response.body.success).toBe(false);
  });
});
