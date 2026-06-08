import express, { type Router } from "express";
import multer from "multer";
import {
	TechnicianIdParamsSchema,
	TechnicianListQuerySchema,
	TechnicianSearchQuerySchema,
	UpdateTechnicianSelfBodySchema,
} from "../../shared/dtos/index.js";
import { requireTechnicianAuth } from "../../shared/middlewares/technician-auth.middleware.js";
import { requireUserAuth } from "../../shared/middlewares/user-auth.middleware.js";
import { validate } from "../../shared/middlewares/validate.middleware.js";
import { techniciansController } from "./technicians.controller.js";

const upload = multer({ storage: multer.memoryStorage() });

export const techniciansRoutes: Router = express.Router({ mergeParams: true });

techniciansRoutes.get(
	"/",
	validate({ query: TechnicianListQuerySchema }),
	techniciansController.getByCategoryId,
);
techniciansRoutes.get(
	"/search",
	validate({ query: TechnicianSearchQuerySchema }),
	techniciansController.searchInCategory,
);

export const technicianProfileRoutes: Router = express.Router();

technicianProfileRoutes.get(
	"/:id/profile",
	requireUserAuth,
	validate({ params: TechnicianIdParamsSchema }),
	techniciansController.getProfile,
);
technicianProfileRoutes.get(
	"/:id/services",
	requireUserAuth,
	validate({ params: TechnicianIdParamsSchema }),
	techniciansController.getServices,
);

export const technicianSelfRoutes: Router = express.Router();

technicianSelfRoutes.get(
	"/me",
	requireTechnicianAuth,
	techniciansController.getSelf,
);
technicianSelfRoutes.put(
	"/me",
	requireTechnicianAuth,
	validate({ body: UpdateTechnicianSelfBodySchema }),
	techniciansController.updateSelf,
);
technicianSelfRoutes.post(
	"/me/profile-image",
	requireTechnicianAuth,
	upload.single("profile_image"),
	techniciansController.uploadProfileImage,
);
