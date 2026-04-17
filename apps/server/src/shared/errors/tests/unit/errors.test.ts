import { describe, it, expect } from 'vitest';
import { AppError, normalizeError } from '../../index.js';

describe('AppError', () => {
  it('creates error with status and message', () => {
    const err = new AppError('Not found', 404);
    expect(err).toBeInstanceOf(Error);
    expect(err).toBeInstanceOf(AppError);
    expect(err.message).toBe('Not found');
    expect(err.status).toBe(404);
  });

  it('defaults status to 500', () => {
    const err = new AppError('Oops');
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
