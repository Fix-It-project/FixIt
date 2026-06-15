import express, { type Router } from "express";
import {
	CreateReportBodySchema,
	ReportIdParamSchema,
} from "../../shared/dtos/index.js";
import { requireAdminAuth } from "../../shared/middlewares/admin-auth.middleware.js";
import { requireTechnicianAuth } from "../../shared/middlewares/technician-auth.middleware.js";
import { requireUserAuth } from "../../shared/middlewares/user-auth.middleware.js";
import { validate } from "../../shared/middlewares/validate.middleware.js";
import { reportsController } from "./reports.controller.js";

// Mounted at /api/reports (user self).
export const userReportRoutes: Router = express.Router();

userReportRoutes.post(
	"/",
	requireUserAuth,
	validate({ body: CreateReportBodySchema }),
	reportsController.submitAsUser,
);

// Mounted at /api/technicians (technician self).
export const technicianReportRoutes: Router = express.Router();

technicianReportRoutes.post(
	"/me/reports",
	requireTechnicianAuth,
	validate({ body: CreateReportBodySchema }),
	reportsController.submitAsTechnician,
);

// Mounted at /api/admin/reports (admin).
export const adminReportRoutes: Router = express.Router();

adminReportRoutes.get("/", requireAdminAuth, reportsController.listForAdmin);
adminReportRoutes.patch(
	"/:id/resolve",
	requireAdminAuth,
	validate({ params: ReportIdParamSchema }),
	reportsController.resolve,
);
adminReportRoutes.patch(
	"/:id/dismiss",
	requireAdminAuth,
	validate({ params: ReportIdParamSchema }),
	reportsController.dismiss,
);
adminReportRoutes.patch(
	"/:id/reopen",
	requireAdminAuth,
	validate({ params: ReportIdParamSchema }),
	reportsController.reopen,
);
adminReportRoutes.patch(
	"/:id/warn",
	requireAdminAuth,
	validate({ params: ReportIdParamSchema }),
	reportsController.warn,
);
