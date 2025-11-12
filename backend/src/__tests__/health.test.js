import request from 'supertest';
import app from '../index.js';

describe('health endpoint', () => {
  it('responde con estado ok', async () => {
    const res = await request(app).get('/health');
    expect(res.status).toBe(200);
    expect(res.body).toMatchObject({
      status: 'ok'
    });
  });
});
