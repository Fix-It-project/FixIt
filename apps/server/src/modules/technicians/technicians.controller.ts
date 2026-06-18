import type { Request, RequestHandler, Response } from "express";
import type { TechnicianSort } from "../../shared/dtos/index.js";
import { AppError } from "../../shared/errors/app-error.js";
import { asyncHandler } from "../../shared/errors/async-handler.js";
import { storageRepository } from "../../shared/storage/storage.repository.js";
import { parseCoords } from "../../shared/utils/technicians/index.js";
import { categoriesRepository } from "../categories/categories.repository.js";
import { techniciansRepository } from "./technicians.repository.js";
import { TechniciansService } from "./technicians.service.js";
import { techniciansStatsRepository } from "./technicians-stats.repository.js";

const service = new TechniciansService(
	techniciansRepository,
	categoriesRepository,
	storageRepository,
	techniciansStatsRepository,
);

export class TechniciansController {
	getByCategoryId: RequestHandler = asyncHandler(
		async (req: Request, res: Response) => {
			const categoryId = req.params.categoryId as string;
			const { lat, lng } = parseCoords(req);
			const { sort, limit, offset } = req.query as unknown as {
				sort?: TechnicianSort;
				limit: number;
				offset: number;
			};
			const technicians = await service.getTechniciansByCategory(categoryId, {
				lat,
				lng,
				sort,
				limit,
				offset,
			});
			req.log.info({ action: "technicians_list_by_category", categoryId });
			res.json({ technicians });
		},
	);

	searchInCategory: RequestHandler = asyncHandler(
		async (req: Request, res: Response) => {
			const categoryId = req.params.categoryId as string;
			const query = (req.query.q as string | undefined)?.trim() ?? "";
			if (!query) {
				throw AppError.badRequest('Query parameter "q" is required');
			}
			const { lat, lng } = parseCoords(req);
			const { sort, limit, offset } = req.query as unknown as {
				sort?: TechnicianSort;
				limit: number;
				offset: number;
			};
			const technicians = await service.searchTechniciansByCategory(
				categoryId,
				query,
				{ lat, lng, sort, limit, offset },
			);
			req.log.info({
				action: "technicians_search_in_category",
				categoryId,
				query,
			});
			res.json({ technicians });
		},
	);

	getProfile: RequestHandler = asyncHandler(
		async (req: Request, res: Response) => {
			const id = req.params.id as string;
			const profile = await service.getTechnicianProfile(id);
			req.log.info({
				action: "technician_profile_retrieved",
				technicianId: id,
			});
			res.json({ profile });
		},
	);

	getServices: RequestHandler = asyncHandler(
		async (req: Request, res: Response) => {
			const id = req.params.id as string;
			const services = await service.getTechnicianServices(id);
			req.log.info({
				action: "technician_services_retrieved",
				technicianId: id,
			});
			res.json({ services });
		},
	);

	getSelf: RequestHandler = asyncHandler(
		async (req: Request, res: Response) => {
			const technicianId = (req as any).technician?.id;
			if (!technicianId) {
				throw AppError.unauthorized("Technician not authenticated", {
					token: "no_technician",
				});
			}
			const profile = await service.getSelf(technicianId);
			req.log.info({
				action: "technician_self_profile_retrieved",
				technicianId,
			});
			res.json({ profile });
		},
	);

	updateSelf: RequestHandler = asyncHandler(
		async (req: Request, res: Response) => {
			const technicianId = (req as any).technician?.id;
			if (!technicianId) {
				throw AppError.unauthorized("Technician not authenticated", {
					token: "no_technician",
				});
			}
			const { first_name, last_name, phone, description } = req.body;
			const profile = await service.updateSelf(technicianId, {
				first_name,
				last_name,
				phone,
				description,
			});
			req.log.info({ action: "technician_self_profile_updated", technicianId });
			res.json({ profile });
		},
	);

	completeScheduleSetup: RequestHandler = asyncHandler(
		async (req: Request, res: Response) => {
			const technicianId = (req as any).technician?.id;
			if (!technicianId) {
				throw AppError.unauthorized("Technician not authenticated", {
					token: "no_technician",
				});
			}
			const profile = await service.completeScheduleSetup(technicianId);
			req.log.info({
				action: "technician_schedule_setup_completed",
				technicianId,
			});
			res.json({ profile });
		},
	);

	updateAvailability: RequestHandler = asyncHandler(
		async (req: Request, res: Response) => {
			const technicianId = (req as any).technician?.id;
			if (!technicianId) {
				throw AppError.unauthorized("Technician not authenticated", {
					token: "no_technician",
				});
			}
			const { is_available } = req.body as { is_available: boolean };
			const profile = await service.updateAvailability(
				technicianId,
				is_available,
			);
			req.log.info({
				action: "technician_availability_updated",
				technicianId,
				is_available,
			});
			res.json({ profile });
		},
	);

	getStats: RequestHandler = asyncHandler(
		async (req: Request, res: Response) => {
			const technicianId = (req as any).technician?.id;
			if (!technicianId) {
				throw AppError.unauthorized("Technician not authenticated", {
					token: "no_technician",
				});
			}
			const stats = await service.getStats(technicianId);
			req.log.info({ action: "technician_stats_retrieved", technicianId });
			res.json({ stats });
		},
	);

	getWallet: RequestHandler = asyncHandler(
		async (req: Request, res: Response) => {
			const technicianId = (req as any).technician?.id;
			if (!technicianId) {
				throw AppError.unauthorized("Technician not authenticated", {
					token: "no_technician",
				});
			}
			const wallet = await service.getWallet(technicianId);
			req.log.info({ action: "technician_wallet_retrieved", technicianId });
			res.json(wallet);
		},
	);

	uploadProfileImage: RequestHandler = asyncHandler(
		async (req: Request, res: Response) => {
			const technicianId = (req as any).technician?.id;
			if (!technicianId) {
				throw AppError.unauthorized("Technician not authenticated", {
					token: "no_technician",
				});
			}
			if (!req.file) {
				throw AppError.badRequest(
					'No file provided. Send a multipart/form-data request with field "profile_image".',
				);
			}
			const result = await service.uploadProfileImage(technicianId, req.file);
			req.log.info({
				action: "technician_profile_image_uploaded",
				technicianId,
			});
			res.json(result);
		},
	);
}

export const techniciansController = new TechniciansController();
