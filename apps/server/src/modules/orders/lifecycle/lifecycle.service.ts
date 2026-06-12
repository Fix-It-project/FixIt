// Orchestrates order lifecycle operations and delegates state changes to the repository.

import { AVG_SPEED_KMH } from "../../../config/lifecycle.js";
import { supabaseAdmin } from "../../../shared/db/supabase.js";
import { AppError } from "../../../shared/errors/index.js";
import { logger } from "../../../shared/logger.js";
import { assertFixedSlotStartAtInCairo } from "../../../shared/time/fixed-slots.js";
import type { Order } from "../orders.repository.js";
import { notificationsService } from "../../notifications/notifications.service.js";
import { techniciansRepository } from "../../technicians/technicians.repository.js";
import { usersRepository } from "../../users/index.js";
import {
	type ActorRole,
	lifecycleRepository,
	type OrderActionKind,
	type OrderLocation,
	type OrderQuote,
	type PaymentMethod,
	type UserFeeObligation,
} from "./lifecycle.repository.js";

export interface SubmitOrderInput {
	technician_id: string;
	service_id: string;
	scheduled_date: string;
	scheduled_start_at: string;
	problem_description?: string | null;
	attachment?: string | null;
	destination_address_id?: string | null;
}

export interface UpsertLocationResult {
	location: OrderLocation;
	order: Order;
	arrived: boolean;
}

export interface OrderDistanceResult {
	distance_km: number | null;
	eta_minutes: number | null;
	within_geofence: boolean;
}

function technicianName(order: Pick<Order, "technician_name">): string {
	return order.technician_name?.trim() || "Your technician";
}

function customerName(order: Pick<Order, "user_name">): string {
	return order.user_name?.trim() || "The customer";
}

function formatEgp(amount: number): string {
	return `${amount.toLocaleString("en-US")} EGP`;
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

function senderForRole(
	order: Pick<Order, "user_name" | "technician_name" | "technician_image">,
	role: ActorRole,
) {
	return role === "user" ? customerSender(order) : technicianSender(order);
}

export class LifecycleService {
	constructor(private readonly repo = lifecycleRepository) {}

	// A blocked OR block_pending account cannot START new work. Plain 403 with
	// NO `accountStatus` field — a block_pending user finishing existing orders
	// must just see "can't start new orders", not get force-logged-out by the
	// native interceptor (fully-blocked users are already stopped at the auth
	// middleware before they reach here).
	private async assertCanStartWork(
		role: "user" | "technician",
		id: string,
	): Promise<void> {
		const suspended =
			role === "user"
				? await usersRepository
						.getUserById(id)
						.then((u) => !!(u?.blocked || u?.block_pending))
						.catch(() => false)
				: await techniciansRepository
						.getTechnicianById(id)
						.then((t) => t?.status === "blocked" || !!t?.block_pending)
						.catch(() => false);
		if (suspended) {
			throw AppError.forbidden(
				"Your account is suspended, so you can't start new orders. Contact support for help.",
			);
		}
	}

	// Submit

	async submitOrder(userId: string, body: SubmitOrderInput): Promise<Order> {
		await this.assertCanStartWork("user", userId);
		assertFixedSlotStartAtInCairo({
			dateYmd: body.scheduled_date,
			startAt: body.scheduled_start_at,
			requiredCode: "scheduled_start_at_required",
			invalidDatetimeCode: "invalid_scheduled_start_at",
			invalidSlotCode: "invalid_scheduled_slot",
			dateMismatchCode: "scheduled_date_start_mismatch",
		});

		let destinationAddressId = body.destination_address_id ?? null;
		if (!destinationAddressId) {
			destinationAddressId = await this.resolveActiveAddressId(userId);
			if (!destinationAddressId) {
				throw AppError.badRequest("no_active_address");
			}
		}
		const order = await this.repo.submitOrder({
			userId,
			technicianId: body.technician_id,
			serviceId: body.service_id,
			destinationAddressId,
			problemDescription: body.problem_description ?? null,
			attachment: body.attachment ?? null,
			scheduledDate: body.scheduled_date,
			scheduledStartAt: body.scheduled_start_at ?? null,
		});
		const notificationOrder = await this.readOrder(order.id);
		await this.notifyBestEffort({
			recipientRole: "technician",
			recipientId: order.technician_id,
			type: "order_submitted",
			title: "New service request",
			body: `${customerName(notificationOrder)} sent a new booking request.`,
			...customerSender(notificationOrder),
			orderId: order.id,
			viewerRole: "technician",
		});
		return order;
	}

	// Technician actions

	async techAccept(orderId: string, techId: string): Promise<Order> {
		await this.assertCanStartWork("technician", techId);
		const order = await this.repo.orderAction({
			orderId,
			actorId: techId,
			actorRole: "technician",
			action: "tech_accept",
		});
		const notificationOrder = await this.readOrder(order.id);
		await this.notifyBestEffort({
			recipientRole: "user",
			recipientId: order.user_id,
			type: "order_accepted",
			title: "Booking accepted",
			body: `${technicianName(notificationOrder)} accepted your booking request.`,
			...technicianSender(notificationOrder),
			orderId: order.id,
			viewerRole: "user",
		});
		return order;
	}

	async techDecline(
		orderId: string,
		techId: string,
		reason?: string | null,
	): Promise<Order> {
		const order = await this.repo.orderAction({
			orderId,
			actorId: techId,
			actorRole: "technician",
			action: "tech_decline",
			reason: reason ?? null,
		});
		const notificationOrder = await this.readOrder(order.id);
		await this.notifyBestEffort({
			recipientRole: "user",
			recipientId: order.user_id,
			type: "order_declined",
			title: "Booking declined",
			body: `${technicianName(notificationOrder)} declined your booking request.`,
			...technicianSender(notificationOrder),
			orderId: order.id,
			viewerRole: "user",
		});
		return order;
	}

	async techStartTracking(orderId: string, techId: string): Promise<Order> {
		const order = await this.repo.orderAction({
			orderId,
			actorId: techId,
			actorRole: "technician",
			action: "tech_start_tracking",
		});
		const notificationOrder = await this.readOrder(order.id);
		await this.notifyBestEffort({
			recipientRole: "user",
			recipientId: order.user_id,
			type: "technician_tracking",
			title: "Technician is on the way",
			body: `${technicianName(notificationOrder)} is on the way to your booking.`,
			...technicianSender(notificationOrder),
			orderId: order.id,
			viewerRole: "user",
		});
		return order;
	}

	async techStartInspection(orderId: string, techId: string): Promise<Order> {
		const order = await this.repo.orderAction({
			orderId,
			actorId: techId,
			actorRole: "technician",
			action: "tech_start_inspection",
		});
		const notificationOrder = await this.readOrder(order.id);
		await this.notifyBestEffort({
			recipientRole: "user",
			recipientId: order.user_id,
			type: "inspection_started",
			title: "Inspection started",
			body: `${technicianName(notificationOrder)} started the on-site inspection.`,
			...technicianSender(notificationOrder),
			orderId: order.id,
			viewerRole: "user",
		});
		return order;
	}

	async techFinishInspection(orderId: string, techId: string): Promise<Order> {
		const order = await this.repo.orderAction({
			orderId,
			actorId: techId,
			actorRole: "technician",
			action: "tech_finish_inspection",
		});
		const notificationOrder = await this.readOrder(order.id);
		await this.notifyBestEffort({
			recipientRole: "user",
			recipientId: order.user_id,
			type: "inspection_finished",
			title: "Inspection finished",
			body: `${technicianName(notificationOrder)} finished the inspection. Final pricing can now be reviewed.`,
			...technicianSender(notificationOrder),
			orderId: order.id,
			viewerRole: "user",
		});
		return order;
	}

	// Generic action passthrough used by the legacy PATCH shim.

	async orderAction(
		orderId: string,
		actorId: string,
		action: OrderActionKind,
		actorRole: ActorRole = "technician",
		reason?: string | null,
	): Promise<Order> {
		return this.repo.orderAction({
			orderId,
			actorId,
			actorRole,
			action,
			reason: reason ?? null,
		});
	}

	// Location updates

	async upsertLocation(
		orderId: string,
		techId: string,
		latitude: number,
		longitude: number,
		heading?: number | null,
		accuracy?: number | null,
	): Promise<UpsertLocationResult> {
		// Read the previous arrival marker so we can detect when this ping crosses the threshold.
		const previousArrivedAt = await this.readArrivedAt(orderId);

		const location = await this.repo.upsertLocation({
			orderId,
			technicianId: techId,
			latitude,
			longitude,
			heading: heading ?? null,
			accuracy: accuracy ?? null,
		});

		// Re-read the order so the response reflects the latest persisted state.
		const refreshed = await this.readOrder(orderId);
		const refreshedArrivedAt =
			(refreshed as { arrived_at?: string | null }).arrived_at ?? null;
		const arrived = previousArrivedAt === null && refreshedArrivedAt !== null;
		if (arrived) {
			await this.notifyBestEffort({
				recipientRole: "user",
				recipientId: refreshed.user_id,
				type: "technician_arrived",
				title: "Technician arrived",
				body: `${technicianName(refreshed)} has arrived at the destination.`,
				...technicianSender(refreshed),
				orderId: refreshed.id,
				viewerRole: "user",
			});
		}

		return { location, order: refreshed, arrived };
	}

	// Distance and ETA

	// Reads the latest technician-to-destination distance and derives ETA and geofence status.
	async getOrderDistance(orderId: string): Promise<OrderDistanceResult> {
		const distance_km = await this.repo.getOrderDistance(orderId);
		if (distance_km === null) {
			return { distance_km: null, eta_minutes: null, within_geofence: false };
		}
		const eta_minutes = Math.round((distance_km / AVG_SPEED_KMH) * 60);
		const within_geofence = distance_km <= 1.0;
		return { distance_km, eta_minutes, within_geofence };
	}

	// Quotes

	async submitQuote(
		orderId: string,
		actorId: string,
		actorRole: ActorRole,
		amount: number,
		notes?: string | null,
	): Promise<OrderQuote> {
		const quote = await this.repo.submitQuote({
			orderId,
			actorId,
			actorRole,
			amount,
			notes: notes ?? null,
		});
		const order = await this.readOrder(orderId);
		const recipientRole = actorRole === "user" ? "technician" : "user";
		const recipientId =
			recipientRole === "user" ? order.user_id : order.technician_id;
		await this.notifyBestEffort({
			recipientRole,
			recipientId,
			type: "quote_submitted",
			title: "New quote received",
			body: `${actorRole === "user" ? customerName(order) : technicianName(order)} sent a quote for ${formatEgp(amount)}.`,
			...senderForRole(order, actorRole),
			orderId,
			viewerRole: recipientRole,
		});
		return quote;
	}

	async acceptQuote(
		quoteId: string,
		actorId: string,
		actorRole: ActorRole,
	): Promise<Order> {
		const quote = await this.readQuote(quoteId);
		const order = await this.repo.acceptQuote({ quoteId, actorId, actorRole });
		const notificationOrder = await this.readOrder(order.id);
		const recipientRole = quote.proposed_by;
		const recipientId =
			recipientRole === "user" ? order.user_id : order.technician_id;
		await this.notifyBestEffort({
			recipientRole,
			recipientId,
			type: "quote_accepted",
			title: "Quote accepted",
			body: `${actorRole === "user" ? customerName(notificationOrder) : technicianName(notificationOrder)} accepted your quote for ${formatEgp(quote.amount)}.`,
			...senderForRole(notificationOrder, actorRole),
			orderId: order.id,
			viewerRole: recipientRole,
		});
		return order;
	}

	// Completion

	async declineCompletion(
		orderId: string,
		actorId: string,
		actorRole: ActorRole,
	): Promise<Order> {
		return this.repo.declineCompletion({ orderId, actorId, actorRole });
	}

	async confirmCompletion(
		orderId: string,
		actorId: string,
		actorRole: ActorRole,
	): Promise<Order> {
		const order = await this.repo.confirmCompletion({
			orderId,
			actorId,
			actorRole,
		});
		const notificationOrder = await this.readOrder(order.id);
		const recipientRole = actorRole === "user" ? "technician" : "user";
		const recipientId =
			recipientRole === "user"
				? notificationOrder.user_id
				: notificationOrder.technician_id;
		await this.notifyBestEffort({
			recipientRole,
			recipientId,
			type: "completion_confirmed",
			title: "Completion confirmed",
			body:
				order.status === "awaiting_payment"
					? `${actorRole === "user" ? customerName(notificationOrder) : technicianName(notificationOrder)} confirmed completion. The booking is ready for payment.`
					: `${actorRole === "user" ? customerName(notificationOrder) : technicianName(notificationOrder)} confirmed the booking is complete.`,
			...senderForRole(notificationOrder, actorRole),
			orderId: order.id,
			viewerRole: recipientRole,
		});

		// Read the flag here so tests can override process.env.
		const smokeEnabled = process.env.LIFECYCLE_SMOKE_AUTO_COMPLETE !== "false";
		if (!smokeEnabled) return order;

		// Auto-finalize only after the second confirmation moves the order to awaiting payment.
		if ((order as { status?: string }).status !== "awaiting_payment")
			return order;

		// In smoke mode, finish the payment flow automatically.
		await this.repo.choosePaymentMethod({
			orderId: order.id,
			userId: (order as { user_id: string }).user_id,
			method: "cash",
		});
		await this.repo.tagPaymentAsSmokeAuto(order.id);
		return this.repo.markCashReceived({
			orderId: order.id,
			technicianId: (order as { technician_id: string }).technician_id,
		});
	}

	// Payment

	async choosePaymentMethod(
		orderId: string,
		userId: string,
		method: PaymentMethod,
	): Promise<Order> {
		return this.repo.choosePaymentMethod({ orderId, userId, method });
	}

	async markCashReceived(orderId: string, techId: string): Promise<Order> {
		const order = await this.repo.markCashReceived({
			orderId,
			technicianId: techId,
		});
		const notificationOrder = await this.readOrder(order.id);
		await this.notifyBestEffort({
			recipientRole: "user",
			recipientId: order.user_id,
			type: "order_completed",
			title: "Order completed",
			body: `${technicianName(notificationOrder)} marked your booking as completed.`,
			...technicianSender(notificationOrder),
			orderId: order.id,
			viewerRole: "user",
		});
		return order;
	}

	// Cancellation and fee resolution

	async cancelOrder(
		orderId: string,
		actorId: string,
		actorRole: ActorRole,
		reason?: string | null,
	): Promise<Order> {
		const order = await this.repo.cancelOrder({
			orderId,
			actorId,
			actorRole,
			reason: reason ?? null,
		});
		const notificationOrder = await this.readOrder(order.id);
		const recipientRole = actorRole === "user" ? "technician" : "user";
		const recipientId =
			recipientRole === "user"
				? notificationOrder.user_id
				: notificationOrder.technician_id;
		const actorDisplayName =
			actorRole === "user"
				? customerName(notificationOrder)
				: technicianName(notificationOrder);
		const reasonSuffix = reason?.trim() ? ` Reason: ${reason.trim()}.` : "";
		await this.notifyBestEffort({
			recipientRole,
			recipientId,
			type: "order_cancelled",
			title: "Order cancelled",
			body: `${actorDisplayName} cancelled the booking.${reasonSuffix}`,
			...senderForRole(notificationOrder, actorRole),
			orderId: order.id,
			viewerRole: recipientRole,
		});
		return order;
	}

	async resolveFeeObligation(
		obligationId: string,
		status: "paid" | "waived",
	): Promise<UserFeeObligation> {
		return this.repo.resolveFeeObligation({ obligationId, status });
	}

	// Private helpers

	// Returns the caller's active address id, or null when none is set.
	private async resolveActiveAddressId(userId: string): Promise<string | null> {
		const { data, error } = await supabaseAdmin
			.from("addresses")
			.select("id")
			.eq("user_id", userId)
			.eq("is_active", true)
			.limit(1)
			.maybeSingle();
		if (error) throw error;
		return (data as { id?: string } | null)?.id ?? null;
	}

	// Reads only arrived_at so arrival transitions can be detected cheaply.
	private async readArrivedAt(orderId: string): Promise<string | null> {
		const { data, error } = await supabaseAdmin
			.from("orders")
			.select("arrived_at")
			.eq("id", orderId)
			.single();
		if (error) throw error;
		return (data as { arrived_at: string | null } | null)?.arrived_at ?? null;
	}

	// Reads the full order row after a repository operation.
	private async readOrder(orderId: string): Promise<Order> {
		const order = await (await import("../orders.repository.js")).ordersRepository.getOrderById(
			orderId,
		);
		if (!order) {
			throw AppError.notFound("order_not_found");
		}
		return order;
	}

	private async readQuote(quoteId: string): Promise<OrderQuote> {
		const { data, error } = await supabaseAdmin
			.from("order_quotes")
			.select("*")
			.eq("id", quoteId)
			.single();
		if (error) throw error;
		return data as OrderQuote;
	}

	private async notifyBestEffort(input: {
		recipientRole: "user" | "technician";
		recipientId: string;
		type: string;
		title: string;
		body: string;
		senderName?: string;
		senderImageUrl?: string;
		orderId: string;
		viewerRole: "user" | "technician";
	}): Promise<void> {
		// Fire-and-forget: a push must never block the order action's response.
		// Slow/blocked exp.host egress would otherwise stall the request ~10-30s.
		void Promise.resolve(notificationsService.sendPushToRecipient(input)).catch(
			(error) => {
				logger.warn({ err: error, ...input }, "[lifecycle] notification failed");
			},
		);
	}
}

export const lifecycleService = new LifecycleService();
