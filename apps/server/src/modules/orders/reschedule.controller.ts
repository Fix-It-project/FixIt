import type { Request, Response } from "express";
import { normalizeError } from "../../shared/errors/index.js";
import { requireActorId } from "../../shared/utils/request-auth.js";
import { type Actor, rescheduleService } from "./reschedule.service.js";

export class RescheduleController {
	async requestReschedule(req: Request, res: Response, actor: Actor) {
		try {
			const result = await rescheduleService.createRequest({
				orderId: req.params.id as string,
				actor,
				actorId: requireActorId(req, actor),
				proposedDate: req.body.proposed_scheduled_date,
				reason: req.body.reason,
			});
			return res.status(201).json({ data: result });
		} catch (err: unknown) {
			const { status, message } = normalizeError(err);
			return res.status(status).json({ error: message });
		}
	}

	async approveReschedule(req: Request, res: Response, actor: Actor) {
		try {
			const result = await rescheduleService.approve({
				orderId: req.params.id as string,
				actor,
				actorId: requireActorId(req, actor),
			});
			return res.status(200).json({ data: result });
		} catch (err: unknown) {
			const { status, message } = normalizeError(err);
			return res.status(status).json({ error: message });
		}
	}

	async rejectReschedule(req: Request, res: Response, actor: Actor) {
		try {
			const result = await rescheduleService.reject({
				orderId: req.params.id as string,
				actor,
				actorId: requireActorId(req, actor),
				reason: req.body.reason,
			});
			return res.status(200).json({ data: result });
		} catch (err: unknown) {
			const { status, message } = normalizeError(err);
			return res.status(status).json({ error: message });
		}
	}

	async getReschedule(req: Request, res: Response, actor: Actor) {
		try {
			const result = await rescheduleService.getForActor(
				req.params.id as string,
				actor,
				requireActorId(req, actor),
			);
			return res.status(200).json({ data: result });
		} catch (err: unknown) {
			const { status, message } = normalizeError(err);
			return res.status(status).json({ error: message });
		}
	}

	async withdrawReschedule(req: Request, res: Response, actor: Actor) {
		try {
			const result = await rescheduleService.withdraw({
				orderId: req.params.id as string,
				actor,
				actorId: requireActorId(req, actor),
			});
			return res.status(200).json({ data: result });
		} catch (err: unknown) {
			const { status, message } = normalizeError(err);
			return res.status(status).json({ error: message });
		}
	}
}

export const rescheduleController = new RescheduleController();
