import type { Request, Response } from 'express';
import { addressesService } from './addresses.service.js';

type OwnerRole = 'user' | 'technician';

/**
 * Creates a set of address controller handlers bound to a specific owner role.
 * The owner ID is read from req.user or req.technician, which are set by
 * the requireUserAuth / requireTechnicianAuth middleware respectively.
 */
function createAddressHandlers(role: OwnerRole) {
  function getOwnerId(req: Request): string {
    const owner = role === 'user' ? (req as any).user : (req as any).technician;
    if (!owner?.id) throw new Error('Not authenticated');
    return owner.id;
  }

  return {
    async getAddresses(req: Request, res: Response) {
      try {
        const ownerId = getOwnerId(req);
        const addresses = await addressesService.getAddresses(ownerId, role);
        return res.status(200).json({ addresses });
      } catch (error: unknown) {
        const message = error instanceof Error ? error.message : 'Unknown error';
        return res.status(401).json({ error: message });
      }
    },

    async addAddress(req: Request, res: Response) {
      try {
        const ownerId = getOwnerId(req);
        const { city, street, building_no, apartment_no, latitude, longitude } = req.body;

        if (!city || !street) {
          return res.status(400).json({ error: 'City and street are required' });
        }

        const address = await addressesService.addAddress(ownerId, role, {
          city, street, building_no, apartment_no, latitude, longitude,
        });
        return res.status(201).json({ address });
      } catch (error: unknown) {
        const message = error instanceof Error ? error.message : 'Unknown error';
        return res.status(400).json({ error: message });
      }
    },

    async updateAddress(req: Request, res: Response) {
      try {
        const ownerId = getOwnerId(req);
        const addressId = req.params.id as string;
        if (!addressId) return res.status(400).json({ error: 'Address ID is required' });

        const { city, street, building_no, apartment_no, latitude, longitude } = req.body;
        const address = await addressesService.updateAddress(ownerId, role, addressId, {
          city, street, building_no, apartment_no, latitude, longitude,
        });
        return res.status(200).json({ address });
      } catch (error: unknown) {
        const message = error instanceof Error ? error.message : 'Unknown error';
        return res.status(400).json({ error: message });
      }
    },

    async deleteAddress(req: Request, res: Response) {
      try {
        const ownerId = getOwnerId(req);
        const addressId = req.params.id as string;
        if (!addressId) return res.status(400).json({ error: 'Address ID is required' });

        const result = await addressesService.deleteAddress(ownerId, role, addressId);
        return res.status(200).json(result);
      } catch (error: unknown) {
        const message = error instanceof Error ? error.message : 'Unknown error';
        return res.status(400).json({ error: message });
      }
    },
  };
}

export const userAddressHandlers = createAddressHandlers('user');
export const technicianAddressHandlers = createAddressHandlers('technician');
