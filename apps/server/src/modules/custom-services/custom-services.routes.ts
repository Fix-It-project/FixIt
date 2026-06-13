import express, { type Router } from "express";
import {
	CreateCustomServiceBodySchema,
	CustomServiceIdParamSchema,
	RejectCustomServiceBodySchema,
} from "../../shared/dtos/index.js";
import { requireAdminAuth } from "../../shared/middlewares/admin-auth.middleware.js";
import { requireTechnicianAuth } from "../../shared/middlewares/technician-auth.middleware.js";
import { validate } from "../../shared/middlewares/validate.middleware.js";
import { customServicesController } from "./custom-services.controller.js";

// Mounted at /api/technicians (technician self).
export const technicianCustomServiceRoutes: Router = express.Router();

technicianCustomServiceRoutes.post(
	"/me/service-requests",
	requireTechnicianAuth,
	validate({ body: CreateCustomServiceBodySchema }),
	customServicesController.submitOwn,
);
technicianCustomServiceRoutes.get(
	"/me/service-requests",
	requireTechnicianAuth,
	customServicesController.listOwn,
);

// Mounted at /api/admin/service-requests (admin).
export const adminCustomServiceRoutes: Router = express.Router();

adminCustomServiceRoutes.get(
	"/",
	requireAdminAuth,
	customServicesController.listForAdmin,
);
adminCustomServiceRoutes.patch(
	"/:id/approve",
	requireAdminAuth,
	validate({ params: CustomServiceIdParamSchema }),
	customServicesController.approve,
);
adminCustomServiceRoutes.patch(
	"/:id/reject",
	requireAdminAuth,
	validate({
		params: CustomServiceIdParamSchema,
		body: RejectCustomServiceBodySchema,
	}),
	customServicesController.reject,
);
