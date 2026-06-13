import type { Request, RequestHandler, Response } from "express";
import { AppError } from "../../shared/errors/app-error.js";
import { asyncHandler } from "../../shared/errors/async-handler.js";
import { customServicesService } from "./custom-services.service.js";

export class CustomServicesController {
	// ---- Technician (self) ----

	submitOwn: RequestHandler = asyncHandler(
		async (req: Request, res: Response) => {
			const technicianId = (req as any).technician?.id;
			if (!technicianId) {
				throw AppError.unauthorized("Technician not authenticated", {
					token: "no_technician",
				});
			}
			const { name, description, min_price, max_price } = req.body;
			const request = await customServicesService.submitRequest(technicianId, {
				name,
				description,
				min_price,
				max_price,
			});
			req.log.info({ action: "custom_service_submitted", technicianId });
			res.status(201).json({ request });
		},
	);

	listOwn: RequestHandler = asyncHandler(
		async (req: Request, res: Response) => {
			const technicianId = (req as any).technician?.id;
			if (!technicianId) {
				throw AppError.unauthorized("Technician not authenticated", {
					token: "no_technician",
				});
			}
			const requests = await customServicesService.listOwn(technicianId);
			res.json({ requests });
		},
	);

	// ---- Admin ----

	listForAdmin: RequestHandler = asyncHandler(
		async (req: Request, res: Response) => {
			const status = req.query.status as string | undefined;
			const data = await customServicesService.listRequests(status);
			res.status(200).json({ data });
		},
	);

	approve: RequestHandler = asyncHandler(
		async (req: Request, res: Response) => {
			const { id } = req.params as { id: string };
			const data = await customServicesService.approve(id);
			req.log.info({ action: "admin_approve_custom_service", requestId: id });
			res.status(200).json({ data });
		},
	);

	reject: RequestHandler = asyncHandler(async (req: Request, res: Response) => {
		const { id } = req.params as { id: string };
		const { reason } = req.body as { reason?: string };
		const data = await customServicesService.reject(id, reason);
		req.log.info({ action: "admin_reject_custom_service", requestId: id });
		res.status(200).json({ data });
	});
}

export const customServicesController = new CustomServicesController();
