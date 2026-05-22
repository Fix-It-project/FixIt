import type { Request, Response } from "express";
import type { TechnicianSort } from "../../shared/dtos/index.js";
import { normalizeError } from "../../shared/errors/index.js";
import { requireTechnicianId } from "../../shared/utils/request-auth.js";
import { parseCoords } from "../../shared/utils/technicians/index.js";
import type { ITechniciansService } from "./technicians.service.js";

export class TechniciansController {
	constructor(private readonly service: ITechniciansService) {}

	async getByCategoryId(req: Request, res: Response): Promise<void> {
		try {
			const categoryId = req.params.categoryId as string;
			const { lat, lng } = parseCoords(req);
			const sort = req.query.sort as TechnicianSort | undefined;
			const technicians = await this.service.getTechniciansByCategory(
				categoryId,
				{ lat, lng, sort },
			);
			res.json({ technicians });
		} catch (err: unknown) {
			const { status, message } = normalizeError(err);
			res.status(status).json({ error: message });
		}
	}

	async searchInCategory(req: Request, res: Response): Promise<void> {
		try {
			const categoryId = req.params.categoryId as string;
			const query = (req.query.q as string | undefined)?.trim() ?? "";
			if (!query) {
				res.status(400).json({ error: 'Query parameter "q" is required' });
				return;
			}
			const { lat, lng } = parseCoords(req);
			const sort = req.query.sort as TechnicianSort | undefined;
			const technicians = await this.service.searchTechniciansByCategory(
				categoryId,
				query,
				{ lat, lng, sort },
			);
			res.json({ technicians });
		} catch (err: unknown) {
			const { status, message } = normalizeError(err);
			res.status(status).json({ error: message });
		}
	}

	async getProfile(req: Request, res: Response): Promise<void> {
		try {
			const id = req.params.id as string;
			const profile = await this.service.getTechnicianProfile(id);
			res.json({ profile });
		} catch (err: unknown) {
			const { status, message } = normalizeError(err);
			res.status(status).json({ error: message });
		}
	}

	async getSelf(req: Request, res: Response): Promise<void> {
		try {
			const technicianId = requireTechnicianId(req);
			const profile = await this.service.getSelf(technicianId);
			res.json({ profile });
		} catch (err: unknown) {
			const { status, message } = normalizeError(err);
			res.status(status).json({ error: message });
		}
	}

	async updateSelf(req: Request, res: Response): Promise<void> {
		try {
			const technicianId = requireTechnicianId(req);
			const { first_name, last_name, phone, description } = req.body;
			const profile = await this.service.updateSelf(technicianId, {
				first_name,
				last_name,
				phone,
				description,
			});
			res.json({ profile });
		} catch (err: unknown) {
			const { status, message } = normalizeError(err);
			res.status(status).json({ error: message });
		}
	}

	async uploadProfileImage(req: Request, res: Response): Promise<void> {
		try {
			const technicianId = requireTechnicianId(req);
			if (!req.file) {
				res.status(400).json({
					error:
						'No file provided. Send a multipart/form-data request with field "profile_image".',
				});
				return;
			}
			const result = await this.service.uploadProfileImage(
				technicianId,
				req.file,
			);
			res.json(result);
		} catch (err: unknown) {
			const { status, message } = normalizeError(err);
			res.status(status).json({ error: message });
		}
	}
}
