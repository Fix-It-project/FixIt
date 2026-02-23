import { Router, type Router as RouterType } from 'express';
import { userAddressHandlers, technicianAddressHandlers } from './addresses.controller.js';

//User address routes

export const userAddressRoutes: RouterType = Router();

// GET /api/auth/addresses - Get all addresses for user
userAddressRoutes.get('/addresses', (req, res) => userAddressHandlers.getAddresses(req, res));

// POST /api/auth/addresses - Add a new address
userAddressRoutes.post('/addresses', (req, res) => userAddressHandlers.addAddress(req, res));

// PUT /api/auth/addresses/:id - Update an address
userAddressRoutes.put('/addresses/:id', (req, res) => userAddressHandlers.updateAddress(req, res));

// DELETE /api/auth/addresses/:id - Delete an address
userAddressRoutes.delete('/addresses/:id', (req, res) => userAddressHandlers.deleteAddress(req, res));

//Technician address routes

export const technicianAddressRoutes: RouterType = Router();

// GET /api/technician-auth/addresses - Get all addresses for technician
technicianAddressRoutes.get('/addresses', (req, res) => technicianAddressHandlers.getAddresses(req, res));

// POST /api/technician-auth/addresses - Add a new address
technicianAddressRoutes.post('/addresses', (req, res) => technicianAddressHandlers.addAddress(req, res));

// PUT /api/technician-auth/addresses/:id - Update an address
technicianAddressRoutes.put('/addresses/:id', (req, res) => technicianAddressHandlers.updateAddress(req, res));

// DELETE /api/technician-auth/addresses/:id - Delete an address
technicianAddressRoutes.delete('/addresses/:id', (req, res) => technicianAddressHandlers.deleteAddress(req, res));
