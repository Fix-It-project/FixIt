import { describe, it, expect } from 'vitest';
import {
  SignUpBodySchema,
  SignInBodySchema,
  RefreshTokenBodySchema,
  ForgotPasswordBodySchema,
  ResetPasswordBodySchema,
} from '../../auth.dto.js';

describe('SignUpBodySchema', () => {
  const validBody = {
    email: 'test@example.com',
    password: 'password123',
    city: 'Cairo',
    street: 'Main St',
  };

  it('accepts valid signup with required fields only', () => {
    const result = SignUpBodySchema.safeParse(validBody);
    expect(result.success).toBe(true);
  });

  it('accepts valid signup with all optional fields', () => {
    const result = SignUpBodySchema.safeParse({
      ...validBody,
      fullName: 'John Doe',
      phone: '+20123456789',
      address: '123 Main St',
      building_no: '12',
      apartment_no: '3A',
      latitude: 30.0444,
      longitude: 31.2357,
    });
    expect(result.success).toBe(true);
  });

  it('rejects invalid email format', () => {
    const result = SignUpBodySchema.safeParse({ ...validBody, email: 'not-an-email' });
    expect(result.success).toBe(false);
    expect(result.error!.issues[0].path).toContain('email');
  });

  it('rejects password shorter than 8 chars', () => {
    const result = SignUpBodySchema.safeParse({ ...validBody, password: 'short' });
    expect(result.success).toBe(false);
    expect(result.error!.issues[0].path).toContain('password');
  });

  it('rejects missing city', () => {
    const { city: _, ...noCity } = validBody;
    const result = SignUpBodySchema.safeParse(noCity);
    expect(result.success).toBe(false);
  });

  it('rejects empty city string', () => {
    const result = SignUpBodySchema.safeParse({ ...validBody, city: '' });
    expect(result.success).toBe(false);
  });

  it('accepts null latitude/longitude', () => {
    const result = SignUpBodySchema.safeParse({ ...validBody, latitude: null, longitude: null });
    expect(result.success).toBe(true);
  });

  it('rejects latitude as string (JSON body, no coerce)', () => {
    const result = SignUpBodySchema.safeParse({ ...validBody, latitude: '30.0' });
    expect(result.success).toBe(false);
  });
});

describe('SignInBodySchema', () => {
  it('accepts valid email and password', () => {
    expect(SignInBodySchema.safeParse({ email: 'a@b.com', password: 'pass' }).success).toBe(true);
  });

  it('rejects missing email', () => {
    expect(SignInBodySchema.safeParse({ password: 'pass' }).success).toBe(false);
  });

  it('rejects missing password', () => {
    expect(SignInBodySchema.safeParse({ email: 'a@b.com' }).success).toBe(false);
  });

  it('rejects empty password', () => {
    expect(SignInBodySchema.safeParse({ email: 'a@b.com', password: '' }).success).toBe(false);
  });
});

describe('RefreshTokenBodySchema', () => {
  it('accepts non-empty token', () => {
    expect(RefreshTokenBodySchema.safeParse({ refreshToken: 'tok' }).success).toBe(true);
  });

  it('rejects missing token', () => {
    expect(RefreshTokenBodySchema.safeParse({}).success).toBe(false);
  });
});

describe('ForgotPasswordBodySchema', () => {
  it('rejects invalid email', () => {
    expect(ForgotPasswordBodySchema.safeParse({ email: 'bad' }).success).toBe(false);
  });

  it('accepts valid email', () => {
    expect(ForgotPasswordBodySchema.safeParse({ email: 'a@b.com' }).success).toBe(true);
  });
});

describe('ResetPasswordBodySchema', () => {
  it('rejects password shorter than 8 chars', () => {
    expect(ResetPasswordBodySchema.safeParse({ newPassword: 'short' }).success).toBe(false);
  });

  it('accepts password of 8+ chars', () => {
    expect(ResetPasswordBodySchema.safeParse({ newPassword: 'longpassword' }).success).toBe(true);
  });
});
