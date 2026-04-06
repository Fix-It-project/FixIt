import { describe, it, expect, vi, beforeEach } from 'vitest';

const mockAuth = vi.hoisted(() => ({
  signUp: vi.fn(),
  signInWithPassword: vi.fn(),
  signOut: vi.fn(),
  getUser: vi.fn(),
  refreshSession: vi.fn(),
}));

vi.mock('@/shared/db/supabase.js', () => ({
  default: { auth: mockAuth },
}));

const { TechnicianAuthRepository } = await import('../../technician-auth.repository.js');

describe('TechnicianAuthRepository', () => {
  let repo: InstanceType<typeof TechnicianAuthRepository>;

  beforeEach(() => {
    repo = new TechnicianAuthRepository();
  });

  describe('signUp', () => {
    const signUpData = {
      email: 'tech@example.com',
      password: 'pass123',
      first_name: 'Jane',
      last_name: 'Doe',
      phone: '555-0100',
      category_id: 'cat-1',
    };

    it('should return data on successful signup with technician metadata', async () => {
      const data = { user: { id: 'tech-1', email: 'tech@example.com' } };
      mockAuth.signUp.mockResolvedValue({ data, error: null });

      const result = await repo.signUp(signUpData);

      expect(result).toEqual(data);
      expect(mockAuth.signUp).toHaveBeenCalledWith({
        email: 'tech@example.com',
        password: 'pass123',
        options: {
          data: {
            first_name: 'Jane',
            last_name: 'Doe',
            phone: '555-0100',
            role: 'technician',
          },
        },
      });
    });

    it('should map already registered errors to friendly duplicate message', async () => {
      mockAuth.signUp.mockResolvedValue({
        data: null,
        error: { message: 'User already registered' },
      });

      await expect(repo.signUp(signUpData)).rejects.toThrow(
        'A technician with this email already exists',
      );
    });

    it('should map already exists errors to friendly duplicate message', async () => {
      mockAuth.signUp.mockResolvedValue({
        data: null,
        error: { message: 'Email already exists in the system' },
      });

      await expect(repo.signUp(signUpData)).rejects.toThrow(
        'A technician with this email already exists',
      );
    });

    it('should rethrow unrelated signup errors', async () => {
      const error = new Error('Database offline');
      mockAuth.signUp.mockResolvedValue({ data: null, error });

      await expect(repo.signUp(signUpData)).rejects.toThrow('Database offline');
    });
  });

  describe('signIn', () => {
    it('should delegate to signInWithPassword and return data', async () => {
      const data = { user: { id: 'tech-1' }, session: { access_token: 'token' } };
      mockAuth.signInWithPassword.mockResolvedValue({ data, error: null });

      const result = await repo.signIn('tech@example.com', 'pass123');

      expect(result).toEqual(data);
      expect(mockAuth.signInWithPassword).toHaveBeenCalledWith({
        email: 'tech@example.com',
        password: 'pass123',
      });
    });

    it('should propagate sign-in errors', async () => {
      mockAuth.signInWithPassword.mockResolvedValue({
        data: null,
        error: new Error('Invalid login credentials'),
      });

      await expect(repo.signIn('tech@example.com', 'wrong')).rejects.toThrow(
        'Invalid login credentials',
      );
    });
  });

  describe('signOut', () => {
    it('should ignore the token argument and return success', async () => {
      mockAuth.signOut.mockResolvedValue({ error: null });

      const result = await repo.signOut('ignored-token');

      expect(mockAuth.signOut).toHaveBeenCalledWith();
      expect(result).toEqual({ success: true, message: 'Logged out successfully' });
    });

    it('should propagate sign-out errors', async () => {
      mockAuth.signOut.mockResolvedValue({ error: new Error('Session not found') });

      await expect(repo.signOut('ignored-token')).rejects.toThrow('Session not found');
    });
  });

  describe('getUser', () => {
    it('should return the unwrapped user object', async () => {
      const user = { id: 'tech-1', email: 'tech@example.com' };
      mockAuth.getUser.mockResolvedValue({ data: { user }, error: null });

      const result = await repo.getUser('access-token');

      expect(result).toEqual(user);
      expect(mockAuth.getUser).toHaveBeenCalledWith('access-token');
    });

    it('should propagate getUser errors', async () => {
      mockAuth.getUser.mockResolvedValue({
        data: { user: null },
        error: new Error('Invalid token'),
      });

      await expect(repo.getUser('bad-token')).rejects.toThrow('Invalid token');
    });
  });

  describe('refreshToken', () => {
    it('should call refreshSession with refresh_token key and return data', async () => {
      const data = { user: { id: 'tech-1' }, session: { access_token: 'new-token' } };
      mockAuth.refreshSession.mockResolvedValue({ data, error: null });

      const result = await repo.refreshToken('refresh-token');

      expect(result).toEqual(data);
      expect(mockAuth.refreshSession).toHaveBeenCalledWith({ refresh_token: 'refresh-token' });
    });

    it('should propagate refresh token errors', async () => {
      mockAuth.refreshSession.mockResolvedValue({
        data: null,
        error: new Error('Refresh token expired'),
      });

      await expect(repo.refreshToken('expired-token')).rejects.toThrow('Refresh token expired');
    });
  });
});
