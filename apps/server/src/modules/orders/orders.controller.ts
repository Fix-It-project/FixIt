import type { Request, RequestHandler, Response } from "express";
import { AppError } from "../../shared/errors/app-error.js";
import { asyncHandler } from "../../shared/errors/async-handler.js";
import {
	requireTechnicianId,
	requireUserId,
} from "../../shared/utils/request-auth.js";
import { lifecycleService } from "./lifecycle/index.js";
import {
	mapTechnicianPatchToAction,
	mapUserPatchToAction,
} from "./lifecycle/legacy-patch-shim.js";
import { ordersService } from "./orders.service.js";

export class OrdersController {
	createOrder: RequestHandler = asyncHandler(async (req: Request, res: Response) => {
		const order = await lifecycleService.submitOrder(
			requireUserId(req),
			req.body,
		);
		req.log.info({ action: 'order_created', orderId: order.id, userId: requireUserId(req) });
		res.status(201).json({ data: order });
	});

	getUserOrders: RequestHandler = asyncHandler(async (req: Request, res: Response) => {
		const orders = await ordersService.getUserOrders(requireUserId(req));
		res.status(200).json({ data: orders });
	});

	getUserOrderById: RequestHandler = asyncHandler(async (req: Request, res: Response) => {
		const order = await ordersService.getUserOrderById(
			requireUserId(req),
			req.params.id as string,
		);
		if (!order) {
			throw AppError.notFound('Order not found');
		}
		res.status(200).json({ data: order });
	});

	userUpdateOrder: RequestHandler = asyncHandler(async (req: Request, res: Response) => {
		const action = mapUserPatchToAction(req.body);
		if (action.kind === "cancel") {
			const order = await lifecycleService.cancelOrder(
				req.params.id as string,
				requireUserId(req),
				"user",
				action.reason,
			);
			req.log.info({ action: 'order_cancelled', orderId: req.params.id, userId: requireUserId(req) });
			res.status(200).json({ data: order });
			return;
		}
		throw AppError.badRequest("invalid_legacy_patch_payload");
	});

	getTechnicianOrders: RequestHandler = asyncHandler(async (req: Request, res: Response) => {
		const orders = await ordersService.getTechnicianOrders(
			requireTechnicianId(req),
		);
		res.status(200).json({ data: orders });
	});

	getTechnicianOrderById: RequestHandler = asyncHandler(async (req: Request, res: Response) => {
		const order = await ordersService.getTechnicianOrderById(
			requireTechnicianId(req),
			req.params.id as string,
		);
		if (!order) {
			throw AppError.notFound('Order not found');
		}
		res.status(200).json({ data: order });
	});

	technicianUpdateOrder: RequestHandler = asyncHandler(async (req: Request, res: Response) => {
		const action = mapTechnicianPatchToAction(req.body);
		const orderId = req.params.id as string;
		const techId = requireTechnicianId(req);

		switch (action.kind) {
			case "tech_accept": {
				const order = await lifecycleService.techAccept(orderId, techId);
				req.log.info({ action: 'order_accepted', orderId, technicianId: techId });
				res.status(200).json({ data: order });
				break;
			}
			case "tech_decline": {
				const order = await lifecycleService.techDecline(
					orderId,
					techId,
					action.reason,
				);
				req.log.info({ action: 'order_declined', orderId, technicianId: techId });
				res.status(200).json({ data: order });
				break;
			}
			case "tech_cancel": {
				const order = await lifecycleService.cancelOrder(
					orderId,
					techId,
					"technician",
					action.reason,
				);
				req.log.info({ action: 'order_cancelled_by_tech', orderId, technicianId: techId });
				res.status(200).json({ data: order });
				break;
			}
			case "gone": {
				res.status(410).json({
					error: { code: "legacy_endpoint_gone", hint: action.hint },
				});
				break;
			}
			default:
				throw AppError.badRequest("invalid_legacy_patch_payload");
		}
	});
}

export const ordersController = new OrdersController();
