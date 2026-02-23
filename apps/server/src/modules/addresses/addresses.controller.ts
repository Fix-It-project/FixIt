import type { Request, Response } from 'express';
import { addressesService } from './addresses.service.js';
import { authService } from '../auth/auth.service.js';
import { technicianAuthService } from '../technician-auth/technician-auth.service.js';

type OwnerRole = 'user' | 'technician';

/**
 * Extracts the owner ID from the Authorization header.
 * Uses the appropriate auth service based on the role.
 */
async function getOwnerIdFromToken(req: Request, role: OwnerRole): Promise<string> {
  const token = req.headers.authorization?.replace('Bearer ', '');
  if (!token) throw new Error('No token provided');

  if (role === 'user') {
    const user = await authService.getCurrentUser(token);
    if (!user || !user.id) throw new Error('Invalid token');
    return user.id;
  }

  const technician = await technicianAuthService.getCurrentTechnician(token);
  if (!technician || !technician.id) throw new Error('Invalid token');
  return technician.id;
}

/**
 * Creates a set of address controller handlers bound to a specific owner role.
 * This avoids duplicating the same controller logic for users and technicians.
 */
function createAddressHandlers(role: OwnerRole) {
  return {
    async getAddresses(req: Request, res: Response) {
      try {
        const ownerId = await getOwnerIdFromToken(req, role);
        const addresses = await addressesService.getAddresses(ownerId, role);
        return res.status(200).json({ addresses });
      } catch (error: unknown) {
        const message = error instanceof Error ? error.message : 'Unknown error';
        return res.status(401).json({ error: message });
      }
    },

    async addAddress(req: Request, res: Response) {
      try {
        const ownerId = await getOwnerIdFromToken(req, role);
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
        const ownerId = await getOwnerIdFromToken(req, role);
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
        const ownerId = await getOwnerIdFromToken(req, role);
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
