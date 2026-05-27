import type { Request, RequestHandler } from "express";
import { asyncHandler } from "../../shared/errors/async-handler.js";
import { requireActorId } from "../../shared/utils/request-auth.js";
import { type Actor, rescheduleService } from "./reschedule.service.js";

export class RescheduleController {
	createRequest = (actor: Actor): RequestHandler =>
		asyncHandler(async (req: Request, res) => {
			const result = await rescheduleService.createRequest({
				orderId: req.params.id as string,
				actor,
				actorId: requireActorId(req, actor),
				proposedDate: req.body.proposed_scheduled_date,
				proposedStartAt: req.body.proposed_scheduled_start_at,
				reason: req.body.reason,
			});
			req.log.info({ action: 'reschedule_requested', orderId: req.params.id, actor });
			res.status(201).json({ data: result });
		});

	approve = (actor: Actor): RequestHandler =>
		asyncHandler(async (req: Request, res) => {
			const result = await rescheduleService.approve({
				orderId: req.params.id as string,
				actor,
				actorId: requireActorId(req, actor),
			});
			req.log.info({ action: 'reschedule_approved', orderId: req.params.id, actor });
			res.status(200).json({ data: result });
		});

	reject = (actor: Actor): RequestHandler =>
		asyncHandler(async (req: Request, res) => {
			const result = await rescheduleService.reject({
				orderId: req.params.id as string,
				actor,
				actorId: requireActorId(req, actor),
				reason: req.body.reason,
			});
			req.log.info({ action: 'reschedule_rejected', orderId: req.params.id, actor });
			res.status(200).json({ data: result });
		});

	get = (actor: Actor): RequestHandler =>
		asyncHandler(async (req: Request, res) => {
			const result = await rescheduleService.getForActor(
				req.params.id as string,
				actor,
				requireActorId(req, actor),
			);
			res.status(200).json({ data: result });
		});

	withdraw = (actor: Actor): RequestHandler =>
		asyncHandler(async (req: Request, res) => {
			const result = await rescheduleService.withdraw({
				orderId: req.params.id as string,
				actor,
				actorId: requireActorId(req, actor),
			});
			req.log.info({ action: 'reschedule_withdrawn', orderId: req.params.id, actor });
			res.status(200).json({ data: result });
		});
}

export const rescheduleController = new RescheduleController();
