import { describe, it, expect, vi, beforeEach } from 'vitest';

// Inline the mock inside vi.hoisted — imported functions aren't available yet in ESM hoisting
const mockAuth = vi.hoisted(() => ({
  signUp: vi.fn(),
  signInWithPassword: vi.fn(),
  resetPasswordForEmail: vi.fn(),
  updateUser: vi.fn(),
  signOut: vi.fn(),
  getUser: vi.fn(),
  refreshSession: vi.fn(),
}));

vi.mock('@/shared/db/supabase.js', () => ({
  default: { auth: mockAuth },
  supabase: { auth: mockAuth },
}));

// Import AFTER mocking
const { AuthRepository } = await import('../../auth.repository.js');

describe('AuthRepository', () => {
  let repo: InstanceType<typeof AuthRepository>;

  beforeEach(() => {
    repo = new AuthRepository();
  });

  // ─── signUp ──────────────────────────────────────────────────────────

  describe('signUp', () => {
    it('should return data on successful signup', async () => {
      const mockUser = { id: 'uuid-1', email: 'test@example.com' };
      mockAuth.signUp.mockResolvedValue({ data: { user: mockUser }, error: null });

      const result = await repo.signUp({ email: 'test@example.com', password: 'pass123' });

      expect(result).toEqual({ user: mockUser });
      expect(mockAuth.signUp).toHaveBeenCalledWith({
        email: 'test@example.com',
        password: 'pass123',
        options: {
          data: {
            full_name: undefined,
            phone: undefined,
            address: undefined,
          },
        },
      });
    });

    it('should pass optional fields to supabase metadata', async () => {
      mockAuth.signUp.mockResolvedValue({ data: { user: {} }, error: null });

      await repo.signUp({
        email: 'test@example.com',
        password: 'pass123',
        fullName: 'John Doe',
        phone: '1234567890',
        address: '123 Main St',
      });

      expect(mockAuth.signUp).toHaveBeenCalledWith(
        expect.objectContaining({
          options: {
            data: {
              full_name: 'John Doe',
              phone: '1234567890',
              address: '123 Main St',
            },
          },
        }),
      );
    });

    it('should throw custom message when user already registered', async () => {
      mockAuth.signUp.mockResolvedValue({
        data: null,
        error: { message: 'User already registered' },
      });

      await expect(repo.signUp({ email: 'a@b.com', password: 'p' })).rejects.toThrow(
        'User with this email already exists',
      );
    });

    it('should throw custom message when user already exists', async () => {
      mockAuth.signUp.mockResolvedValue({
        data: null,
        error: { message: 'Email already exists in the system' },
      });

      await expect(repo.signUp({ email: 'a@b.com', password: 'p' })).rejects.toThrow(
        'User with this email already exists',
      );
    });

    it('should throw raw error for generic supabase errors', async () => {
      const rawError = new Error('Database connection failed');
      mockAuth.signUp.mockResolvedValue({ data: null, error: rawError });

      await expect(repo.signUp({ email: 'a@b.com', password: 'p' })).rejects.toThrow(
        'Database connection failed',
      );
    });
  });

  // ─── signIn ──────────────────────────────────────────────────────────

  describe('signIn', () => {
    it('should return data on successful sign-in', async () => {
      const mockData = { user: { id: 'uuid-1' }, session: { access_token: 'tok' } };
      mockAuth.signInWithPassword.mockResolvedValue({ data: mockData, error: null });

      const result = await repo.signIn({ email: 'a@b.com', password: 'pass' });

      expect(result).toEqual(mockData);
      expect(mockAuth.signInWithPassword).toHaveBeenCalledWith({
        email: 'a@b.com',
        password: 'pass',
      });
    });

    it('should throw on invalid credentials', async () => {
      mockAuth.signInWithPassword.mockResolvedValue({
        data: null,
        error: new Error('Invalid login credentials'),
      });

      await expect(repo.signIn({ email: 'a@b.com', password: 'wrong' })).rejects.toThrow(
        'Invalid login credentials',
      );
    });
  });

  // ─── requestPasswordReset ────────────────────────────────────────────

  describe('requestPasswordReset', () => {
    it('should call resetPasswordForEmail with correct redirect URL', async () => {
      mockAuth.resetPasswordForEmail.mockResolvedValue({ data: {}, error: null });

      const result = await repo.requestPasswordReset('a@b.com');

      expect(result).toEqual({});
      expect(mockAuth.resetPasswordForEmail).toHaveBeenCalledWith('a@b.com', {
        redirectTo: 'fixitapp://reset-password',
      });
    });

    it('should throw on error', async () => {
      mockAuth.resetPasswordForEmail.mockResolvedValue({
        data: null,
        error: { message: 'Rate limit exceeded', status: 429, name: 'AuthApiError' },
      });

      await expect(repo.requestPasswordReset('a@b.com')).rejects.toMatchObject({
        message: 'Rate limit exceeded',
      });
    });
  });

  // ─── resetPassword ──────────────────────────────────────────────────

  describe('resetPassword', () => {
    it('should call updateUser with new password', async () => {
      const mockData = { user: { id: 'uuid-1' } };
      mockAuth.updateUser.mockResolvedValue({ data: mockData, error: null });

      const result = await repo.resetPassword('newPass123');

      expect(result).toEqual(mockData);
      expect(mockAuth.updateUser).toHaveBeenCalledWith({ password: 'newPass123' });
    });

    it('should throw on error', async () => {
      mockAuth.updateUser.mockResolvedValue({
        data: null,
        error: new Error('Password too weak'),
      });

      await expect(repo.resetPassword('123')).rejects.toThrow('Password too weak');
    });
  });

  // ─── signOut ─────────────────────────────────────────────────────────

  describe('signOut', () => {
    it('should return success message on successful sign-out', async () => {
      mockAuth.signOut.mockResolvedValue({ error: null });

      const result = await repo.signOut('some-token');

      expect(result).toEqual({ success: true, message: 'Logged out successfully' });
    });

    it('should throw on error', async () => {
      mockAuth.signOut.mockResolvedValue({ error: new Error('Session not found') });

      await expect(repo.signOut('bad-token')).rejects.toThrow('Session not found');
    });
  });

  // ─── getUser ─────────────────────────────────────────────────────────

  describe('getUser', () => {
    it('should return user object (not full data wrapper)', async () => {
      const mockUser = { id: 'uuid-1', email: 'a@b.com' };
      mockAuth.getUser.mockResolvedValue({ data: { user: mockUser }, error: null });

      const result = await repo.getUser('access-token');

      expect(result).toEqual(mockUser);
      expect(mockAuth.getUser).toHaveBeenCalledWith('access-token');
    });

    it('should throw on invalid token', async () => {
      mockAuth.getUser.mockResolvedValue({
        data: { user: null },
        error: new Error('Invalid token'),
      });

      await expect(repo.getUser('bad-token')).rejects.toThrow('Invalid token');
    });
  });

  // ─── refreshToken ───────────────────────────────────────────────────

  describe('refreshToken', () => {
    it('should call refreshSession with refresh_token key', async () => {
      const mockData = { session: { access_token: 'new-tok' }, user: { id: 'uuid-1' } };
      mockAuth.refreshSession.mockResolvedValue({ data: mockData, error: null });

      const result = await repo.refreshToken('refresh-tok');

      expect(result).toEqual(mockData);
      expect(mockAuth.refreshSession).toHaveBeenCalledWith({ refresh_token: 'refresh-tok' });
    });

    it('should throw on expired refresh token', async () => {
      mockAuth.refreshSession.mockResolvedValue({
        data: null,
        error: new Error('Refresh token expired'),
      });

      await expect(repo.refreshToken('expired-tok')).rejects.toThrow('Refresh token expired');
    });
  });
});
