// Orchestrates order lifecycle operations and delegates state changes to the repository.

import { AVG_SPEED_KMH } from "../../../config/lifecycle.js";
import { supabaseAdmin } from "../../../shared/db/supabase.js";
import { AppError } from "../../../shared/errors/index.js";
import type { Order } from "../orders.repository.js";
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
	scheduled_start_at?: string | null;
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

export class LifecycleService {
	constructor(private readonly repo = lifecycleRepository) {}

	// Submit

	async submitOrder(userId: string, body: SubmitOrderInput): Promise<Order> {
		let destinationAddressId = body.destination_address_id ?? null;
		if (!destinationAddressId) {
			destinationAddressId = await this.resolveActiveAddressId(userId);
			if (!destinationAddressId) {
				throw AppError.badRequest("no_active_address");
			}
		}
		return this.repo.submitOrder({
			userId,
			technicianId: body.technician_id,
			serviceId: body.service_id,
			destinationAddressId,
			problemDescription: body.problem_description ?? null,
			attachment: body.attachment ?? null,
			scheduledDate: body.scheduled_date,
			scheduledStartAt: body.scheduled_start_at ?? null,
		});
	}

	// Technician actions

	async techAccept(orderId: string, techId: string): Promise<Order> {
		return this.repo.orderAction({
			orderId,
			actorId: techId,
			actorRole: "technician",
			action: "tech_accept",
		});
	}

	async techDecline(
		orderId: string,
		techId: string,
		reason?: string | null,
	): Promise<Order> {
		return this.repo.orderAction({
			orderId,
			actorId: techId,
			actorRole: "technician",
			action: "tech_decline",
			reason: reason ?? null,
		});
	}

	async techStartTracking(orderId: string, techId: string): Promise<Order> {
		return this.repo.orderAction({
			orderId,
			actorId: techId,
			actorRole: "technician",
			action: "tech_start_tracking",
		});
	}

	async techStartInspection(orderId: string, techId: string): Promise<Order> {
		return this.repo.orderAction({
			orderId,
			actorId: techId,
			actorRole: "technician",
			action: "tech_start_inspection",
		});
	}

	async techFinishInspection(orderId: string, techId: string): Promise<Order> {
		return this.repo.orderAction({
			orderId,
			actorId: techId,
			actorRole: "technician",
			action: "tech_finish_inspection",
		});
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
		return this.repo.submitQuote({
			orderId,
			actorId,
			actorRole,
			amount,
			notes: notes ?? null,
		});
	}

	async acceptQuote(
		quoteId: string,
		actorId: string,
		actorRole: ActorRole,
	): Promise<Order> {
		return this.repo.acceptQuote({ quoteId, actorId, actorRole });
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
		return this.repo.markCashReceived({ orderId, technicianId: techId });
	}

	// Cancellation and fee resolution

	async cancelOrder(
		orderId: string,
		actorId: string,
		actorRole: ActorRole,
		reason?: string | null,
	): Promise<Order> {
		return this.repo.cancelOrder({
			orderId,
			actorId,
			actorRole,
			reason: reason ?? null,
		});
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
		const { data, error } = await supabaseAdmin
			.from("orders")
			.select("*")
			.eq("id", orderId)
			.single();
		if (error) throw error;
		return data as Order;
	}
}

export const lifecycleService = new LifecycleService();
