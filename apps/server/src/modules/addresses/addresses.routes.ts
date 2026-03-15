import { Router, type Router as RouterType } from 'express';
import { userAddressHandlers, technicianAddressHandlers } from './addresses.controller.js';
import { requireUserAuth } from '../../shared/middlewares/user-auth.middleware.js';
import { requireTechnicianAuth } from '../../shared/middlewares/technician-auth.middleware.js';

//User address routes

export const userAddressRoutes: RouterType = Router();

// GET /api/addresses/user/addresses - Get all addresses for user
userAddressRoutes.get('/user/addresses', requireUserAuth, (req, res) => userAddressHandlers.getAddresses(req, res));

// POST /api/addresses/user/addresses - Add a new address
userAddressRoutes.post('/user/addresses', requireUserAuth, (req, res) => userAddressHandlers.addAddress(req, res));

// PUT /api/addresses/user/addresses/:id - Update an address
userAddressRoutes.put('/user/addresses/:id', requireUserAuth, (req, res) => userAddressHandlers.updateAddress(req, res));

// DELETE /api/addresses/user/addresses/:id - Delete an address
userAddressRoutes.delete('/user/addresses/:id', requireUserAuth, (req, res) => userAddressHandlers.deleteAddress(req, res));

// PATCH /api/addresses/user/addresses/:id/activate - Set an address as active
userAddressRoutes.patch('/user/addresses/:id/activate', requireUserAuth, (req, res) => userAddressHandlers.setActiveAddress(req, res));

//Technician address routes

export const technicianAddressRoutes: RouterType = Router();

// GET /api/addresses/technician/addresses - Get all addresses for technician
technicianAddressRoutes.get('/technician/addresses', requireTechnicianAuth, (req, res) => technicianAddressHandlers.getAddresses(req, res));

// POST /api/addresses/technician/addresses - Add a new address
technicianAddressRoutes.post('/technician/addresses', requireTechnicianAuth, (req, res) => technicianAddressHandlers.addAddress(req, res));

// PUT /api/addresses/technician/addresses/:id - Update an address
technicianAddressRoutes.put('/technician/addresses/:id', requireTechnicianAuth, (req, res) => technicianAddressHandlers.updateAddress(req, res));

// DELETE /api/addresses/technician/addresses/:id - Delete an address
technicianAddressRoutes.delete('/technician/addresses/:id', requireTechnicianAuth, (req, res) => technicianAddressHandlers.deleteAddress(req, res));

// PATCH /api/addresses/technician/addresses/:id/activate - Set an address as active
technicianAddressRoutes.patch('/technician/addresses/:id/activate', requireTechnicianAuth, (req, res) => technicianAddressHandlers.setActiveAddress(req, res));

