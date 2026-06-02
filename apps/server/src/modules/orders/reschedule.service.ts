import { AppError } from "../../shared/errors/index.js";
import { logger } from "../../shared/logger.js";
import {
	cairoMidnightUtc,
	hoursBetween,
	nowInCairo,
} from "../../shared/time/cairo-time.js";
import {
	assertFixedSlotStartAtInCairo,
	getCairoSlotHourFromIso,
} from "../../shared/time/fixed-slots.js";
import { technicianCalendarService } from "../technician-calendar/technician-calendar.service.js";
import { notificationsService } from "../notifications/notifications.service.js";
import { type Order, ordersRepository } from "./orders.repository.js";
import {
	type RescheduleRequest,
	rescheduleRepository,
} from "./reschedule.repository.js";

export type Actor = "user" | "technician";

export interface CreateRequestInput {
	orderId: string;
	actor: Actor;
	actorId: string;
	proposedDate: string; // YYYY-MM-DD
	proposedStartAt: string;
	reason: string;
}

export interface ApproveInput {
	orderId: string;
	actor: Actor;
	actorId: string;
}
export interface RejectInput {
	orderId: string;
	actor: Actor;
	actorId: string;
	reason: string;
}
export interface WithdrawInput {
	orderId: string;
	actor: Actor;
	actorId: string;
}

export interface ReconciledOrder {
	order: Order;
	request: RescheduleRequest | null;
}

const ISO_DATE = /^\d{4}-\d{2}-\d{2}$/;
const TERMINAL_STATUSES = new Set([
	"rejected",
	"cancelled_by_user",
	"cancelled_by_technician",
	"completed",
]);

function technicianName(order: Pick<Order, "technician_name">): string {
	return order.technician_name?.trim() || "The technician";
}

function customerName(order: Pick<Order, "user_name">): string {
	return order.user_name?.trim() || "The customer";
}

function customerSender(order: Pick<Order, "user_name">) {
	return {
		senderName: customerName(order),
	};
}

function technicianSender(
	order: Pick<Order, "technician_name" | "technician_image">,
) {
	return {
		senderName: technicianName(order),
		senderImageUrl: order.technician_image ?? undefined,
	};
}

export class RescheduleService {
	// ─── Public API ───────────────────────────────────────────────────────────

	async createRequest(input: CreateRequestInput): Promise<RescheduleRequest> {
		const order = await this.loadOrderForActor(
			input.orderId,
			input.actor,
			input.actorId,
		);
		await this.runValidationChain({
			order,
			proposedDate: input.proposedDate,
			proposedStartAt: input.proposedStartAt,
			reason: input.reason,
		});
		const request = await rescheduleRepository.createRequest({
			orderId: input.orderId,
			actor: input.actor,
			actorId: input.actorId,
			proposedDate: input.proposedDate,
			proposedStartAt: input.proposedStartAt,
			reason: input.reason,
		});
		const counterpartyRole = input.actor === "user" ? "technician" : "user";
		const counterpartyId =
			counterpartyRole === "user" ? order.user_id : order.technician_id;
		await this.notifyBestEffort({
			recipientRole: counterpartyRole,
			recipientId: counterpartyId,
			type: "reschedule_requested",
			title: "Reschedule requested",
			body:
				input.actor === "user"
					? `${customerName(order)} requested a reschedule.`
					: `${technicianName(order)} requested a reschedule.`,
			...(input.actor === "user"
				? customerSender(order)
				: technicianSender(order)),
			orderId: order.id,
			viewerRole: counterpartyRole,
		});
		return request;
	}

	async approve(input: ApproveInput): Promise<RescheduleRequest> {
		const { request, order } = await this.loadAndReconcile(input.orderId);
		if (!request) {
			throw AppError.notFound("reschedule_not_found");
		}
		this.assertCounterparty(input.actor, request);
		const approved = await rescheduleRepository.approve({
			orderId: input.orderId,
			actor: input.actor,
			actorId: input.actorId,
		});
		const initiatorRole = request.requested_by;
		const initiatorId =
			initiatorRole === "user" ? order.user_id : order.technician_id;
		await this.notifyBestEffort({
			recipientRole: initiatorRole,
			recipientId: initiatorId,
			type: "reschedule_approved",
			title: "Reschedule approved",
			body:
				input.actor === "user"
					? `${customerName(order)} approved your reschedule request.`
					: `${technicianName(order)} approved your reschedule request.`,
			...(input.actor === "user"
				? customerSender(order)
				: technicianSender(order)),
			orderId: order.id,
			viewerRole: initiatorRole,
		});
		return approved;
	}

	async reject(input: RejectInput): Promise<RescheduleRequest> {
		if (!input.reason || input.reason.trim().length === 0) {
			throw AppError.badRequest("reason_required");
		}
		if (input.reason.length > 500) {
			throw AppError.badRequest("reason_too_long");
		}
		const { request, order } = await this.loadAndReconcile(input.orderId);
		if (!request) {
			throw AppError.notFound("reschedule_not_found");
		}
		this.assertCounterparty(input.actor, request);
		const rejected = await rescheduleRepository.reject({
			orderId: input.orderId,
			actor: input.actor,
			actorId: input.actorId,
			reason: input.reason,
		});
		const initiatorRole = request.requested_by;
		const initiatorId =
			initiatorRole === "user" ? order.user_id : order.technician_id;
		await this.notifyBestEffort({
			recipientRole: initiatorRole,
			recipientId: initiatorId,
			type: "reschedule_rejected",
			title: "Reschedule rejected",
			body:
				input.actor === "user"
					? `${customerName(order)} rejected your reschedule request.`
					: `${technicianName(order)} rejected your reschedule request.`,
			...(input.actor === "user"
				? customerSender(order)
				: technicianSender(order)),
			orderId: order.id,
			viewerRole: initiatorRole,
		});
		return rejected;
	}

	/**
	 * Returns the latest reschedule request for an order, scoped to an actor.
	 * Used by the order detail screens (user + tech) to render the receiver UI.
	 * Returns null when no reschedule has ever been requested for this order.
	 */
	async getForActor(
		orderId: string,
		actor: Actor,
		actorId: string,
	): Promise<RescheduleRequest | null> {
		await this.loadOrderForActor(orderId, actor, actorId);
		return rescheduleRepository.getByOrderId(orderId);
	}

	async withdraw(input: WithdrawInput): Promise<RescheduleRequest> {
		const { request } = await this.loadAndReconcile(input.orderId);
		if (!request) {
			throw AppError.notFound("reschedule_not_found");
		}
		return rescheduleRepository.withdraw({
			orderId: input.orderId,
			actor: input.actor,
			actorId: input.actorId,
		});
	}

	/**
	 * Read-and-reconcile the order + reschedule_request pair.
	 * Triggers (in order):
	 *   1. RPC auto_reject_if_expired — handles timeout + original-date-passed atomically.
	 *   2. After re-read: if pending && availability has changed (template inactive or new
	 *      calendar exception on proposed date) → cancel with 'auto_rejected_availability_changed'.
	 *   3. After re-read: if pending && order is in a terminal state → cancel with
	 *      'auto_rejected_order_cancelled'.
	 * Returns the post-reconcile order + request snapshot.
	 */
	async loadAndReconcile(orderId: string): Promise<ReconciledOrder> {
		await rescheduleRepository.autoRejectIfExpired(orderId);

		let order = await ordersRepository.getOrderById(orderId);
		if (!order) {
			throw AppError.notFound("order_not_found");
		}
		let request = await rescheduleRepository.getByOrderId(orderId);

		if (request && request.resolution === "pending") {
			const availabilityOk = await this.isProposedDateStillAvailable(
				order.technician_id,
				request.proposed_scheduled_date,
				request.proposed_scheduled_start_at
					? getCairoSlotHourFromIso(request.proposed_scheduled_start_at)
					: undefined,
			);
			if (!availabilityOk) {
				await rescheduleRepository.cancelPendingForOrder(
					orderId,
					"auto_rejected_availability_changed",
				);
				order = (await ordersRepository.getOrderById(orderId)) ?? order;
				request = await rescheduleRepository.getByOrderId(orderId);
			}
		}

		if (
			request &&
			request.resolution === "pending" &&
			TERMINAL_STATUSES.has(order.status)
		) {
			await rescheduleRepository.cancelPendingForOrder(
				orderId,
				"auto_rejected_order_cancelled",
			);
			request = await rescheduleRepository.getByOrderId(orderId);
		}

		return { order, request };
	}

	/** SERVICE-06: pass-through used by external module callers. */
	async cancelPendingForOrder(
		orderId: string,
		reason: string,
	): Promise<RescheduleRequest | null> {
		return rescheduleRepository.cancelPendingForOrder(orderId, reason);
	}

	// ─── Private helpers ──────────────────────────────────────────────────────

	/** SERVICE-08: counterparty check — raises 403 if actor is the same role that initiated. */
	private assertCounterparty(actor: Actor, request: RescheduleRequest): void {
		if (actor === request.requested_by) {
			throw AppError.forbidden("not_counterparty");
		}
	}

	/** Loads order and asserts that the (actor, actorId) pair owns it.
	 *  Returns 404 (not 403) on mismatch to match Pitfall 12 mitigation. */
	private async loadOrderForActor(
		orderId: string,
		actor: Actor,
		actorId: string,
	): Promise<Order> {
		const order = await ordersRepository.getOrderById(orderId);
		if (!order) {
			throw AppError.notFound("order_not_found");
		}
		if (actor === "user" && order.user_id !== actorId) {
			throw AppError.notFound("order_not_found");
		}
		if (actor === "technician" && order.technician_id !== actorId) {
			throw AppError.notFound("order_not_found");
		}
		return order;
	}

	/** SERVICE-07: 7-rule validation chain (excluding VALID-02 — DB partial unique enforces). */
	private async runValidationChain(args: {
		order: Order;
		proposedDate: string;
		proposedStartAt: string;
		reason: string;
	}): Promise<void> {
		const { order, proposedDate, proposedStartAt, reason } = args;

		if (!reason || reason.trim().length === 0) {
			throw AppError.badRequest("reason_required");
		}
		if (reason.length > 500) {
			throw AppError.badRequest("reason_too_long");
		}

		if (order.status !== "accepted") {
			throw AppError.badRequest("order_not_in_accepted_state");
		}

		if (!ISO_DATE.test(proposedDate)) {
			throw AppError.badRequest("Invalid date format. Use YYYY-MM-DD.");
		}
		assertFixedSlotStartAtInCairo({
			dateYmd: proposedDate,
			startAt: proposedStartAt,
			requiredCode: "proposed_scheduled_start_at_required",
			invalidDatetimeCode: "invalid_proposed_scheduled_start_at",
			invalidSlotCode: "invalid_proposed_scheduled_slot",
			dateMismatchCode: "proposed_scheduled_date_start_mismatch",
		});
		if (proposedDate <= order.scheduled_date) {
			throw AppError.badRequest("proposed_not_after_original");
		}

		const proposedUtc = cairoMidnightUtc(proposedDate);
		const now = nowInCairo();
		if (hoursBetween(now, proposedUtc) < 24) {
			throw AppError.badRequest("proposed_within_24h_buffer");
		}

		const originalUtc = cairoMidnightUtc(order.scheduled_date);
		if (hoursBetween(now, originalUtc) < 24) {
			throw AppError.badRequest("original_within_24h_buffer");
		}

		const availabilityOk = await this.isProposedDateStillAvailable(
			order.technician_id,
			proposedDate,
			getCairoSlotHourFromIso(proposedStartAt),
		);
		if (!availabilityOk) {
			throw AppError.badRequest("tech_unavailable");
		}

		const count = await ordersRepository.getActiveOrdersCountForDate(
			order.technician_id,
			proposedDate,
		);
		if (count >= 5) {
			throw AppError.conflict("cap_exhausted_for_date");
		}
	}

	/** Combined availability check: template active for getDay(date) AND no calendar exception. */
	private async isProposedDateStillAvailable(
		technicianId: string,
		dateYmd: string,
		slotHour?: number,
	): Promise<boolean> {
		const dayOfWeek = new Date(dateYmd + "T00:00:00Z").getUTCDay();
		const templateOk = await ordersRepository.checkTechnicianAvailability(
			technicianId,
			dayOfWeek,
			slotHour,
		);
		if (!templateOk) return false;
		const isHoliday = await technicianCalendarService.isDateHoliday(
			technicianId,
			dateYmd,
		);
		return !isHoliday;
	}

	private async notifyBestEffort(input: {
		recipientRole: "user" | "technician";
		recipientId: string;
		type: string;
		title: string;
		body: string;
		orderId: string;
		viewerRole: "user" | "technician";
	}): Promise<void> {
		try {
			await notificationsService.sendPushToRecipient(input);
		} catch (error) {
			logger.warn({ err: error, ...input }, "[reschedule] notification failed");
		}
	}
}

export const rescheduleService = new RescheduleService();
