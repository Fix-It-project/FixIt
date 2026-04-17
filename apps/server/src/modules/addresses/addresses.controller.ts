import type { Request, Response } from 'express';
import { addressesService } from './addresses.service.js';
import { normalizeError } from '../../shared/errors/index.js';

type OwnerRole = 'user' | 'technician';

function createAddressHandlers(role: OwnerRole) {
  function getOwnerId(req: Request): string {
    const owner = role === 'user' ? req.user : req.technician;
    if (!owner?.id) throw new Error('Not authenticated');
    return owner.id;
  }

  return {
    async getAddresses(req: Request, res: Response) {
      try {
        const ownerId = getOwnerId(req);
        const addresses = await addressesService.getAddresses(ownerId, role);
        return res.status(200).json({ addresses });
      } catch (err: unknown) {
        const { status, message } = normalizeError(err);
        return res.status(status === 500 ? 401 : status).json({ error: message });
      }
    },

    async addAddress(req: Request, res: Response) {
      try {
        const ownerId = getOwnerId(req);
        const { city, street, building_no, apartment_no, latitude, longitude } = req.body;

        const address = await addressesService.addAddress(ownerId, role, {
          city, street, building_no, apartment_no, latitude, longitude,
        });
        return res.status(201).json({ address });
      } catch (err: unknown) {
        const { status, message } = normalizeError(err);
        const resolvedStatus = message.includes('Maximum of') ? 409 : (status === 500 ? 400 : status);
        return res.status(resolvedStatus).json({ error: message });
      }
    },

    async updateAddress(req: Request, res: Response) {
      try {
        const ownerId = getOwnerId(req);
        const addressId = req.params.id as string;
        const { city, street, building_no, apartment_no, latitude, longitude } = req.body;
        const address = await addressesService.updateAddress(ownerId, role, addressId, {
          city, street, building_no, apartment_no, latitude, longitude,
        });
        return res.status(200).json({ address });
      } catch (err: unknown) {
        const { status, message } = normalizeError(err);
        return res.status(status === 500 ? 400 : status).json({ error: message });
      }
    },

    async deleteAddress(req: Request, res: Response) {
      try {
        const ownerId = getOwnerId(req);
        const addressId = req.params.id as string;
        const result = await addressesService.deleteAddress(ownerId, role, addressId);
        return res.status(200).json(result);
      } catch (err: unknown) {
        const { status, message } = normalizeError(err);
        return res.status(status === 500 ? 400 : status).json({ error: message });
      }
    },

    async setActiveAddress(req: Request, res: Response) {
      try {
        const ownerId = getOwnerId(req);
        const addressId = req.params.id as string;
        const address = await addressesService.setActiveAddress(ownerId, role, addressId);
        return res.status(200).json({ address });
      } catch (err: unknown) {
        const { status, message } = normalizeError(err);
        return res.status(status === 500 ? 400 : status).json({ error: message });
      }
    },
  };
}

export const userAddressHandlers = createAddressHandlers('user');
export const technicianAddressHandlers = createAddressHandlers('technician');
