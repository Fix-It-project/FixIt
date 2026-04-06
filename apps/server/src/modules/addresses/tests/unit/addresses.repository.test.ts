import { describe, it, expect, vi, beforeEach, type Mock } from 'vitest';

// ─── Hoisted mocks (ESM-compatible) ───────────────────────────────────────────

const { createChain, mockFrom } = vi.hoisted(() => {
  type MockChain = {
    insert: Mock;
    select: Mock;
    eq: Mock;
    update: Mock;
    delete: Mock;
    order: Mock;
    single: Mock;
    maybeSingle: Mock;
  };

  function createChain() {
    const chain = {} as MockChain;
    chain.insert = vi.fn(() => chain);
    chain.select = vi.fn(() => chain);
    chain.eq = vi.fn(() => chain);
    chain.update = vi.fn(() => chain);
    chain.delete = vi.fn(() => chain);
    chain.order = vi.fn(() => chain);
    chain.single = vi.fn(() => chain);
    chain.maybeSingle = vi.fn(() => chain);
    return chain;
  }
  return { createChain, mockFrom: vi.fn() };
});

vi.mock('@/shared/db/supabase.js', () => ({
  supabaseAdmin: { from: mockFrom },
}));

// Import AFTER mocking
const { AddressesRepository } = await import('../../addresses.repository.js');

describe('AddressesRepository', () => {
  let repo: InstanceType<typeof AddressesRepository>;

  beforeEach(() => {
    repo = new AddressesRepository();
  });

  function useSingleChain() {
    const chain = createChain();
    mockFrom.mockReturnValue(chain);
    return chain;
  }

  function useDoubleChain() {
    const checkChain = createChain();
    const writeChain = createChain();
    mockFrom.mockReturnValueOnce(checkChain).mockReturnValueOnce(writeChain);
    return { checkChain, writeChain };
  }

  // ─── createAddress ────────────────────────────────────────────────────

  describe('createAddress', () => {
    it('should insert with user_id and technician_id = null', async () => {
      const chain = useSingleChain();
      const mockAddress = { id: 'addr-1', city: 'Amman', user_id: 'u-1' };
      chain.single.mockResolvedValue({ data: mockAddress, error: null });

      const result = await repo.createAddress({
        user_id: 'u-1',
        city: 'Amman',
        street: 'Main St',
      });

      expect(mockFrom).toHaveBeenCalledWith('addresses');
      expect(chain.insert).toHaveBeenCalledWith(
        expect.objectContaining({ user_id: 'u-1', technician_id: null }),
      );
      expect(result).toEqual(mockAddress);
    });

    it('should insert with technician_id and user_id = null', async () => {
      const chain = useSingleChain();
      chain.single.mockResolvedValue({ data: { id: 'addr-2' }, error: null });

      await repo.createAddress({
        technician_id: 't-1',
        city: 'Irbid',
        street: 'King St',
      });

      expect(chain.insert).toHaveBeenCalledWith(
        expect.objectContaining({ technician_id: 't-1', user_id: null }),
      );
    });

    it('should nullify optional fields when omitted', async () => {
      const chain = useSingleChain();
      chain.single.mockResolvedValue({ data: { id: 'addr-3' }, error: null });

      await repo.createAddress({ user_id: 'u-1', city: 'Amman', street: 'St' });

      expect(chain.insert).toHaveBeenCalledWith(
        expect.objectContaining({
          building_no: null,
          apartment_no: null,
          latitude: null,
          longitude: null,
        }),
      );
    });

    it('should default is_active to false when omitted', async () => {
      const chain = useSingleChain();
      chain.single.mockResolvedValue({ data: { id: 'addr-4' }, error: null });

      await repo.createAddress({ user_id: 'u-1', city: 'Amman', street: 'St' });

      expect(chain.insert).toHaveBeenCalledWith(
        expect.objectContaining({ is_active: false }),
      );
    });

    it('should propagate supabase errors', async () => {
      const chain = useSingleChain();
      chain.single.mockResolvedValue({ data: null, error: { message: 'DB error' } });

      await expect(repo.createAddress({ user_id: 'u-1', city: 'Amman', street: 'St' }))
        .rejects.toMatchObject({ message: 'DB error' });
    });
  });

  // ─── getAddressesByUserId ─────────────────────────────────────────────

  describe('getAddressesByUserId', () => {
    it('should return ordered list of addresses', async () => {
      const chain = useSingleChain();
      const addresses = [{ id: 'a1' }, { id: 'a2' }];
      chain.order.mockResolvedValue({ data: addresses, error: null });

      const result = await repo.getAddressesByUserId('u-1');

      expect(chain.select).toHaveBeenCalledWith('*');
      expect(chain.eq).toHaveBeenCalledWith('user_id', 'u-1');
      expect(chain.order).toHaveBeenCalledWith('created_at', { ascending: true });
      expect(result).toEqual(addresses);
    });

    it('should propagate errors', async () => {
      const chain = useSingleChain();
      chain.order.mockResolvedValue({ data: null, error: { message: 'fail' } });

      await expect(repo.getAddressesByUserId('u-1')).rejects.toMatchObject({ message: 'fail' });
    });
  });

  // ─── getAddressCountByUserId ──────────────────────────────────────────

  describe('getAddressCountByUserId', () => {
    it('should return the count', async () => {
      const chain = useSingleChain();
      chain.eq.mockResolvedValue({ count: 3, error: null });

      const result = await repo.getAddressCountByUserId('u-1');

      expect(chain.select).toHaveBeenCalledWith('*', { count: 'exact', head: true });
      expect(result).toBe(3);
    });

    it('should return 0 when count is null', async () => {
      const chain = useSingleChain();
      chain.eq.mockResolvedValue({ count: null, error: null });

      const result = await repo.getAddressCountByUserId('u-1');

      expect(result).toBe(0);
    });

    it('should propagate errors', async () => {
      const chain = useSingleChain();
      chain.eq.mockResolvedValue({ count: null, error: { message: 'fail' } });

      await expect(repo.getAddressCountByUserId('u-1')).rejects.toMatchObject({ message: 'fail' });
    });
  });

  // ─── getAddressesByTechnicianId ───────────────────────────────────────

  describe('getAddressesByTechnicianId', () => {
    it('should return ordered list of addresses', async () => {
      const chain = useSingleChain();
      chain.order.mockResolvedValue({ data: [{ id: 'a1' }], error: null });

      const result = await repo.getAddressesByTechnicianId('t-1');

      expect(chain.eq).toHaveBeenCalledWith('technician_id', 't-1');
      expect(result).toEqual([{ id: 'a1' }]);
    });

    it('should propagate errors', async () => {
      const chain = useSingleChain();
      chain.order.mockResolvedValue({ data: null, error: { message: 'fail' } });

      await expect(repo.getAddressesByTechnicianId('t-1')).rejects.toMatchObject({ message: 'fail' });
    });
  });

  // ─── getAddressCountByTechnicianId ────────────────────────────────────

  describe('getAddressCountByTechnicianId', () => {
    it('should return the count', async () => {
      const chain = useSingleChain();
      chain.eq.mockResolvedValue({ count: 2, error: null });

      const result = await repo.getAddressCountByTechnicianId('t-1');

      expect(chain.eq).toHaveBeenCalledWith('technician_id', 't-1');
      expect(result).toBe(2);
    });

    it('should return 0 when count is null', async () => {
      const chain = useSingleChain();
      chain.eq.mockResolvedValue({ count: null, error: null });

      const result = await repo.getAddressCountByTechnicianId('t-1');

      expect(result).toBe(0);
    });

    it('should propagate errors', async () => {
      const chain = useSingleChain();
      chain.eq.mockResolvedValue({ count: null, error: { message: 'fail' } });

      await expect(repo.getAddressCountByTechnicianId('t-1')).rejects.toMatchObject({ message: 'fail' });
    });
  });

  // ─── updateAddress ────────────────────────────────────────────────────

  describe('updateAddress', () => {
    it('should update address for user role', async () => {
      const { checkChain, writeChain } = useDoubleChain();
      checkChain.maybeSingle.mockResolvedValue({ data: { id: 'addr-1' }, error: null });
      writeChain.single.mockResolvedValue({ data: { id: 'addr-1', city: 'Zarqa' }, error: null });

      const result = await repo.updateAddress('addr-1', { city: 'Zarqa' }, 'u-1', 'user');

      expect(checkChain.eq).toHaveBeenCalledWith('id', 'addr-1');
      expect(checkChain.eq).toHaveBeenCalledWith('user_id', 'u-1');
      expect(writeChain.update).toHaveBeenCalledWith(expect.objectContaining({ city: 'Zarqa' }));
      expect(result).toEqual({ id: 'addr-1', city: 'Zarqa' });
    });

    it('should update address for technician role', async () => {
      const { checkChain, writeChain } = useDoubleChain();
      checkChain.maybeSingle.mockResolvedValue({ data: { id: 'addr-1' }, error: null });
      writeChain.single.mockResolvedValue({ data: { id: 'addr-1' }, error: null });

      await repo.updateAddress('addr-1', { city: 'Zarqa' }, 't-1', 'technician');

      expect(checkChain.eq).toHaveBeenCalledWith('technician_id', 't-1');
    });

    it('should throw when ownership check fails (not found)', async () => {
      const checkChain = useSingleChain();
      checkChain.maybeSingle.mockResolvedValue({ data: null, error: null });

      await expect(repo.updateAddress('addr-1', { city: 'Zarqa' }, 'u-1', 'user'))
        .rejects.toThrow('Address not found or unauthorized to update');
    });

    it('should propagate ownership check errors', async () => {
      const checkChain = useSingleChain();
      checkChain.maybeSingle.mockResolvedValue({ data: null, error: { message: 'check fail' } });

      await expect(repo.updateAddress('addr-1', { city: 'Zarqa' }, 'u-1', 'user'))
        .rejects.toMatchObject({ message: 'check fail' });
    });

    it('should propagate update errors', async () => {
      const { checkChain, writeChain } = useDoubleChain();
      checkChain.maybeSingle.mockResolvedValue({ data: { id: 'addr-1' }, error: null });
      writeChain.single.mockResolvedValue({ data: null, error: { message: 'update fail' } });

      await expect(repo.updateAddress('addr-1', { city: 'Zarqa' }, 'u-1', 'user'))
        .rejects.toMatchObject({ message: 'update fail' });
    });
  });

  // ─── deleteAddress ────────────────────────────────────────────────────

  describe('deleteAddress', () => {
    it('should delete address after ownership check', async () => {
      const { checkChain, writeChain } = useDoubleChain();
      checkChain.maybeSingle.mockResolvedValue({ data: { id: 'addr-1' }, error: null });
      writeChain.eq.mockResolvedValue({ error: null });

      await repo.deleteAddress('addr-1', 'u-1', 'user');

      expect(checkChain.eq).toHaveBeenCalledWith('user_id', 'u-1');
      expect(writeChain.delete).toHaveBeenCalled();
    });

    it('should throw when ownership check fails', async () => {
      const checkChain = useSingleChain();
      checkChain.maybeSingle.mockResolvedValue({ data: null, error: null });

      await expect(repo.deleteAddress('addr-1', 'u-1', 'user'))
        .rejects.toThrow('Address not found or unauthorized to delete');
    });

    it('should propagate delete errors', async () => {
      const { checkChain, writeChain } = useDoubleChain();
      checkChain.maybeSingle.mockResolvedValue({ data: { id: 'addr-1' }, error: null });
      writeChain.eq.mockResolvedValue({ error: { message: 'delete fail' } });

      await expect(repo.deleteAddress('addr-1', 'u-1', 'user'))
        .rejects.toMatchObject({ message: 'delete fail' });
    });
  });

  // ─── deactivateAllAddresses ───────────────────────────────────────────

  describe('deactivateAllAddresses', () => {
    it('should deactivate all for user role', async () => {
      const chain = useSingleChain();
      // First .eq() returns chain, second .eq() resolves with result
      chain.eq.mockReturnValueOnce(chain).mockResolvedValueOnce({ error: null });

      await repo.deactivateAllAddresses('u-1', 'user');

      expect(chain.update).toHaveBeenCalledWith({ is_active: false });
      expect(chain.eq).toHaveBeenCalledWith('user_id', 'u-1');
      expect(chain.eq).toHaveBeenCalledWith('is_active', true);
    });

    it('should deactivate all for technician role', async () => {
      const chain = useSingleChain();
      chain.eq.mockReturnValueOnce(chain).mockResolvedValueOnce({ error: null });

      await repo.deactivateAllAddresses('t-1', 'technician');

      expect(chain.eq).toHaveBeenCalledWith('technician_id', 't-1');
    });

    it('should propagate errors', async () => {
      const chain = useSingleChain();
      chain.eq.mockReturnValueOnce(chain).mockResolvedValueOnce({ error: { message: 'fail' } });

      await expect(repo.deactivateAllAddresses('u-1', 'user'))
        .rejects.toMatchObject({ message: 'fail' });
    });
  });

  // ─── setAddressActive ─────────────────────────────────────────────────

  describe('setAddressActive', () => {
    it('should activate address for user role', async () => {
      const { checkChain, writeChain } = useDoubleChain();
      checkChain.maybeSingle.mockResolvedValue({ data: { id: 'addr-1' }, error: null });
      writeChain.single.mockResolvedValue({ data: { id: 'addr-1', is_active: true }, error: null });

      const result = await repo.setAddressActive('addr-1', 'u-1', 'user');

      expect(checkChain.eq).toHaveBeenCalledWith('user_id', 'u-1');
      expect(writeChain.update).toHaveBeenCalledWith({ is_active: true });
      expect(result).toEqual({ id: 'addr-1', is_active: true });
    });

    it('should activate address for technician role', async () => {
      const { checkChain, writeChain } = useDoubleChain();
      checkChain.maybeSingle.mockResolvedValue({ data: { id: 'addr-1' }, error: null });
      writeChain.single.mockResolvedValue({ data: { id: 'addr-1' }, error: null });

      await repo.setAddressActive('addr-1', 't-1', 'technician');

      expect(checkChain.eq).toHaveBeenCalledWith('technician_id', 't-1');
    });

    it('should throw when ownership check fails', async () => {
      const checkChain = useSingleChain();
      checkChain.maybeSingle.mockResolvedValue({ data: null, error: null });

      await expect(repo.setAddressActive('addr-1', 'u-1', 'user'))
        .rejects.toThrow('Address not found or unauthorized');
    });

    it('should propagate errors', async () => {
      const { checkChain, writeChain } = useDoubleChain();
      checkChain.maybeSingle.mockResolvedValue({ data: { id: 'addr-1' }, error: null });
      writeChain.single.mockResolvedValue({ data: null, error: { message: 'fail' } });

      await expect(repo.setAddressActive('addr-1', 'u-1', 'user'))
        .rejects.toMatchObject({ message: 'fail' });
    });
  });
});
