import { beforeEach, describe, expect, it, vi } from 'vitest';
import { createMockReq, createMockRes } from '../../../../../tests/mocks/express.mock.js';

const { mockService } = vi.hoisted(() => ({
  mockService: {
    signUp: vi.fn(),
    signIn: vi.fn(),
    signOut: vi.fn(),
    getCurrentUser: vi.fn(),
    refreshSession: vi.fn(),
    requestPasswordReset: vi.fn(),
    updatePassword: vi.fn(),
  },
}));

vi.mock('../../auth.service.js', () => ({
  authService: mockService,
}));

const { authController } = await import('../../auth.controller.js');
const { AppError } = await import('../../../../shared/errors/app-error.js');

// asyncHandler dispatches the inner promise but returns undefined synchronously
// (see shared/errors/async-handler.ts). Tests must flush the microtask queue
// after invoking the handler so `next` / `res` assertions are deterministic.
async function runHandler(
  handler: (req: any, res: any, next: any) => void,
  req: any,
  res: any,
): Promise<{ next: ReturnType<typeof vi.fn> }> {
  const next = vi.fn();
  handler(req, res, next);
  await new Promise((resolve) => setImmediate(resolve));
  return { next };
}

function mockReq(overrides: Record<string, unknown> = {}) {
  const req = createMockReq(overrides as never) as any;
  req.log = { info: vi.fn(), warn: vi.fn(), error: vi.fn(), debug: vi.fn() };
  return req;
}

describe('AuthController', () => {
  beforeEach(() => {
    for (const m of Object.values(mockService)) {
      m.mockReset();
    }
  });

  // ── signUp ────────────────────────────────────────────────────────────────
  describe('signUp', () => {
    const validBody = {
      email: 'a@b.com',
      password: 'pass123',
      fullName: 'John',
      phone: '555',
      city: 'Amman',
      street: 'Main',
    };

    it('returns 201 with the service payload on success', async () => {
      const payload = { user: { id: 'u1', email: 'a@b.com' }, message: 'Registered' };
      mockService.signUp.mockResolvedValue(payload);

      const req = mockReq({ body: validBody });
      const res = createMockRes();
      const { next } = await runHandler(authController.signUp, req, res);

      expect(res.statusCode).toBe(201);
      expect(res.body).toEqual(payload);
      expect(next).not.toHaveBeenCalled();
    });

    it('forwards service errors via next() without writing a response', async () => {
      const err = new Error('User exists');
      mockService.signUp.mockRejectedValue(err);

      const req = mockReq({ body: validBody });
      const res = createMockRes();
      const { next } = await runHandler(authController.signUp, req, res);

      expect(next).toHaveBeenCalledTimes(1);
      expect(next.mock.calls[0]?.[0]).toBe(err);
      expect(res.status).not.toHaveBeenCalled();
      expect(res.json).not.toHaveBeenCalled();
    });
  });

  // ── signIn ────────────────────────────────────────────────────────────────
  describe('signIn', () => {
    it('returns 200 with the service payload on success', async () => {
      const payload = { user: { id: 'u1' }, session: { accessToken: 'at' } };
      mockService.signIn.mockResolvedValue(payload);

      const req = mockReq({ body: { email: 'a@b.com', password: 'pass123' } });
      const res = createMockRes();
      const { next } = await runHandler(authController.signIn, req, res);

      expect(res.statusCode).toBe(200);
      expect(res.body).toEqual(payload);
      expect(next).not.toHaveBeenCalled();
    });

    it('forwards service errors via next()', async () => {
      mockService.signIn.mockRejectedValue(new Error('Invalid credentials'));

      const req = mockReq({ body: { email: 'a@b.com', password: 'wrong' } });
      const res = createMockRes();
      const { next } = await runHandler(authController.signIn, req, res);

      expect(next).toHaveBeenCalledTimes(1);
      expect(next.mock.calls[0]?.[0]).toBeInstanceOf(Error);
    });
  });

  // ── signOut ───────────────────────────────────────────────────────────────
  describe('signOut', () => {
    it('strips Bearer prefix and forwards the bare token to the service', async () => {
      mockService.signOut.mockResolvedValue({ success: true });

      const req = mockReq({ headers: { authorization: 'Bearer abc123' } });
      const res = createMockRes();
      const { next } = await runHandler(authController.signOut, req, res);

      expect(mockService.signOut).toHaveBeenCalledWith('abc123');
      expect(res.statusCode).toBe(200);
      expect(next).not.toHaveBeenCalled();
    });

    it('passes through a token that lacks the Bearer prefix unchanged', async () => {
      mockService.signOut.mockResolvedValue({ success: true });

      const req = mockReq({ headers: { authorization: 'raw-token' } });
      const res = createMockRes();
      await runHandler(authController.signOut, req, res);

      expect(mockService.signOut).toHaveBeenCalledWith('raw-token');
    });

    it('calls next(AppError.unauthorized) when no Authorization header is present', async () => {
      const req = mockReq({ headers: {} });
      const res = createMockRes();
      const { next } = await runHandler(authController.signOut, req, res);

      expect(next).toHaveBeenCalledTimes(1);
      const err = next.mock.calls[0]?.[0];
      expect(err).toBeInstanceOf(AppError);
      expect(err.code).toBe('UNAUTHENTICATED');
      expect(err.status).toBe(401);
      expect(err.opts.token).toBe('no_token');
      expect(mockService.signOut).not.toHaveBeenCalled();
      expect(res.status).not.toHaveBeenCalled();
    });
  });

  // ── getCurrentUser ────────────────────────────────────────────────────────
  describe('getCurrentUser', () => {
    it('returns the user attached by requireUserAuth middleware', async () => {
      const user = { id: 'u1', email: 'a@b.com' };
      const req = mockReq({});
      (req as any).user = user;
      const res = createMockRes();
      const { next } = await runHandler(authController.getCurrentUser, req, res);

      expect(res.statusCode).toBe(200);
      expect(res.body).toEqual({ user });
      expect(next).not.toHaveBeenCalled();
    });
  });

  // ── refreshToken ──────────────────────────────────────────────────────────
  describe('refreshToken', () => {
    it('returns 200 with the new session on success', async () => {
      const payload = { user: { id: 'u1' }, session: { accessToken: 'new-at' } };
      mockService.refreshSession.mockResolvedValue(payload);

      const req = mockReq({ body: { refreshToken: 'old-rt' } });
      const res = createMockRes();
      await runHandler(authController.refreshToken, req, res);

      expect(mockService.refreshSession).toHaveBeenCalledWith('old-rt');
      expect(res.statusCode).toBe(200);
      expect(res.body).toEqual(payload);
    });

    it('forwards service errors via next()', async () => {
      mockService.refreshSession.mockRejectedValue(new Error('Invalid refresh token'));

      const req = mockReq({ body: { refreshToken: 'bad' } });
      const res = createMockRes();
      const { next } = await runHandler(authController.refreshToken, req, res);

      expect(next).toHaveBeenCalledTimes(1);
    });
  });

  // ── requestPasswordReset ──────────────────────────────────────────────────
  describe('requestPasswordReset', () => {
    it('returns 200 with the canned success message', async () => {
      mockService.requestPasswordReset.mockResolvedValue({});

      const req = mockReq({ body: { email: 'a@b.com' } });
      const res = createMockRes();
      await runHandler(authController.requestPasswordReset, req, res);

      expect(mockService.requestPasswordReset).toHaveBeenCalledWith('a@b.com');
      expect(res.statusCode).toBe(200);
      expect(res.body).toEqual({
        message: 'Password reset email sent. Please check your inbox.',
      });
    });

    it('forwards service errors via next()', async () => {
      mockService.requestPasswordReset.mockRejectedValue(new Error('Rate limit'));

      const req = mockReq({ body: { email: 'a@b.com' } });
      const res = createMockRes();
      const { next } = await runHandler(authController.requestPasswordReset, req, res);

      expect(next).toHaveBeenCalledTimes(1);
    });
  });

  // ── resetPassword ─────────────────────────────────────────────────────────
  describe('resetPassword', () => {
    it('returns 200 with success message + user', async () => {
      mockService.updatePassword.mockResolvedValue({ user: { id: 'u1' } });

      const req = mockReq({ body: { newPassword: 'newPass123' } });
      const res = createMockRes();
      await runHandler(authController.resetPassword, req, res);

      expect(mockService.updatePassword).toHaveBeenCalledWith('newPass123');
      expect(res.statusCode).toBe(200);
      expect(res.body).toEqual({
        message: 'Password updated successfully',
        user: { id: 'u1' },
      });
    });

    it('forwards service errors via next()', async () => {
      mockService.updatePassword.mockRejectedValue(new Error('Password too weak'));

      const req = mockReq({ body: { newPassword: '123' } });
      const res = createMockRes();
      const { next } = await runHandler(authController.resetPassword, req, res);

      expect(next).toHaveBeenCalledTimes(1);
    });
  });
});
