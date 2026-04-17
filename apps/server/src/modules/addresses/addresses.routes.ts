import { Router, type Router as RouterType } from 'express';
import { userAddressHandlers, technicianAddressHandlers } from './addresses.controller.js';
import { requireUserAuth } from '../../shared/middlewares/user-auth.middleware.js';
import { requireTechnicianAuth } from '../../shared/middlewares/technician-auth.middleware.js';
import { validate } from '../../shared/middlewares/validate.middleware.js';
import { AddressBodySchema, AddressUpdateBodySchema, AddressIdParamsSchema } from '../../shared/dtos/index.js';

export const userAddressRoutes: RouterType = Router();

userAddressRoutes.get('/user/addresses', requireUserAuth, (req, res) => userAddressHandlers.getAddresses(req, res));
userAddressRoutes.post('/user/addresses', requireUserAuth, validate({ body: AddressBodySchema }), (req, res) => userAddressHandlers.addAddress(req, res));
userAddressRoutes.put('/user/addresses/:id', requireUserAuth, validate({ params: AddressIdParamsSchema, body: AddressUpdateBodySchema }), (req, res) => userAddressHandlers.updateAddress(req, res));
userAddressRoutes.delete('/user/addresses/:id', requireUserAuth, validate({ params: AddressIdParamsSchema }), (req, res) => userAddressHandlers.deleteAddress(req, res));
userAddressRoutes.patch('/user/addresses/:id/activate', requireUserAuth, validate({ params: AddressIdParamsSchema }), (req, res) => userAddressHandlers.setActiveAddress(req, res));

export const technicianAddressRoutes: RouterType = Router();

technicianAddressRoutes.get('/technician/addresses', requireTechnicianAuth, (req, res) => technicianAddressHandlers.getAddresses(req, res));
technicianAddressRoutes.post('/technician/addresses', requireTechnicianAuth, validate({ body: AddressBodySchema }), (req, res) => technicianAddressHandlers.addAddress(req, res));
technicianAddressRoutes.put('/technician/addresses/:id', requireTechnicianAuth, validate({ params: AddressIdParamsSchema, body: AddressUpdateBodySchema }), (req, res) => technicianAddressHandlers.updateAddress(req, res));
technicianAddressRoutes.delete('/technician/addresses/:id', requireTechnicianAuth, validate({ params: AddressIdParamsSchema }), (req, res) => technicianAddressHandlers.deleteAddress(req, res));
technicianAddressRoutes.patch('/technician/addresses/:id/activate', requireTechnicianAuth, validate({ params: AddressIdParamsSchema }), (req, res) => technicianAddressHandlers.setActiveAddress(req, res));
