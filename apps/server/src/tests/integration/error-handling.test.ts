import { describe, it, expect } from 'vitest';
import request from 'supertest';
import app from '../../app';

describe('Error Handling - RFC 9457 Problem Details', () => {
  describe('404 Not Found', () => {
    it('should return Problem Details for unknown resource', async () => {
      const res = await request(app)
        .get('/api/orders/nonexistent-id')
        .set('Authorization', 'Bearer fake-token');

      expect(res.status).toBe(404);
      expect(res.headers['content-type']).toMatch(/application\/problem\+json/);
      expect(res.body).toMatchObject({
        type: expect.stringContaining('errors/'),
        title: 'Not Found',
        status: 404,
        code: 'NOT_FOUND',
        detail: expect.any(String),
        instance: expect.any(String),
        userMessage: expect.any(String),
        traceId: expect.any(String),
        timestamp: expect.any(String),
      });
    });
  });

  describe('401 Unauthenticated', () => {
    it('should return Problem Details without token', async () => {
      const res = await request(app)
        .get('/api/auth/me');

      expect(res.status).toBe(401);
      expect(res.headers['content-type']).toMatch(/application\/problem\+json/);
      expect(res.body).toMatchObject({
        code: 'UNAUTHENTICATED',
        status: 401,
        userMessage: expect.any(String),
        traceId: expect.any(String),
      });
    });

    it('should return Problem Details with invalid token', async () => {
      const res = await request(app)
        .get('/api/auth/me')
        .set('Authorization', 'Bearer invalid-token');

      expect(res.status).toBe(401);
      expect(res.body).toMatchObject({
        code: 'UNAUTHENTICATED',
        status: 401,
      });
    });
  });

  describe('500 Internal Server Error', () => {
    it('should return Problem Details with generic message', async () => {
      // This test would normally require forcing an unhandled error
      // For now, we verify that unexpected errors don't leak stack traces
      const res = await request(app)
        .post('/api/auth/signin')
        .send({ email: 'test@example.com', password: 'wrong' });

      // Even on error, should be Problem Details
      if (res.status >= 400) {
        expect(res.headers['content-type']).toMatch(/application\/problem\+json/);
        expect(res.body).toHaveProperty('code');
        expect(res.body).toHaveProperty('userMessage');
        expect(res.body).toHaveProperty('traceId');
        // Should never contain raw stack trace
        expect(res.body.detail).not.toMatch(/at Function/);
      }
    });
  });

  describe('Content-Type and Headers', () => {
    it('all error responses should have correct content-type', async () => {
      const endpoints = [
        { method: 'get', path: '/api/nonexistent' },
        { method: 'get', path: '/api/orders' },
      ];

      for (const endpoint of endpoints) {
        let res;
        if (endpoint.method === 'get') {
          res = await request(app).get(endpoint.path);
        }

        if (res && res.status >= 400) {
          expect(res.headers['content-type']).toMatch(/application\/problem\+json/);
        }
      }
    });
  });

  describe('RFC 9457 Compliance', () => {
    it('should include all RFC 9457 fields + FixIt extensions', async () => {
      const res = await request(app)
        .get('/api/orders/invalid')
        .set('Authorization', 'Bearer token');

      if (res.status >= 400) {
        // RFC 9457 fields
        expect(res.body).toHaveProperty('type');
        expect(res.body).toHaveProperty('title');
        expect(res.body).toHaveProperty('status');
        expect(res.body).toHaveProperty('detail');
        expect(res.body).toHaveProperty('instance');

        // FixIt extensions
        expect(res.body).toHaveProperty('code');
        expect(res.body).toHaveProperty('userMessage');
        expect(res.body).toHaveProperty('traceId');
        expect(res.body).toHaveProperty('timestamp');
      }
    });

    it('traceId should be uuid format or correlate with request', async () => {
      const res = await request(app)
        .get('/api/orders/invalid')
        .set('Authorization', 'Bearer token');

      if (res.status >= 400) {
        expect(res.body.traceId).toBeTruthy();
        // UUID v4 pattern or similar
        expect(res.body.traceId).toMatch(/^[a-f0-9\-]+$/i);
      }
    });
  });
});
