import { describe, it, expect, vi } from 'vitest';
import type { Request, Response } from 'express';
import { createMockReq, createMockRes } from '../../../../../tests/mocks/express.mock.js';

// ─── Hoisted mock (ESM-compatible) ──────────────────────────────────────────

const { mockService } = vi.hoisted(() => ({
  mockService: {
    getAddresses: vi.fn(),
    addAddress: vi.fn(),
    setActiveAddress: vi.fn(),
    updateAddress: vi.fn(),
    deleteAddress: vi.fn(),
  },
}));

vi.mock('../../addresses.service.js', () => ({
  addressesService: mockService,
}));

// Import AFTER mocking
const { userAddressHandlers, technicianAddressHandlers } = await import('../../addresses.controller.js');

describe('Addresses Controller', () => {
  function createUserReq(overrides: Partial<Request> = {}) {
    return createMockReq({ user: { id: 'u-1' }, ...overrides } as Partial<Request>);
  }

  function createTechnicianReq(overrides: Partial<Request> = {}) {
    return createMockReq({ technician: { id: 't-1' }, ...overrides } as Partial<Request>);
  }

  function createReqRes(req: Request) {
    return { req, res: createMockRes() };
  }

  // ─── getAddresses ─────────────────────────────────────────────────────

  describe('getAddresses', () => {
    it('should return 200 with addresses for user role', async () => {
      const addresses = [{ id: 'a1', city: 'Amman' }];
      mockService.getAddresses.mockResolvedValue(addresses);

      const { req, res } = createReqRes(createUserReq());

      await userAddressHandlers.getAddresses(req as Request, res as unknown as Response);

      expect(mockService.getAddresses).toHaveBeenCalledWith('u-1', 'user');
      expect(res.statusCode).toBe(200);
      expect(res.body).toEqual({ addresses });
    });

    it('should return 200 with addresses for technician role', async () => {
      const addresses = [{ id: 'a2' }];
      mockService.getAddresses.mockResolvedValue(addresses);

      const { req, res } = createReqRes(createTechnicianReq());

      await technicianAddressHandlers.getAddresses(req as Request, res as unknown as Response);

      expect(mockService.getAddresses).toHaveBeenCalledWith('t-1', 'technician');
      expect(res.statusCode).toBe(200);
    });

    it('should return 401 when not authenticated', async () => {
      const req = createMockReq();
      const res = createMockRes();

      await userAddressHandlers.getAddresses(req as Request, res as unknown as Response);

      expect(res.statusCode).toBe(401);
      expect(res.body).toEqual({ error: 'Not authenticated' });
      expect(mockService.getAddresses).not.toHaveBeenCalled();
    });

    it('should return 401 on service error', async () => {
      mockService.getAddresses.mockRejectedValue(new Error('DB error'));

      const { req, res } = createReqRes(createUserReq());

      await userAddressHandlers.getAddresses(req as Request, res as unknown as Response);

      expect(res.statusCode).toBe(401);
      expect(res.body).toEqual({ error: 'DB error' });
    });
  });

  // ─── addAddress ───────────────────────────────────────────────────────

  describe('addAddress', () => {
    const validBody = {
      city: 'Amman',
      street: 'Main St',
      building_no: '10',
      apartment_no: '3A',
      latitude: 31.95,
      longitude: 35.93,
    };

    it('should return 201 on successful add', async () => {
      mockService.addAddress.mockResolvedValue({ id: 'addr-1', ...validBody });

      const { req, res } = createReqRes(createUserReq({ body: validBody }));

      await userAddressHandlers.addAddress(req as Request, res as unknown as Response);

      expect(res.statusCode).toBe(201);
      expect(res.body).toEqual({ address: { id: 'addr-1', ...validBody } });
    });

    it('should return 400 when city is missing', async () => {
      const { req, res } = createReqRes(createUserReq({
        body: { street: 'St', latitude: 31.95, longitude: 35.93 },
      }));

      await userAddressHandlers.addAddress(req as Request, res as unknown as Response);

      expect(res.statusCode).toBe(400);
      expect(res.body).toEqual({ error: expect.stringContaining('City is required') });
      expect(mockService.addAddress).not.toHaveBeenCalled();
    });

    it('should return 400 when street is missing', async () => {
      const { req, res } = createReqRes(createUserReq({
        body: { city: 'Amman', latitude: 31.95, longitude: 35.93 },
      }));

      await userAddressHandlers.addAddress(req as Request, res as unknown as Response);

      expect(res.statusCode).toBe(400);
      expect(res.body).toEqual({ error: expect.stringContaining('Street is required') });
    });

    it('should return 400 when latitude is missing', async () => {
      const { req, res } = createReqRes(createUserReq({
        body: { city: 'Amman', street: 'St', longitude: 35.93 },
      }));

      await userAddressHandlers.addAddress(req as Request, res as unknown as Response);

      expect(res.statusCode).toBe(400);
      expect(res.body).toEqual({ error: expect.stringContaining('Latitude is required') });
    });

    it('should return 400 when longitude is missing', async () => {
      const { req, res } = createReqRes(createUserReq({
        body: { city: 'Amman', street: 'St', latitude: 31.95 },
      }));

      await userAddressHandlers.addAddress(req as Request, res as unknown as Response);

      expect(res.statusCode).toBe(400);
      expect(res.body).toEqual({ error: expect.stringContaining('Longitude is required') });
    });

    it('should return 400 with multiple joined errors', async () => {
      const { req, res } = createReqRes(createUserReq({ body: {} }));

      await userAddressHandlers.addAddress(req as Request, res as unknown as Response);

      expect(res.statusCode).toBe(400);
      const errorMsg = (res.body as { error: string }).error;
      expect(errorMsg).toContain('City is required');
      expect(errorMsg).toContain('Street is required');
      expect(errorMsg).toContain('Latitude is required');
      expect(errorMsg).toContain('Longitude is required');
      // Errors are joined with '. '
      expect(errorMsg.split('. ').length).toBe(4);
    });

    it('should return 409 when service throws Maximum limit error', async () => {
      mockService.addAddress.mockRejectedValue(new Error('Maximum of 3 addresses allowed'));

      const { req, res } = createReqRes(createUserReq({ body: validBody }));

      await userAddressHandlers.addAddress(req as Request, res as unknown as Response);

      expect(res.statusCode).toBe(409);
      expect(res.body).toEqual({ error: 'Maximum of 3 addresses allowed' });
    });

    it('should return 400 on other service errors', async () => {
      mockService.addAddress.mockRejectedValue(new Error('DB error'));

      const { req, res } = createReqRes(createUserReq({ body: validBody }));

      await userAddressHandlers.addAddress(req as Request, res as unknown as Response);

      expect(res.statusCode).toBe(400);
      expect(res.body).toEqual({ error: 'DB error' });
    });
  });

  // ─── updateAddress ────────────────────────────────────────────────────

  describe('updateAddress', () => {
    it('should return 200 on successful update', async () => {
      mockService.updateAddress.mockResolvedValue({ id: 'addr-1', city: 'Zarqa' });

      const { req, res } = createReqRes(createUserReq({
        params: { id: 'addr-1' },
        body: { city: 'Zarqa' },
      }));

      await userAddressHandlers.updateAddress(req as Request, res as unknown as Response);

      expect(mockService.updateAddress).toHaveBeenCalledWith('u-1', 'user', 'addr-1', expect.objectContaining({ city: 'Zarqa' }));
      expect(res.statusCode).toBe(200);
      expect(res.body).toEqual({ address: { id: 'addr-1', city: 'Zarqa' } });
    });

    it('should return 400 when address ID is missing', async () => {
      const { req, res } = createReqRes(createUserReq({
        params: {},
        body: { city: 'Zarqa' },
      }));

      await userAddressHandlers.updateAddress(req as Request, res as unknown as Response);

      expect(res.statusCode).toBe(400);
      expect(res.body).toEqual({ error: 'Address ID is required' });
      expect(mockService.updateAddress).not.toHaveBeenCalled();
    });

    it('should return 400 on service error', async () => {
      mockService.updateAddress.mockRejectedValue(new Error('Not found'));

      const { req, res } = createReqRes(createUserReq({
        params: { id: 'addr-1' },
        body: { city: 'Zarqa' },
      }));

      await userAddressHandlers.updateAddress(req as Request, res as unknown as Response);

      expect(res.statusCode).toBe(400);
      expect(res.body).toEqual({ error: 'Not found' });
    });
  });

  // ─── deleteAddress ────────────────────────────────────────────────────

  describe('deleteAddress', () => {
    it('should return 200 with success message', async () => {
      mockService.deleteAddress.mockResolvedValue({ success: true, message: 'Address deleted successfully' });

      const { req, res } = createReqRes(createUserReq({ params: { id: 'addr-1' } }));

      await userAddressHandlers.deleteAddress(req as Request, res as unknown as Response);

      expect(res.statusCode).toBe(200);
      expect(res.body).toEqual({ success: true, message: 'Address deleted successfully' });
    });

    it('should return 400 when address ID is missing', async () => {
      const { req, res } = createReqRes(createUserReq({ params: {} }));

      await userAddressHandlers.deleteAddress(req as Request, res as unknown as Response);

      expect(res.statusCode).toBe(400);
      expect(res.body).toEqual({ error: 'Address ID is required' });
      expect(mockService.deleteAddress).not.toHaveBeenCalled();
    });

    it('should return 400 on service error', async () => {
      mockService.deleteAddress.mockRejectedValue(new Error('Must have at least one'));

      const { req, res } = createReqRes(createUserReq({ params: { id: 'addr-1' } }));

      await userAddressHandlers.deleteAddress(req as Request, res as unknown as Response);

      expect(res.statusCode).toBe(400);
      expect(res.body).toEqual({ error: 'Must have at least one' });
    });
  });

  // ─── setActiveAddress ─────────────────────────────────────────────────

  describe('setActiveAddress', () => {
    it('should return 200 on successful activation', async () => {
      mockService.setActiveAddress.mockResolvedValue({ id: 'addr-1', is_active: true });

      const { req, res } = createReqRes(createUserReq({ params: { id: 'addr-1' } }));

      await userAddressHandlers.setActiveAddress(req as Request, res as unknown as Response);

      expect(mockService.setActiveAddress).toHaveBeenCalledWith('u-1', 'user', 'addr-1');
      expect(res.statusCode).toBe(200);
      expect(res.body).toEqual({ address: { id: 'addr-1', is_active: true } });
    });

    it('should return 400 when address ID is missing', async () => {
      const { req, res } = createReqRes(createUserReq({ params: {} }));

      await userAddressHandlers.setActiveAddress(req as Request, res as unknown as Response);

      expect(res.statusCode).toBe(400);
      expect(res.body).toEqual({ error: 'Address ID is required' });
      expect(mockService.setActiveAddress).not.toHaveBeenCalled();
    });

    it('should return 400 on service error', async () => {
      mockService.setActiveAddress.mockRejectedValue(new Error('Not found'));

      const { req, res } = createReqRes(createUserReq({ params: { id: 'addr-1' } }));

      await userAddressHandlers.setActiveAddress(req as Request, res as unknown as Response);

      expect(res.statusCode).toBe(400);
      expect(res.body).toEqual({ error: 'Not found' });
    });
  });
});
