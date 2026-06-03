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

	getOrders: RequestHandler = asyncHandler(
		async (_req: Request, res: Response) => {
			const data = await adminDashboardService.getAllOrders();
			res.status(200).json({ data });
		},
	);

	getOrderDetail: RequestHandler = asyncHandler(
		async (req: Request, res: Response) => {
			const { id } = req.params as { id: string };
			const data = await adminDashboardService.getOrderDetail(id);
			res.status(200).json({ data });
		},
	);

	getHomeowners: RequestHandler = asyncHandler(
		async (_req: Request, res: Response) => {
			const data = await adminDashboardService.getHomeowners();
			res.status(200).json({ data });
		},
	);

	blockHomeowner: RequestHandler = asyncHandler(
		async (req: Request, res: Response) => {
			const { id } = req.params as { id: string };
			const { reason } = req.body as { reason: string };
			const data = await adminDashboardService.blockHomeowner(id, reason);
			req.log.info({ action: "admin_block_homeowner", homeownerId: id, reason });
			res.status(200).json({ data });
		},
	);

	unblockHomeowner: RequestHandler = asyncHandler(
		async (req: Request, res: Response) => {
			const { id } = req.params as { id: string };
			const data = await adminDashboardService.unblockHomeowner(id);
			req.log.info({ action: "admin_unblock_homeowner", homeownerId: id });
			res.status(200).json({ data });
		},
	);
}

export const adminDashboardController = new AdminDashboardController();
