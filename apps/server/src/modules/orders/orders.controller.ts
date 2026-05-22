import type { NextFunction, Request, Response } from "express";
import { AppError, normalizeError } from "../../shared/errors/index.js";
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

/**
 * OrdersController — Phase 2 Plan 02-04
 *
 * - createOrder: thin wrapper around `lifecycleService.submitOrder` (D2-carryover from 02-03).
 * - userUpdateOrder / technicianUpdateOrder: legacy PATCH shims that translate
 *   body shapes via `legacy-patch-shim` and delegate to `lifecycleService`.
 * - PATCH /technician/orders/:id with body `{status:'completed'}` returns HTTP
 *   410 Gone per D3 with the documented hint payload — clients must adopt the
 *   new dual-confirm + payment endpoints.
 * - The controller NEVER touches supabase directly.
 *
 * Note: file attachments are intentionally NOT forwarded by this createOrder
 * shim. The Plan 02-02 lifecycle.submitOrder accepts an optional `attachment`
 * URL only — uploading is handled out-of-band by the storage repository and
 * an attachment-update verb (introduced in Phase 1 storage flow). The legacy
 * multipart attachment field is preserved at the route level but ignored by
 * this shim until the storage migration in Phase 6.
 */
export class OrdersController {
	async createOrder(req: Request, res: Response, _next: NextFunction) {
		try {
			const order = await lifecycleService.submitOrder(
				requireUserId(req),
				req.body,
			);
			return res.status(201).json({ data: order });
		} catch (err: unknown) {
			const { status, message } = normalizeError(err);
			return res.status(status).json({ error: message });
		}
	}

	async getUserOrders(req: Request, res: Response) {
		try {
			const orders = await ordersService.getUserOrders(requireUserId(req));
			return res.status(200).json({ data: orders });
		} catch (err: unknown) {
			const { status, message } = normalizeError(err);
			return res.status(status).json({ error: message });
		}
	}

	async getUserOrderById(req: Request, res: Response) {
		try {
			const order = await ordersService.getUserOrderById(
				requireUserId(req),
				req.params.id as string,
			);
			return res.status(200).json({ data: order });
		} catch (err: unknown) {
			const { status, message } = normalizeError(err);
			return res.status(status).json({ error: message });
		}
	}

	async userUpdateOrder(req: Request, res: Response, next: NextFunction) {
		try {
			const action = mapUserPatchToAction(req.body);
			if (action.kind === "cancel") {
				const order = await lifecycleService.cancelOrder(
					req.params.id as string,
					requireUserId(req),
					"user",
					action.reason,
				);
				return res.status(200).json({ data: order });
			}
			// Any other discriminant for the user PATCH path is unreachable today —
			// the shim only ever returns 'cancel' for users. Fail closed for safety.
			return next(AppError.badRequest("invalid_legacy_patch_payload"));
		} catch (err: unknown) {
			return next(err);
		}
	}

	async getTechnicianOrders(req: Request, res: Response) {
		try {
			const orders = await ordersService.getTechnicianOrders(
				requireTechnicianId(req),
			);
			return res.status(200).json({ data: orders });
		} catch (err: unknown) {
			const { status, message } = normalizeError(err);
			return res.status(status).json({ error: message });
		}
	}

	async getTechnicianOrderById(req: Request, res: Response) {
		try {
			const order = await ordersService.getTechnicianOrderById(
				requireTechnicianId(req),
				req.params.id as string,
			);
			return res.status(200).json({ data: order });
		} catch (err: unknown) {
			const { status, message } = normalizeError(err);
			return res.status(status).json({ error: message });
		}
	}

	async technicianUpdateOrder(req: Request, res: Response, next: NextFunction) {
		try {
			const action = mapTechnicianPatchToAction(req.body);
			const orderId = req.params.id as string;
			const techId = requireTechnicianId(req);

			switch (action.kind) {
				case "tech_accept": {
					const order = await lifecycleService.techAccept(orderId, techId);
					return res.status(200).json({ data: order });
				}
				case "tech_decline": {
					const order = await lifecycleService.techDecline(
						orderId,
						techId,
						action.reason,
					);
					return res.status(200).json({ data: order });
				}
				case "tech_cancel": {
					const order = await lifecycleService.cancelOrder(
						orderId,
						techId,
						"technician",
						action.reason,
					);
					return res.status(200).json({ data: order });
				}
				case "gone": {
					return res.status(410).json({
						error: { code: "legacy_endpoint_gone", hint: action.hint },
					});
				}
				default:
					return next(AppError.badRequest("invalid_legacy_patch_payload"));
			}
		} catch (err: unknown) {
			return next(err);
		}
	}
}

export const ordersController = new OrdersController();
