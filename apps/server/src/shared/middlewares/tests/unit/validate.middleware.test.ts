import { describe, it, expect, vi, beforeEach } from 'vitest';
import { z } from 'zod';
import { validate } from '../../validate.middleware.js';
import { createMockReq, createMockRes } from '../../../../../tests/mocks/express.mock.js';

describe('validate middleware', () => {
  const next = vi.fn();

  beforeEach(() => {
    next.mockClear();
  });

  describe('body validation', () => {
    const schema = z.object({ email: z.string().email(), age: z.number() });

    it('calls next() when body is valid', () => {
      const req = createMockReq({ body: { email: 'a@b.com', age: 25 } });
      const res = createMockRes();
      validate({ body: schema })(req, res, next);
      expect(next).toHaveBeenCalled();
      expect(res.status).not.toHaveBeenCalled();
    });

    it('returns 400 with first issue as top-level error when body is invalid', () => {
      const req = createMockReq({ body: { email: 'not-email', age: 'bad' } });
      const res = createMockRes();
      validate({ body: schema })(req, res, next);
      expect(res.statusCode).toBe(400);
      expect(res.body).toMatchObject({
        error: expect.any(String),
        details: expect.any(Array),
      });
      expect((res.body as any).details.length).toBeGreaterThanOrEqual(1);
      expect((res.body as any).details[0]).toHaveProperty('field');
      expect((res.body as any).details[0]).toHaveProperty('message');
      expect(next).not.toHaveBeenCalled();
    });

    it('replaces req.body with parsed output (strips unknown fields)', () => {
      const req = createMockReq({ body: { email: 'a@b.com', age: 25, extra: 'junk' } });
      const res = createMockRes();
      validate({ body: schema })(req, res, next);
      expect(req.body).toEqual({ email: 'a@b.com', age: 25 });
    });
  });

  describe('params validation', () => {
    const schema = z.object({ id: z.string().uuid() });

    it('returns 400 for invalid UUID param', () => {
      const req = createMockReq({ params: { id: 'not-a-uuid' } as any });
      const res = createMockRes();
      validate({ params: schema })(req, res, next);
      expect(res.statusCode).toBe(400);
      expect((res.body as any).details[0].field).toBe('id');
    });

    it('passes valid UUID param', () => {
      const req = createMockReq({ params: { id: '550e8400-e29b-41d4-a716-446655440000' } as any });
      const res = createMockRes();
      validate({ params: schema })(req, res, next);
      expect(next).toHaveBeenCalled();
    });
  });

  describe('query validation with z.coerce', () => {
    const schema = z.object({ lat: z.coerce.number(), lng: z.coerce.number() });

    it('coerces string query params to numbers', () => {
      const req = createMockReq({ query: { lat: '31.95', lng: '35.93' } as any });
      const res = createMockRes();
      validate({ query: schema })(req, res, next);
      expect(next).toHaveBeenCalled();
      expect(req.query).toEqual({ lat: 31.95, lng: 35.93 });
    });

    it('returns 400 for non-numeric query param', () => {
      const req = createMockReq({ query: { lat: 'abc', lng: '35.93' } as any });
      const res = createMockRes();
      validate({ query: schema })(req, res, next);
      expect(res.statusCode).toBe(400);
    });
  });

  describe('validation order', () => {
    it('fails on params before checking body', () => {
      const req = createMockReq({
        params: { id: 'bad' } as any,
        body: { email: 'also-bad' },
      });
      const res = createMockRes();
      validate({
        params: z.object({ id: z.string().uuid() }),
        body: z.object({ email: z.string().email() }),
      })(req, res, next);
      expect((res.body as any).details[0].field).toBe('id');
    });
  });

  describe('refine root-level error', () => {
    const schema = z.object({
      name: z.string().optional(),
      phone: z.string().optional(),
    }).refine(d => d.name !== undefined || d.phone !== undefined, {
      message: 'At least one field is required',
    });

    it('returns _root as field for refine errors', () => {
      const req = createMockReq({ body: {} });
      const res = createMockRes();
      validate({ body: schema })(req, res, next);
      expect(res.statusCode).toBe(400);
      expect((res.body as any).details[0].field).toBe('_root');
      expect((res.body as any).error).toBe('At least one field is required');
    });
  });

  describe('no schemas', () => {
    it('calls next() when no schemas provided', () => {
      const req = createMockReq({ body: { anything: true } });
      const res = createMockRes();
      validate({})(req, res, next);
      expect(next).toHaveBeenCalled();
    });
  });
});
