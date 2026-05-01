import { describe, it, expect, vi, beforeEach } from 'vitest';
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

const { AuthController } = await import('../../auth.controller.js');

describe('AuthController', () => {
  let controller: InstanceType<typeof AuthController>;

  beforeEach(() => {
    controller = new AuthController();
  });

  describe('signUp', () => {
    it('should return 201 on successful signup', async () => {
      const resultData = { user: { id: 'uuid-1', email: 'a@b.com' }, message: 'Registered' };
      mockService.signUp.mockResolvedValue(resultData);

      const req = createMockReq({
        body: { email: 'a@b.com', password: 'pass123', fullName: 'John', city: 'Amman', street: 'Main' },
      });
      const res = createMockRes();

      await controller.signUp(req, res);

      expect(res.statusCode).toBe(201);
      expect(res.body).toEqual(resultData);
    });

    it('should return 400 when service throws', async () => {
      mockService.signUp.mockRejectedValue(new Error('User with this email already exists'));

      const req = createMockReq({ body: { email: 'a@b.com', password: 'pass123' } });
      const res = createMockRes();

      await controller.signUp(req, res);

      expect(res.statusCode).toBe(400);
      expect(res.body).toEqual({ error: 'User with this email already exists' });
    });
  });

  describe('signIn', () => {
    it('should return 200 on successful sign-in', async () => {
      const resultData = { user: { id: 'uuid-1' }, session: { accessToken: 'at' } };
      mockService.signIn.mockResolvedValue(resultData);

      const req = createMockReq({ body: { email: 'a@b.com', password: 'pass123' } });
      const res = createMockRes();

      await controller.signIn(req, res);

      expect(res.statusCode).toBe(200);
      expect(res.body).toEqual(resultData);
    });

    it('should return 401 when service throws', async () => {
      mockService.signIn.mockRejectedValue(new Error('Invalid credentials'));

      const req = createMockReq({ body: { email: 'a@b.com', password: 'wrong' } });
      const res = createMockRes();

      await controller.signIn(req, res);

      expect(res.statusCode).toBe(401);
      expect(res.body).toEqual({ error: 'Invalid credentials' });
    });
  });

  describe('signOut', () => {
    it('should return 200 and strip Bearer prefix from token', async () => {
      mockService.signOut.mockResolvedValue({ success: true, message: 'Logged out successfully' });

      const req = createMockReq({ headers: { authorization: 'Bearer abc123' } });
      const res = createMockRes();

      await controller.signOut(req, res);

      expect(mockService.signOut).toHaveBeenCalledWith('abc123');
      expect(res.statusCode).toBe(200);
    });

    it('should pass through token without Bearer prefix', async () => {
      mockService.signOut.mockResolvedValue({ success: true });

      const req = createMockReq({ headers: { authorization: 'raw-token' } });
      const res = createMockRes();

      await controller.signOut(req, res);

      expect(mockService.signOut).toHaveBeenCalledWith('raw-token');
    });

    it('should return 401 when no authorization header', async () => {
      const req = createMockReq({ headers: {} });
      const res = createMockRes();

      await controller.signOut(req, res);

      expect(res.statusCode).toBe(401);
      expect(res.body).toEqual({ error: 'No token provided' });
      expect(mockService.signOut).not.toHaveBeenCalled();
    });

    it('should return 400 when service throws', async () => {
      mockService.signOut.mockRejectedValue(new Error('Session not found'));

      const req = createMockReq({ headers: { authorization: 'Bearer tok' } });
      const res = createMockRes();

      await controller.signOut(req, res);

      expect(res.statusCode).toBe(400);
      expect(res.body).toEqual({ error: 'Session not found' });
    });
  });

  describe('getCurrentUser', () => {
    it('should return 200 with user data', async () => {
      const mockUser = { id: 'uuid-1', email: 'a@b.com' };
      mockService.getCurrentUser.mockResolvedValue(mockUser);

      const req = createMockReq({ headers: { authorization: 'Bearer tok' } });
      const res = createMockRes();

      await controller.getCurrentUser(req, res);

      expect(res.statusCode).toBe(200);
      expect(res.body).toEqual({ user: mockUser });
    });

    it('should return 401 when no token provided', async () => {
      const req = createMockReq({ headers: {} });
      const res = createMockRes();

      await controller.getCurrentUser(req, res);

      expect(res.statusCode).toBe(401);
      expect(res.body).toEqual({ error: 'No token provided' });
      expect(mockService.getCurrentUser).not.toHaveBeenCalled();
    });

    it('should return 401 when service throws', async () => {
      mockService.getCurrentUser.mockRejectedValue(new Error('Token expired'));

      const req = createMockReq({ headers: { authorization: 'Bearer expired-tok' } });
      const res = createMockRes();

      await controller.getCurrentUser(req, res);

      expect(res.statusCode).toBe(401);
      expect(res.body).toEqual({ error: 'Token expired' });
    });
  });

  describe('refreshToken', () => {
    it('should return 200 on successful refresh', async () => {
      const resultData = { session: { accessToken: 'new-at' } };
      mockService.refreshSession.mockResolvedValue(resultData);

      const req = createMockReq({ body: { refreshToken: 'old-rt' } });
      const res = createMockRes();

      await controller.refreshToken(req, res);

      expect(res.statusCode).toBe(200);
      expect(res.body).toEqual(resultData);
    });

    it('should return 401 when service throws', async () => {
      mockService.refreshSession.mockRejectedValue(new Error('Invalid refresh token'));

      const req = createMockReq({ body: { refreshToken: 'bad-rt' } });
      const res = createMockRes();

      await controller.refreshToken(req, res);

      expect(res.statusCode).toBe(401);
      expect(res.body).toEqual({ error: 'Invalid refresh token' });
    });
  });

  describe('requestPasswordReset', () => {
    it('should return 200 with its own success message', async () => {
      mockService.requestPasswordReset.mockResolvedValue({});

      const req = createMockReq({ body: { email: 'a@b.com' } });
      const res = createMockRes();

      await controller.requestPasswordReset(req, res);

      expect(res.statusCode).toBe(200);
      expect(res.body).toEqual({ message: 'Password reset email sent. Please check your inbox.' });
    });

    it('should return 400 when service throws', async () => {
      mockService.requestPasswordReset.mockRejectedValue(new Error('Rate limit exceeded'));

      const req = createMockReq({ body: { email: 'a@b.com' } });
      const res = createMockRes();

      await controller.requestPasswordReset(req, res);

      expect(res.statusCode).toBe(400);
      expect(res.body).toEqual({ error: 'Rate limit exceeded' });
    });
  });

  describe('resetPassword', () => {
    it('should return 200 with success message and user', async () => {
      mockService.updatePassword.mockResolvedValue({ user: { id: 'uuid-1' } });

      const req = createMockReq({ body: { newPassword: 'newPass123' } });
      const res = createMockRes();

      await controller.resetPassword(req, res);

      expect(res.statusCode).toBe(200);
      expect(res.body).toEqual({
        message: 'Password updated successfully',
        user: { id: 'uuid-1' },
      });
    });

    it('should return 400 when service throws', async () => {
      mockService.updatePassword.mockRejectedValue(new Error('Password too weak'));

      const req = createMockReq({ body: { newPassword: '123' } });
      const res = createMockRes();

      await controller.resetPassword(req, res);

      expect(res.statusCode).toBe(400);
      expect(res.body).toEqual({ error: 'Password too weak' });
    });
  });
});
