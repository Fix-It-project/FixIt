import { type Request, type RequestHandler, type Response } from "express";
import { asyncHandler } from "../../shared/errors/async-handler.js";
import type { SeriesRange } from "./admin-dashboard.service.js";
import { adminDashboardService } from "./admin-dashboard.service.js";

export class AdminDashboardController {
	getSummary: RequestHandler = asyncHandler(
		async (_req: Request, res: Response) => {
			const data = await adminDashboardService.getSummary();
			res.status(200).json({ data });
		},
	);

	getOrdersSeries: RequestHandler = asyncHandler(
		async (req: Request, res: Response) => {
			const range = (req.query.range as SeriesRange) ?? "30d";
			const data = await adminDashboardService.getOrdersSeries(range);
			res.status(200).json({ data });
		},
	);
}

export const adminDashboardController = new AdminDashboardController();
