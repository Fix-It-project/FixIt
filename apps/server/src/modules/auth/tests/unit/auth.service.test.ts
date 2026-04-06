import { describe, it, expect, vi, beforeEach } from 'vitest';

// ─── Hoisted mocks (ESM-compatible) ───────────────────────────────────────────

const { mockAuthRepo, mockUsersRepo, mockAddressesRepo } = vi.hoisted(() => ({
  mockAuthRepo: {
    signUp: vi.fn(),
    signIn: vi.fn(),
    signOut: vi.fn(),
    getUser: vi.fn(),
    refreshToken: vi.fn(),
    requestPasswordReset: vi.fn(),
    resetPassword: vi.fn(),
  },
  mockUsersRepo: {
    createUser: vi.fn(),
    getUserByEmail: vi.fn(),
  },
  mockAddressesRepo: {
    createAddress: vi.fn(),
  },
}));

vi.mock('../../auth.repository.js', () => ({
  authRepository: mockAuthRepo,
}));

vi.mock('../../../users/index.js', () => ({
  usersRepository: mockUsersRepo,
}));

vi.mock('../../../addresses/index.js', () => ({
  addressesRepository: mockAddressesRepo,
}));

// Import AFTER mocking
const { AuthService } = await import('../../auth.service.js');

describe('AuthService', () => {
  let service: InstanceType<typeof AuthService>;

  beforeEach(() => {
    service = new AuthService();
  });

  // ─── signUp ──────────────────────────────────────────────────────────

  describe('signUp', () => {
    const signUpData = { email: 'test@example.com', password: 'pass123', fullName: 'John Doe', phone: '555-0100' };
    const addressData = {
      city: 'Amman',
      street: 'Main St',
      building_no: '10',
      apartment_no: '3A',
      latitude: 31.95,
      longitude: 35.93,
    };

    it('should create user and address records on successful signup', async () => {
      mockAuthRepo.signUp.mockResolvedValue({ user: { id: 'uuid-1', email: 'test@example.com' } });
      mockUsersRepo.createUser.mockResolvedValue({});
      mockAddressesRepo.createAddress.mockResolvedValue({});

      const result = await service.signUp(signUpData, addressData);

      expect(mockUsersRepo.createUser).toHaveBeenCalledWith({
        id: 'uuid-1',
        email: 'test@example.com',
        fullName: 'John Doe',
        phone: '555-0100',
      });

      expect(mockAddressesRepo.createAddress).toHaveBeenCalledWith({
        user_id: 'uuid-1',
        city: 'Amman',
        street: 'Main St',
        building_no: '10',
        apartment_no: '3A',
        latitude: 31.95,
        longitude: 35.93,
      });

      expect(result).toEqual({
        user: { id: 'uuid-1', email: 'test@example.com' },
        message: 'User registered successfully. Please sign in to continue.',
      });
    });

    it('should NOT create user/address records when result.user is null', async () => {
      mockAuthRepo.signUp.mockResolvedValue({ user: null });

      const result = await service.signUp(signUpData, addressData);

      expect(mockUsersRepo.createUser).not.toHaveBeenCalled();
      expect(mockAddressesRepo.createAddress).not.toHaveBeenCalled();
      expect(result.user).toEqual({ id: undefined, email: undefined });
    });

    it('should coerce undefined latitude/longitude to null', async () => {
      mockAuthRepo.signUp.mockResolvedValue({ user: { id: 'uuid-1', email: 'a@b.com' } });
      mockUsersRepo.createUser.mockResolvedValue({});
      mockAddressesRepo.createAddress.mockResolvedValue({});

      await service.signUp(signUpData, {
        city: 'Amman',
        street: 'Main St',
        building_no: '10',
        apartment_no: '3A',
      });

      expect(mockAddressesRepo.createAddress).toHaveBeenCalledWith(
        expect.objectContaining({ latitude: null, longitude: null }),
      );
    });

    it('should propagate authRepository.signUp errors', async () => {
      mockAuthRepo.signUp.mockRejectedValue(new Error('Signup failed'));

      await expect(service.signUp(signUpData, addressData)).rejects.toThrow('Signup failed');
    });

    it('should propagate usersRepository.createUser errors', async () => {
      mockAuthRepo.signUp.mockResolvedValue({ user: { id: 'uuid-1', email: 'a@b.com' } });
      mockUsersRepo.createUser.mockRejectedValue(new Error('DB error'));

      await expect(service.signUp(signUpData, addressData)).rejects.toThrow('DB error');
    });

    it('should propagate addressesRepository.createAddress errors', async () => {
      mockAuthRepo.signUp.mockResolvedValue({ user: { id: 'uuid-1', email: 'a@b.com' } });
      mockUsersRepo.createUser.mockResolvedValue({});
      mockAddressesRepo.createAddress.mockRejectedValue(new Error('Address DB error'));

      await expect(service.signUp(signUpData, addressData)).rejects.toThrow('Address DB error');
    });
  });

  // ─── signIn ──────────────────────────────────────────────────────────

  describe('signIn', () => {
    const signInData = { email: 'test@example.com', password: 'pass123' };

    it('should return transformed session shape on successful sign-in', async () => {
      mockAuthRepo.signIn.mockResolvedValue({
        user: { id: 'uuid-1', email: 'test@example.com' },
        session: { access_token: 'at', refresh_token: 'rt', expires_at: 1234567890 },
      });
      mockUsersRepo.getUserByEmail.mockResolvedValue({ id: 'uuid-1', email: 'test@example.com' });

      const result = await service.signIn(signInData);

      expect(mockAuthRepo.signIn).toHaveBeenCalledWith(signInData);
      expect(mockUsersRepo.getUserByEmail).toHaveBeenCalledWith('test@example.com');
      expect(result).toEqual({
        user: { id: 'uuid-1', email: 'test@example.com' },
        session: { accessToken: 'at', refreshToken: 'rt', expiresAt: 1234567890 },
      });
    });

    it('should reject sign-in when no user record exists (technician guard)', async () => {
      mockAuthRepo.signIn.mockResolvedValue({
        user: { id: 'uuid-1' },
        session: { access_token: 'at' },
      });
      mockUsersRepo.getUserByEmail.mockResolvedValue(null);

      await expect(service.signIn(signInData)).rejects.toMatchObject({
        message: 'No user account found for this email',
        status: 403,
      });

      expect(mockAuthRepo.signOut).toHaveBeenCalledWith('at');
    });

    it('should call signOut with empty string when session is undefined', async () => {
      mockAuthRepo.signIn.mockResolvedValue({ user: { id: 'uuid-1' }, session: undefined });
      mockUsersRepo.getUserByEmail.mockResolvedValue(null);

      await expect(service.signIn(signInData)).rejects.toMatchObject({
        message: 'No user account found for this email',
        status: 403,
      });

      expect(mockAuthRepo.signOut).toHaveBeenCalledWith('');
    });

    it('should propagate authRepository.signIn errors', async () => {
      mockAuthRepo.signIn.mockRejectedValue(new Error('Invalid credentials'));

      await expect(service.signIn(signInData)).rejects.toThrow('Invalid credentials');
      expect(mockUsersRepo.getUserByEmail).not.toHaveBeenCalled();
    });
  });

  // ─── signOut ─────────────────────────────────────────────────────────

  describe('signOut', () => {
    it('should delegate to authRepository.signOut', async () => {
      mockAuthRepo.signOut.mockResolvedValue({ success: true, message: 'Logged out successfully' });

      const result = await service.signOut('token');

      expect(mockAuthRepo.signOut).toHaveBeenCalledWith('token');
      expect(result).toEqual({ success: true, message: 'Logged out successfully' });
    });
  });

  // ─── getCurrentUser ──────────────────────────────────────────────────

  describe('getCurrentUser', () => {
    it('should delegate to authRepository.getUser', async () => {
      const mockUser = { id: 'uuid-1', email: 'a@b.com' };
      mockAuthRepo.getUser.mockResolvedValue(mockUser);

      const result = await service.getCurrentUser('token');

      expect(mockAuthRepo.getUser).toHaveBeenCalledWith('token');
      expect(result).toEqual(mockUser);
    });
  });

  // ─── refreshSession ─────────────────────────────────────────────────

  describe('refreshSession', () => {
    it('should transform session keys from snake_case to camelCase', async () => {
      mockAuthRepo.refreshToken.mockResolvedValue({
        user: { id: 'uuid-1' },
        session: { access_token: 'new-at', refresh_token: 'new-rt', expires_at: 9999 },
      });

      const result = await service.refreshSession('old-rt');

      expect(mockAuthRepo.refreshToken).toHaveBeenCalledWith('old-rt');
      expect(result).toEqual({
        user: { id: 'uuid-1' },
        session: { accessToken: 'new-at', refreshToken: 'new-rt', expiresAt: 9999 },
      });
    });

    it('should handle undefined session gracefully', async () => {
      mockAuthRepo.refreshToken.mockResolvedValue({ user: null, session: undefined });

      const result = await service.refreshSession('rt');

      expect(mockAuthRepo.refreshToken).toHaveBeenCalledWith('rt');
      expect(result.session).toEqual({
        accessToken: undefined,
        refreshToken: undefined,
        expiresAt: undefined,
      });
    });
  });

  // ─── requestPasswordReset ────────────────────────────────────────────

  describe('requestPasswordReset', () => {
    it('should delegate to authRepository.requestPasswordReset', async () => {
      mockAuthRepo.requestPasswordReset.mockResolvedValue({});

      const result = await service.requestPasswordReset('a@b.com');

      expect(mockAuthRepo.requestPasswordReset).toHaveBeenCalledWith('a@b.com');
      expect(result).toEqual({});
    });
  });

  // ─── updatePassword ─────────────────────────────────────────────────

  describe('updatePassword', () => {
    it('should delegate to authRepository.resetPassword', async () => {
      const mockData = { user: { id: 'uuid-1' } };
      mockAuthRepo.resetPassword.mockResolvedValue(mockData);

      const result = await service.updatePassword('newPass');

      expect(mockAuthRepo.resetPassword).toHaveBeenCalledWith('newPass');
      expect(result).toEqual(mockData);
    });
  });
});
