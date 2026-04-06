import { describe, it, expect, vi, beforeEach } from 'vitest';
import type { DocumentFiles } from '../../../../shared/storage/storage.repository.js';

const { mockAuthRepo, mockTechniciansRepo, mockStorageRepo, mockAddressesRepo } = vi.hoisted(() => ({
  mockAuthRepo: {
    signUp: vi.fn(),
    signIn: vi.fn(),
    signOut: vi.fn(),
    getUser: vi.fn(),
    refreshToken: vi.fn(),
  },
  mockTechniciansRepo: {
    emailExists: vi.fn(),
    createTechnician: vi.fn(),
    getTechnicianByEmail: vi.fn(),
  },
  mockStorageRepo: {
    uploadDocuments: vi.fn(),
  },
  mockAddressesRepo: {
    createAddress: vi.fn(),
  },
}));

vi.mock('../../technician-auth.repository.js', () => ({
  technicianAuthRepository: mockAuthRepo,
}));

vi.mock('../../../technicians/index.js', () => ({
  techniciansRepository: mockTechniciansRepo,
}));

vi.mock('../../../../shared/storage/storage.repository.js', () => ({
  storageRepository: mockStorageRepo,
}));

vi.mock('../../../addresses/index.js', () => ({
  addressesRepository: mockAddressesRepo,
}));

const { TechnicianAuthService } = await import('../../technician-auth.service.js');

describe('TechnicianAuthService', () => {
  let service: InstanceType<typeof TechnicianAuthService>;

  beforeEach(() => {
    service = new TechnicianAuthService();
  });

  describe('checkEmailExists', () => {
    it('should delegate to techniciansRepository.emailExists', async () => {
      mockTechniciansRepo.emailExists.mockResolvedValue(true);

      const result = await service.checkEmailExists('tech@example.com');

      expect(mockTechniciansRepo.emailExists).toHaveBeenCalledWith('tech@example.com');
      expect(result).toBe(true);
    });
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
    const files: DocumentFiles = {
      criminal_record: { originalname: 'criminal.pdf' } as Express.Multer.File,
      birth_certificate: { originalname: 'birth.pdf' } as Express.Multer.File,
      national_id: { originalname: 'id.pdf' } as Express.Multer.File,
    };
    const addressData = {
      city: 'Amman',
      street: 'Main St',
      building_no: '10',
      apartment_no: '3A',
      latitude: 31.95,
      longitude: 35.93,
    };

    it('should complete the full sign-up flow and return technician summary', async () => {
      mockTechniciansRepo.emailExists.mockResolvedValue(false);
      mockAuthRepo.signUp.mockResolvedValue({ user: { id: 'tech-1', email: 'tech@example.com' } });
      mockStorageRepo.uploadDocuments.mockResolvedValue({
        criminal_record: 'https://files/criminal.pdf',
        birth_certificate: 'https://files/birth.pdf',
        national_id: 'https://files/id.pdf',
      });
      mockTechniciansRepo.createTechnician.mockResolvedValue({});
      mockAddressesRepo.createAddress.mockResolvedValue({});

      const result = await service.signUp(signUpData, files, addressData);

      expect(mockTechniciansRepo.emailExists).toHaveBeenCalledWith('tech@example.com');
      expect(mockAuthRepo.signUp).toHaveBeenCalledWith(signUpData);
      expect(mockStorageRepo.uploadDocuments).toHaveBeenCalledWith('tech-1', files);
      expect(mockTechniciansRepo.createTechnician).toHaveBeenCalledWith({
        id: 'tech-1',
        first_name: 'Jane',
        last_name: 'Doe',
        email: 'tech@example.com',
        phone: '555-0100',
        is_available: false,
        category_id: 'cat-1',
        criminal_record: 'https://files/criminal.pdf',
        birth_certificate: 'https://files/birth.pdf',
        national_id: 'https://files/id.pdf',
      });
      expect(mockAddressesRepo.createAddress).toHaveBeenCalledWith({
        technician_id: 'tech-1',
        city: 'Amman',
        street: 'Main St',
        building_no: '10',
        apartment_no: '3A',
        latitude: 31.95,
        longitude: 35.93,
      });
      expect(result).toEqual({
        technician: {
          id: 'tech-1',
          email: 'tech@example.com',
          first_name: 'Jane',
          last_name: 'Doe',
        },
        message: 'Technician registered successfully. Please sign in to continue.',
      });
    });

    it('should throw duplicate-email error before auth signup when email already exists', async () => {
      mockTechniciansRepo.emailExists.mockResolvedValue(true);

      await expect(service.signUp(signUpData, files, addressData)).rejects.toThrow(
        'A technician with this email already exists',
      );

      expect(mockAuthRepo.signUp).not.toHaveBeenCalled();
      expect(mockStorageRepo.uploadDocuments).not.toHaveBeenCalled();
      expect(mockTechniciansRepo.createTechnician).not.toHaveBeenCalled();
      expect(mockAddressesRepo.createAddress).not.toHaveBeenCalled();
    });

    it('should throw when auth signup returns no user id', async () => {
      mockTechniciansRepo.emailExists.mockResolvedValue(false);
      mockAuthRepo.signUp.mockResolvedValue({ user: { email: 'tech@example.com' } });

      await expect(service.signUp(signUpData, files, addressData)).rejects.toThrow(
        'Failed to create technician account',
      );

      expect(mockStorageRepo.uploadDocuments).not.toHaveBeenCalled();
      expect(mockTechniciansRepo.createTechnician).not.toHaveBeenCalled();
      expect(mockAddressesRepo.createAddress).not.toHaveBeenCalled();
    });

    it('should coerce undefined latitude and longitude to null', async () => {
      mockTechniciansRepo.emailExists.mockResolvedValue(false);
      mockAuthRepo.signUp.mockResolvedValue({ user: { id: 'tech-1', email: 'tech@example.com' } });
      mockStorageRepo.uploadDocuments.mockResolvedValue({});
      mockTechniciansRepo.createTechnician.mockResolvedValue({});
      mockAddressesRepo.createAddress.mockResolvedValue({});

      await service.signUp(signUpData, files, {
        city: 'Amman',
        street: 'Main St',
        building_no: '10',
        apartment_no: '3A',
      });

      expect(mockAddressesRepo.createAddress).toHaveBeenCalledWith(
        expect.objectContaining({ latitude: null, longitude: null }),
      );
    });

    it('should propagate auth signup errors and stop later steps', async () => {
      mockTechniciansRepo.emailExists.mockResolvedValue(false);
      mockAuthRepo.signUp.mockRejectedValue(new Error('Signup failed'));

      await expect(service.signUp(signUpData, files, addressData)).rejects.toThrow('Signup failed');

      expect(mockStorageRepo.uploadDocuments).not.toHaveBeenCalled();
      expect(mockTechniciansRepo.createTechnician).not.toHaveBeenCalled();
      expect(mockAddressesRepo.createAddress).not.toHaveBeenCalled();
    });

    it('should propagate document upload errors and stop later steps', async () => {
      mockTechniciansRepo.emailExists.mockResolvedValue(false);
      mockAuthRepo.signUp.mockResolvedValue({ user: { id: 'tech-1', email: 'tech@example.com' } });
      mockStorageRepo.uploadDocuments.mockRejectedValue(new Error('Upload failed'));

      await expect(service.signUp(signUpData, files, addressData)).rejects.toThrow('Upload failed');

      expect(mockTechniciansRepo.createTechnician).not.toHaveBeenCalled();
      expect(mockAddressesRepo.createAddress).not.toHaveBeenCalled();
    });

    it('should propagate createTechnician errors and skip address creation', async () => {
      mockTechniciansRepo.emailExists.mockResolvedValue(false);
      mockAuthRepo.signUp.mockResolvedValue({ user: { id: 'tech-1', email: 'tech@example.com' } });
      mockStorageRepo.uploadDocuments.mockResolvedValue({});
      mockTechniciansRepo.createTechnician.mockRejectedValue(new Error('Insert failed'));

      await expect(service.signUp(signUpData, files, addressData)).rejects.toThrow('Insert failed');

      expect(mockAddressesRepo.createAddress).not.toHaveBeenCalled();
    });

    it('should propagate createAddress errors', async () => {
      mockTechniciansRepo.emailExists.mockResolvedValue(false);
      mockAuthRepo.signUp.mockResolvedValue({ user: { id: 'tech-1', email: 'tech@example.com' } });
      mockStorageRepo.uploadDocuments.mockResolvedValue({});
      mockTechniciansRepo.createTechnician.mockResolvedValue({});
      mockAddressesRepo.createAddress.mockRejectedValue(new Error('Address insert failed'));

      await expect(service.signUp(signUpData, files, addressData)).rejects.toThrow(
        'Address insert failed',
      );
    });
  });

  describe('signIn', () => {
    it('should return transformed session shape on successful sign-in', async () => {
      mockAuthRepo.signIn.mockResolvedValue({
        user: { id: 'tech-1', email: 'tech@example.com' },
        session: { access_token: 'at', refresh_token: 'rt', expires_at: 9999 },
      });
      mockTechniciansRepo.getTechnicianByEmail.mockResolvedValue({ id: 'tech-1' });

      const result = await service.signIn('tech@example.com', 'pass123');

      expect(mockAuthRepo.signIn).toHaveBeenCalledWith('tech@example.com', 'pass123');
      expect(mockTechniciansRepo.getTechnicianByEmail).toHaveBeenCalledWith('tech@example.com');
      expect(result).toEqual({
        technician: { id: 'tech-1', email: 'tech@example.com' },
        session: { accessToken: 'at', refreshToken: 'rt', expiresAt: 9999 },
      });
    });

    it('should sign out and throw 403 when no technician record exists', async () => {
      mockAuthRepo.signIn.mockResolvedValue({
        user: { id: 'tech-1', email: 'tech@example.com' },
        session: { access_token: 'at' },
      });
      mockTechniciansRepo.getTechnicianByEmail.mockResolvedValue(null);

      await expect(service.signIn('tech@example.com', 'pass123')).rejects.toMatchObject({
        message: 'No technician account found for this email',
        status: 403,
      });

      expect(mockAuthRepo.signOut).toHaveBeenCalledWith('at');
    });

    it('should sign out with empty string when session is undefined', async () => {
      mockAuthRepo.signIn.mockResolvedValue({
        user: { id: 'tech-1', email: 'tech@example.com' },
        session: undefined,
      });
      mockTechniciansRepo.getTechnicianByEmail.mockResolvedValue(null);

      await expect(service.signIn('tech@example.com', 'pass123')).rejects.toMatchObject({
        message: 'No technician account found for this email',
        status: 403,
      });

      expect(mockAuthRepo.signOut).toHaveBeenCalledWith('');
    });
  });

  describe('signOut', () => {
    it('should delegate to technicianAuthRepository.signOut', async () => {
      mockAuthRepo.signOut.mockResolvedValue({ success: true, message: 'Logged out successfully' });

      const result = await service.signOut('token');

      expect(mockAuthRepo.signOut).toHaveBeenCalledWith('token');
      expect(result).toEqual({ success: true, message: 'Logged out successfully' });
    });
  });

  describe('getCurrentTechnician', () => {
    it('should delegate to technicianAuthRepository.getUser', async () => {
      const technician = { id: 'tech-1', email: 'tech@example.com' };
      mockAuthRepo.getUser.mockResolvedValue(technician);

      const result = await service.getCurrentTechnician('token');

      expect(mockAuthRepo.getUser).toHaveBeenCalledWith('token');
      expect(result).toEqual(technician);
    });
  });

  describe('refreshSession', () => {
    it('should transform session keys to camelCase', async () => {
      mockAuthRepo.refreshToken.mockResolvedValue({
        user: { id: 'tech-1' },
        session: { access_token: 'at', refresh_token: 'rt', expires_at: 9999 },
      });

      const result = await service.refreshSession('refresh-token');

      expect(mockAuthRepo.refreshToken).toHaveBeenCalledWith('refresh-token');
      expect(result).toEqual({
        technician: { id: 'tech-1' },
        session: { accessToken: 'at', refreshToken: 'rt', expiresAt: 9999 },
      });
    });

    it('should handle undefined session without throwing', async () => {
      mockAuthRepo.refreshToken.mockResolvedValue({
        user: null,
        session: undefined,
      });

      const result = await service.refreshSession('refresh-token');

      expect(result).toEqual({
        technician: null,
        session: {
          accessToken: undefined,
          refreshToken: undefined,
          expiresAt: undefined,
        },
      });
    });
  });
});
