import type { Request, RequestHandler, Response } from "express";
import type { ReportsListQuery } from "../../shared/dtos/report.dto.js";
import { asyncHandler } from "../../shared/errors/async-handler.js";
import {
	requireTechnicianId,
	requireUserId,
} from "../../shared/utils/request-auth.js";
import { reportsService } from "./reports.service.js";

export class ReportsController {
	// ---- Reporters (self) ----

	submitAsUser: RequestHandler = asyncHandler(
		async (req: Request, res: Response) => {
			const userId = requireUserId(req);
			const { orderId, label, summary } = req.body;
			const report = await reportsService.submit(userId, "user", {
				orderId,
				label,
				summary,
			});
			req.log.info({
				action: "report_submitted",
				reporterRole: "user",
				reporterId: userId,
			});
			res.status(201).json({ report });
		},
	);

	submitAsTechnician: RequestHandler = asyncHandler(
		async (req: Request, res: Response) => {
			const technicianId = requireTechnicianId(req);
			const { orderId, label, summary } = req.body;
			const report = await reportsService.submit(technicianId, "technician", {
				orderId,
				label,
				summary,
			});
			req.log.info({
				action: "report_submitted",
				reporterRole: "technician",
				reporterId: technicianId,
			});
			res.status(201).json({ report });
		},
	);

	// ---- Admin ----

	listForAdmin: RequestHandler = asyncHandler(
		async (req: Request, res: Response) => {
			const params = req.query as unknown as ReportsListQuery;
			const { data, total, counts } = await reportsService.listReports(params);
			res.status(200).json({ data, total, counts });
		},
	);

	resolve: RequestHandler = asyncHandler(
		async (req: Request, res: Response) => {
			const { id } = req.params as { id: string };
			const data = await reportsService.resolve(id);
			req.log.info({ action: "admin_resolve_report", reportId: id });
			res.status(200).json({ data });
		},
	);

	dismiss: RequestHandler = asyncHandler(
		async (req: Request, res: Response) => {
			const { id } = req.params as { id: string };
			const data = await reportsService.dismiss(id);
			req.log.info({ action: "admin_dismiss_report", reportId: id });
			res.status(200).json({ data });
		},
	);

	reopen: RequestHandler = asyncHandler(async (req: Request, res: Response) => {
		const { id } = req.params as { id: string };
		const data = await reportsService.reopen(id);
		req.log.info({ action: "admin_reopen_report", reportId: id });
		res.status(200).json({ data });
	});

	warn: RequestHandler = asyncHandler(async (req: Request, res: Response) => {
		const { id } = req.params as { id: string };
		const data = await reportsService.warn(id);
		req.log.info({ action: "admin_warn_report", reportId: id });
		res.status(200).json({ data });
	});
}

export const reportsController = new ReportsController();
