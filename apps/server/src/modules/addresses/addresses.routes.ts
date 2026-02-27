import { Router, type Router as RouterType } from 'express';
import { userAddressHandlers, technicianAddressHandlers } from './addresses.controller.js';

//User address routes

export const userAddressRoutes: RouterType = Router();

// GET /api/addresses/user/addresses - Get all addresses for user
userAddressRoutes.get('/user/addresses', (req, res) => userAddressHandlers.getAddresses(req, res));

// POST /api/auth/addresses - Add a new address
userAddressRoutes.post('/user/addresses', (req, res) => userAddressHandlers.addAddress(req, res));

// PUT /api/auth/addresses/:id - Update an address
userAddressRoutes.put('/user/addresses/:id', (req, res) => userAddressHandlers.updateAddress(req, res));

// DELETE /api/auth/addresses/:id - Delete an address
userAddressRoutes.delete('/user/addresses/:id', (req, res) => userAddressHandlers.deleteAddress(req, res));

//Technician address routes

export const technicianAddressRoutes: RouterType = Router();

// GET /api/technician-auth/addresses - Get all addresses for technician
technicianAddressRoutes.get('/technician/addresses', (req, res) => technicianAddressHandlers.getAddresses(req, res));

// POST /api/technician-auth/addresses - Add a new address
technicianAddressRoutes.post('/technician/addresses', (req, res) => technicianAddressHandlers.addAddress(req, res));

// PUT /api/technician-auth/addresses/:id - Update an address
technicianAddressRoutes.put('/technician/addresses/:id', (req, res) => technicianAddressHandlers.updateAddress(req, res));

// DELETE /api/technician-auth/addresses/:id - Delete an address
technicianAddressRoutes.delete('/technician/addresses/:id', (req, res) => technicianAddressHandlers.deleteAddress(req, res));
