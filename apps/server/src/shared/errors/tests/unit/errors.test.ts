import { describe, it, expect, vi } from 'vitest';
import { AppError, normalizeError } from '../../index.js';
import { finalErrorMiddleware } from '../../final-error-middleware.js';

function runMiddleware(err: unknown) {
  const req = { id: 'trace-1', path: '/api/x', log: { error: vi.fn() } } as never;
  const res = {
    statusCode: 0,
    body: undefined as unknown,
    setHeader: vi.fn(),
    status(code: number) {
      this.statusCode = code;
      return this;
    },
    json(body: unknown) {
      this.body = body;
      return this;
    },
  };
  finalErrorMiddleware(err, req, res as never, vi.fn());
  return res;
}

describe('AppError', () => {
  it('creates error with code and message', () => {
    const err = new AppError('NOT_FOUND', 'Not found');
    expect(err).toBeInstanceOf(Error);
    expect(err).toBeInstanceOf(AppError);
    expect(err.message).toBe('Not found');
    expect(err.status).toBe(500);
  });

  it('defaults status to 500', () => {
    const err = new AppError('SERVER', 'Oops');
    expect(err.status).toBe(500);
  });

  it('static factories set correct status codes', () => {
    expect(AppError.badRequest('x').status).toBe(400);
    expect(AppError.unauthorized('x').status).toBe(401);
    expect(AppError.forbidden('x').status).toBe(403);
    expect(AppError.notFound('x').status).toBe(404);
    expect(AppError.conflict('x').status).toBe(409);
  });
});

describe('normalizeError', () => {
  it('normalizes AppError instances', () => {
    const err = AppError.notFound('Resource missing');
    expect(normalizeError(err)).toEqual({ status: 404, message: 'Resource missing' });
  });

  it('normalizes native Error with status 500', () => {
    expect(normalizeError(new Error('Boom'))).toEqual({ status: 500, message: 'Boom' });
  });

  it('normalizes legacy plain-object errors from services', () => {
    const legacy = { status: 403, message: 'Not allowed' };
    expect(normalizeError(legacy)).toEqual({ status: 403, message: 'Not allowed' });
  });

  it('defaults to 500 when legacy object has no status', () => {
    expect(normalizeError({ message: 'Something' })).toEqual({ status: 500, message: 'Something' });
  });

  it('returns generic message for string throw', () => {
    expect(normalizeError('string error')).toEqual({ status: 500, message: 'Internal server error' });
  });

  it('returns generic message for null', () => {
    expect(normalizeError(null)).toEqual({ status: 500, message: 'Internal server error' });
  });

  it('returns generic message for undefined', () => {
    expect(normalizeError(undefined)).toEqual({ status: 500, message: 'Internal server error' });
  });

  it('returns generic message for number', () => {
    expect(normalizeError(42)).toEqual({ status: 500, message: 'Internal server error' });
  });
});

describe('finalErrorMiddleware', () => {
  it('serializes opts.fields into the problem+json body', () => {
    const res = runMiddleware(
      AppError.forbidden('Your application was not approved.', {
        fields: { accountStatus: 'rejected' },
      }),
    );
    expect(res.statusCode).toBe(403);
    expect(res.body).toMatchObject({
      code: 'FORBIDDEN',
      userMessage: 'Your application was not approved.',
      fields: { accountStatus: 'rejected' },
    });
  });

  it('omits the fields key when there are no fields', () => {
    const res = runMiddleware(AppError.forbidden('No technician account'));
    expect(res.body).not.toHaveProperty('fields');
  });
});
