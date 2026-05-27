import type { Request, RequestHandler, Response } from 'express';
import type { TechnicianSort } from '../../shared/dtos/index.js';
import { AppError } from '../../shared/errors/app-error.js';
import { asyncHandler } from '../../shared/errors/async-handler.js';
import { categoriesRepository } from '../categories/categories.repository.js';
import { storageRepository } from '../../shared/storage/storage.repository.js';
import { parseCoords } from '../../shared/utils/technicians/index.js';
import { TechniciansService } from './technicians.service.js';
import { techniciansRepository } from './technicians.repository.js';

const service = new TechniciansService(techniciansRepository, categoriesRepository, storageRepository);

export class TechniciansController {
	getByCategoryId: RequestHandler = asyncHandler(async (req: Request, res: Response) => {
		const categoryId = req.params.categoryId as string;
		const { lat, lng } = parseCoords(req);
		const sort = req.query.sort as TechnicianSort | undefined;
		const technicians = await service.getTechniciansByCategory(
			categoryId,
			{ lat, lng, sort },
		);
		req.log.info({ action: 'technicians_list_by_category', categoryId });
		res.json({ technicians });
	});

	searchInCategory: RequestHandler = asyncHandler(async (req: Request, res: Response) => {
		const categoryId = req.params.categoryId as string;
		const query = (req.query.q as string | undefined)?.trim() ?? "";
		if (!query) {
			throw AppError.badRequest('Query parameter "q" is required');
		}
		const { lat, lng } = parseCoords(req);
		const sort = req.query.sort as TechnicianSort | undefined;
		const technicians = await service.searchTechniciansByCategory(
			categoryId,
			query,
			{ lat, lng, sort },
		);
		req.log.info({ action: 'technicians_search_in_category', categoryId, query });
		res.json({ technicians });
	});

	getProfile: RequestHandler = asyncHandler(async (req: Request, res: Response) => {
		const id = req.params.id as string;
		const profile = await service.getTechnicianProfile(id);
		req.log.info({ action: 'technician_profile_retrieved', technicianId: id });
		res.json({ profile });
	});

	getSelf: RequestHandler = asyncHandler(async (req: Request, res: Response) => {
		const technicianId = (req as any).technician?.id;
		if (!technicianId) {
			throw AppError.unauthorized('Technician not authenticated', { token: 'no_technician' });
		}
		const profile = await service.getSelf(technicianId);
		req.log.info({ action: 'technician_self_profile_retrieved', technicianId });
		res.json({ profile });
	});

	updateSelf: RequestHandler = asyncHandler(async (req: Request, res: Response) => {
		const technicianId = (req as any).technician?.id;
		if (!technicianId) {
			throw AppError.unauthorized('Technician not authenticated', { token: 'no_technician' });
		}
		const { first_name, last_name, phone, description } = req.body;
		const profile = await service.updateSelf(technicianId, {
			first_name,
			last_name,
			phone,
			description,
		});
		req.log.info({ action: 'technician_self_profile_updated', technicianId });
		res.json({ profile });
	});

	uploadProfileImage: RequestHandler = asyncHandler(async (req: Request, res: Response) => {
		const technicianId = (req as any).technician?.id;
		if (!technicianId) {
			throw AppError.unauthorized('Technician not authenticated', { token: 'no_technician' });
		}
		if (!req.file) {
			throw AppError.badRequest('No file provided. Send a multipart/form-data request with field "profile_image".');
		}
		const result = await service.uploadProfileImage(
			technicianId,
			req.file,
		);
		req.log.info({ action: 'technician_profile_image_uploaded', technicianId });
		res.json(result);
	});
}

export const techniciansController = new TechniciansController();
