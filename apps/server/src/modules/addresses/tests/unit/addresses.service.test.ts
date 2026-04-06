import { describe, it, expect, vi, beforeEach } from 'vitest';

// ─── Hoisted mocks (ESM-compatible) ───────────────────────────────────────────

const { mockRepo } = vi.hoisted(() => ({
  mockRepo: {
    getAddressesByUserId: vi.fn(),
    getAddressesByTechnicianId: vi.fn(),
    getAddressCountByUserId: vi.fn(),
    getAddressCountByTechnicianId: vi.fn(),
    createAddress: vi.fn(),
    deactivateAllAddresses: vi.fn(),
    setAddressActive: vi.fn(),
    updateAddress: vi.fn(),
    deleteAddress: vi.fn(),
  },
}));

vi.mock('../../addresses.repository.js', () => ({
  addressesRepository: mockRepo,
}));

// Import AFTER mocking
const { AddressesService } = await import('../../addresses.service.js');

describe('AddressesService', () => {
  let service: InstanceType<typeof AddressesService>;

  beforeEach(() => {
    service = new AddressesService();
  });

  // ─── getAddresses ─────────────────────────────────────────────────────

  describe('getAddresses', () => {
    it('should delegate to getAddressesByUserId for user role', async () => {
      const addresses = [{ id: 'a1' }];
      mockRepo.getAddressesByUserId.mockResolvedValue(addresses);

      const result = await service.getAddresses('u-1', 'user');

      expect(mockRepo.getAddressesByUserId).toHaveBeenCalledWith('u-1');
      expect(mockRepo.getAddressesByTechnicianId).not.toHaveBeenCalled();
      expect(result).toEqual(addresses);
    });

    it('should delegate to getAddressesByTechnicianId for technician role', async () => {
      const addresses = [{ id: 'a2' }];
      mockRepo.getAddressesByTechnicianId.mockResolvedValue(addresses);

      const result = await service.getAddresses('t-1', 'technician');

      expect(mockRepo.getAddressesByTechnicianId).toHaveBeenCalledWith('t-1');
      expect(mockRepo.getAddressesByUserId).not.toHaveBeenCalled();
      expect(result).toEqual(addresses);
    });
  });

  // ─── addAddress ───────────────────────────────────────────────────────

  describe('addAddress', () => {
    const addressData = { city: 'Amman', street: 'Main St' };

    it('should deactivate all and create address for user role with is_active: true', async () => {
      mockRepo.getAddressCountByUserId.mockResolvedValue(1);
      mockRepo.deactivateAllAddresses.mockResolvedValue(undefined);
      mockRepo.createAddress.mockResolvedValue({ id: 'addr-1' });

      const result = await service.addAddress('u-1', 'user', addressData);

      expect(mockRepo.getAddressCountByUserId).toHaveBeenCalledWith('u-1');
      expect(mockRepo.deactivateAllAddresses).toHaveBeenCalledWith('u-1', 'user');
      expect(mockRepo.createAddress).toHaveBeenCalledWith({
        user_id: 'u-1',
        city: 'Amman',
        street: 'Main St',
        is_active: true,
      });
      expect(result).toEqual({ id: 'addr-1' });
    });

    it('should create address for technician role with technician_id', async () => {
      mockRepo.getAddressCountByTechnicianId.mockResolvedValue(0);
      mockRepo.deactivateAllAddresses.mockResolvedValue(undefined);
      mockRepo.createAddress.mockResolvedValue({ id: 'addr-2' });

      await service.addAddress('t-1', 'technician', addressData);

      expect(mockRepo.getAddressCountByTechnicianId).toHaveBeenCalledWith('t-1');
      expect(mockRepo.createAddress).toHaveBeenCalledWith(
        expect.objectContaining({ technician_id: 't-1', is_active: true }),
      );
    });

    it('should throw when count equals MAX (3) — boundary', async () => {
      mockRepo.getAddressCountByUserId.mockResolvedValue(3);

      await expect(service.addAddress('u-1', 'user', addressData))
        .rejects.toThrow('Maximum of 3 addresses allowed');

      expect(mockRepo.deactivateAllAddresses).not.toHaveBeenCalled();
      expect(mockRepo.createAddress).not.toHaveBeenCalled();
    });

    it('should succeed when count is MAX-1 (2) — boundary', async () => {
      mockRepo.getAddressCountByUserId.mockResolvedValue(2);
      mockRepo.deactivateAllAddresses.mockResolvedValue(undefined);
      mockRepo.createAddress.mockResolvedValue({ id: 'addr-3' });

      const result = await service.addAddress('u-1', 'user', addressData);

      expect(result).toEqual({ id: 'addr-3' });
    });
  });

  // ─── setActiveAddress ─────────────────────────────────────────────────

  describe('setActiveAddress', () => {
    it('should deactivate all then activate the chosen address', async () => {
      mockRepo.deactivateAllAddresses.mockResolvedValue(undefined);
      mockRepo.setAddressActive.mockResolvedValue({ id: 'addr-1', is_active: true });

      const result = await service.setActiveAddress('u-1', 'user', 'addr-1');

      expect(mockRepo.deactivateAllAddresses).toHaveBeenCalledWith('u-1', 'user');
      expect(mockRepo.setAddressActive).toHaveBeenCalledWith('addr-1', 'u-1', 'user');
      expect(result).toEqual({ id: 'addr-1', is_active: true });
    });
  });

  // ─── updateAddress ────────────────────────────────────────────────────

  describe('updateAddress', () => {
    it('should delegate with correct argument order', async () => {
      const updateData = { city: 'Zarqa' };
      mockRepo.updateAddress.mockResolvedValue({ id: 'addr-1', city: 'Zarqa' });

      const result = await service.updateAddress('u-1', 'user', 'addr-1', updateData);

      expect(mockRepo.updateAddress).toHaveBeenCalledWith('addr-1', updateData, 'u-1', 'user');
      expect(result).toEqual({ id: 'addr-1', city: 'Zarqa' });
    });
  });

  // ─── deleteAddress ────────────────────────────────────────────────────

  describe('deleteAddress', () => {
    it('should delete and return success when count > 1', async () => {
      mockRepo.getAddressCountByUserId.mockResolvedValue(2);
      mockRepo.deleteAddress.mockResolvedValue(undefined);

      const result = await service.deleteAddress('u-1', 'user', 'addr-1');

      expect(mockRepo.deleteAddress).toHaveBeenCalledWith('addr-1', 'u-1', 'user');
      expect(result).toEqual({ success: true, message: 'Address deleted successfully' });
    });

    it('should throw when count = 1 — boundary (last address)', async () => {
      mockRepo.getAddressCountByUserId.mockResolvedValue(1);

      await expect(service.deleteAddress('u-1', 'user', 'addr-1'))
        .rejects.toThrow('You must have at least one address');

      expect(mockRepo.deleteAddress).not.toHaveBeenCalled();
    });

    it('should throw when count = 0 — boundary', async () => {
      mockRepo.getAddressCountByTechnicianId.mockResolvedValue(0);

      await expect(service.deleteAddress('t-1', 'technician', 'addr-1'))
        .rejects.toThrow('You must have at least one address');
    });
  });
});
