// Orchestrates order lifecycle operations and delegates state changes to the repository.

import crypto from "node:crypto";
import {
	calculateInspectionFeePreview,
	type InspectionFeePreview,
} from "../../../config/inspection-pricing.js";
import { AVG_SPEED_KMH } from "../../../config/lifecycle.js";
import { getPaymobConfig } from "../../../config/paymob.js";
import { supabaseAdmin } from "../../../shared/db/supabase.js";
import { AppError } from "../../../shared/errors/index.js";
import { logger } from "../../../shared/logger.js";
import { assertFixedSlotStartAtInCairo } from "../../../shared/time/fixed-slots.js";
import { notificationsService } from "../../notifications/notifications.service.js";
import { techniciansRepository } from "../../technicians/technicians.repository.js";
import { usersRepository } from "../../users/index.js";
import type { Order } from "../orders.repository.js";
import {
	type ActorRole,
	lifecycleRepository,
	type OrderActionKind,
	type OrderLocation,
	type OrderQuote,
	type UserFeeObligation,
} from "./lifecycle.repository.js";
import {
	type PaymobCardSession,
	type PaymobBillingData,
	paymobAdapter,
} from "./paymob.adapter.js";

export interface SubmitOrderInput {
	technician_id: string;
	service_id: string;
	scheduled_date: string;
	scheduled_start_at: string;
	payment_method: "cash" | "card";
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

export interface InspectionFeePreviewResult extends InspectionFeePreview {}
export interface TechnicianWalletEntry {
	orderId: string;
	grossAmount: number;
	platformFeePercent: number;
	platformFeeAmount: number;
	technicianNetAmount: number;
	paymentStatus: string;
	payoutStatus: "pending_settlement" | "paid_out";
	paidAt: string | null;
}

export interface TechnicianWalletSummary {
	pendingBalance: number;
	paidOutBalance: number;
	lifetimeNet: number;
	lifetimeGross: number;
	lifetimePlatformFees: number;
}

export interface TechnicianWalletResult {
	summary: TechnicianWalletSummary;
	entries: TechnicianWalletEntry[];
}

interface PricingAddressRow {
	id: string;
	latitude: number | null;
	longitude: number | null;
	is_active?: boolean | null;
	created_at?: string | null;
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

function roundCurrency(amount: number): number {
	return Math.round(amount);
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

	async previewInspectionFee(
		userId: string,
		technicianId: string,
		destinationAddressId: string,
	): Promise<InspectionFeePreviewResult> {
		return this.calculateInspectionFeeForBooking(
			userId,
			technicianId,
			destinationAddressId,
		);
	}

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
		const inspectionPricing = await this.calculateInspectionFeeForBooking(
			userId,
			body.technician_id,
			destinationAddressId,
		);
		const order = await this.repo.submitOrder({
			userId,
			technicianId: body.technician_id,
			serviceId: body.service_id,
			destinationAddressId,
			paymentMethod: body.payment_method,
			inspectionFee: inspectionPricing.inspection_fee,
			inspectionDistanceKm: inspectionPricing.inspection_distance_km,
			problemDescription: body.problem_description ?? null,
			attachment: body.attachment ?? null,
			scheduledDate: body.scheduled_date,
			scheduledStartAt: body.scheduled_start_at ?? null,
		});
		await this.writeOrderPricingSnapshot(order.id, inspectionPricing);
		const notificationOrder = await this.readOrder(order.id);
		await this.notifyBestEffort({
			recipientRole: "technician",
			recipientId: notificationOrder.technician_id ?? order.technician_id,
			type: "order_submitted",
			title: "New service request",
			body: `${customerName(notificationOrder)} sent a new booking request.`,
			...customerSender(notificationOrder),
			orderId: order.id,
			viewerRole: "technician",
		});
		return notificationOrder;
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
			// Back the device-side arrival notification with a push so the technician
			// is alerted even when the app was backgrounded / relaunched by the OS.
			await this.notifyBestEffort({
				recipientRole: "technician",
				recipientId: techId,
				type: "technician_arrived_self",
				title: "You've arrived",
				body: "Tap to confirm arrival and start the inspection.",
				...customerSender(refreshed),
				orderId: refreshed.id,
				viewerRole: "technician",
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
		await this.syncAcceptedQuotePricing(order.id, quote.amount);
		const notificationOrder = await this.readOrder(order.id);
		const recipientRole = quote.proposed_by;
		const recipientId =
			recipientRole === "user"
				? notificationOrder.user_id
				: notificationOrder.technician_id;
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
		return notificationOrder;
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

		// Smoke/E2E auto-finalize. Cash already auto-completes via the dual-confirm
		// trigger, so only the card path needs a shortcut here: simulate a
		// successful Paymob payment instead of opening the real gateway.
		// Read the flag here so tests can override process.env.
		const smokeEnabled = process.env.LIFECYCLE_SMOKE_AUTO_COMPLETE !== "false";
		if (!smokeEnabled) return order;
		if (order.status !== "awaiting_payment") return order;

		const fee = this.computeCardFeeBreakdown(order);
		const payment = await this.repo.syncCardPaymentSnapshot({
			orderId: order.id,
			userId: order.user_id,
			provider: "paymob",
			grossAmount: fee.grossAmount,
			platformFeePercent: fee.platformFeePercent,
			platformFeeAmount: fee.platformFeeAmount,
			technicianNetAmount: fee.technicianNetAmount,
			currency: getPaymobConfig().currency,
		});
		await this.repo.tagPaymentAsSmokeAuto(order.id);
		await this.repo.updateCardPaymentStatus({
			paymentId: payment.id,
			status: "paid",
			providerOrderId: null,
			providerPaymentId: null,
			providerTransactionId: null,
			providerResponse: { smoke_auto: true },
			paidAt: new Date().toISOString(),
		});
		return this.repo.markOrderCompletedAfterCardPayment(order.id);
	}

	// Payment

	/** Card fee breakdown from the single env-sourced rate. Cash never uses this. */
	private computeCardFeeBreakdown(order: Order): {
		grossAmount: number;
		platformFeePercent: number;
		platformFeeAmount: number;
		technicianNetAmount: number;
	} {
		const config = getPaymobConfig();
		const grossAmount = roundCurrency(order.final_price ?? 0);
		const platformFeePercent = config.platformFeePercent;
		const platformFeeAmount = roundCurrency(
			(grossAmount * platformFeePercent) / 100,
		);
		return {
			grossAmount,
			platformFeePercent,
			platformFeeAmount,
			technicianNetAmount: grossAmount - platformFeeAmount,
		};
	}

	/**
	 * "Pay cash instead" — completes a stuck `awaiting_payment` (card) order
	 * off-site. The RPC cancels any pending card payment, records a paid cash row
	 * (no platform cut), and flips the order to `completed`.
	 */
	async switchToCash(orderId: string, userId: string): Promise<Order> {
		const order = await this.repo.switchToCash({ orderId, userId });
		const notificationOrder = await this.readOrder(order.id);
		await this.notifyBestEffort({
			recipientRole: "technician",
			recipientId: notificationOrder.technician_id,
			type: "order_completed",
			title: "Order completed",
			body: `${customerName(notificationOrder)} chose to pay cash. The booking is now completed.`,
			...customerSender(notificationOrder),
			orderId: order.id,
			viewerRole: "technician",
		});
		return order;
	}

	async createCardSession(
		orderId: string,
		userId: string,
	): Promise<PaymobCardSession> {
		const order = await this.readOrder(orderId);
		if (order.user_id !== userId) {
			throw AppError.notFound("order_not_found");
		}
		if (order.status !== "awaiting_payment") {
			throw AppError.conflict("The order is not ready for card payment.", {
				token: "invalid_transition",
			});
		}
		if ((order.final_price ?? 0) <= 0) {
			throw AppError.conflict("A final price is required to complete this order.", {
				token: "missing_final_price",
			});
		}

		const existingPayment = await this.repo.getLatestPaymentForOrder(orderId);
		if (existingPayment?.status === "paid") {
			throw AppError.conflict("This order has already been paid.", {
				token: "order_already_paid",
			});
		}

		// Payment method is chosen upfront at booking; card-session must not flip it.
		if (order.payment_method !== "card") {
			throw AppError.conflict("This order is not set to card payment.", {
				token: "order_not_card_payment",
			});
		}

		const { grossAmount, platformFeePercent, platformFeeAmount, technicianNetAmount } =
			this.computeCardFeeBreakdown(order);

		const payment = await this.repo.syncCardPaymentSnapshot({
			orderId,
			userId: order.user_id,
			provider: "paymob",
			grossAmount,
			platformFeePercent,
			platformFeeAmount,
			technicianNetAmount,
			currency: getPaymobConfig().currency,
		});

		const billingData = await this.buildPaymobBillingData(order);
		return paymobAdapter.createCardSession({
			paymentId: payment.id,
			orderId: order.id,
			amountCents: grossAmount * 100,
			merchantOrderId: `fixit-payment-${payment.id}-${Date.now()}`,
			billingData,
		});
	}

	async handlePaymobWebhook(
		payload: Record<string, unknown>,
		headers: Record<string, string | string[] | undefined>,
		query: Record<string, unknown> = {},
	): Promise<{ accepted: true; duplicate: boolean }> {
		paymobAdapter.verifyWebhook(payload, headers, query);
		const outcome = paymobAdapter.extractPaymentOutcome(payload);
		const payloadHash = this.hashPayload(payload);
		const duplicate = await this.repo.getProcessedProviderEventByHash(
			outcome.provider,
			payloadHash,
		);
		if (duplicate) {
			return { accepted: true, duplicate: true };
		}

		const payment = await this.repo.updateCardPaymentStatus({
			paymentId: outcome.paymentId,
			status: outcome.status === "paid" ? "paid" : outcome.status,
			providerOrderId: outcome.providerPaymentId,
			providerPaymentId: outcome.providerPaymentId,
			providerTransactionId: outcome.providerTransactionId,
			providerResponse: payload,
			paidAt: outcome.success ? new Date().toISOString() : null,
		});

		if (outcome.success) {
			await this.repo.markOrderCompletedAfterCardPayment(payment.order_id);
			const completedOrder = await this.readOrder(payment.order_id);
			await this.notifyBestEffort({
				recipientRole: "technician",
				recipientId: completedOrder.technician_id,
				type: "order_completed",
				title: "Order completed",
				body: `${customerName(completedOrder)} paid for the booking by card.`,
				...customerSender(completedOrder),
				orderId: completedOrder.id,
				viewerRole: "technician",
			});
			await this.notifyBestEffort({
				recipientRole: "user",
				recipientId: completedOrder.user_id,
				type: "order_completed",
				title: "Order completed",
				body: "Your card payment was successful and the booking is now completed.",
				...technicianSender(completedOrder),
				orderId: completedOrder.id,
				viewerRole: "user",
			});
		}

		await this.repo.insertPaymentProviderEvent({
			provider: outcome.provider,
			eventId: outcome.externalEventId,
			payloadHash,
			payload,
			result: outcome.status,
		});

		return { accepted: true, duplicate: false };
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
		if (order.status === "cancelled_with_fee") {
			await this.syncCancellationFeeObligation(order.id);
		}
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
		return notificationOrder;
	}

	async resolveFeeObligation(
		obligationId: string,
		status: "paid" | "waived",
	): Promise<UserFeeObligation> {
		return this.repo.resolveFeeObligation({ obligationId, status });
	}

	// Private helpers

	private async calculateInspectionFeeForBooking(
		userId: string,
		technicianId: string,
		destinationAddressId: string,
	): Promise<InspectionFeePreviewResult> {
		const destinationAddress = await this.readDestinationAddressForPricing(
			userId,
			destinationAddressId,
		);
		const technicianAddress =
			await this.readTechnicianPricingAddress(technicianId);

		if (
			destinationAddress.latitude == null ||
			destinationAddress.longitude == null ||
			technicianAddress?.latitude == null ||
			technicianAddress.longitude == null
		) {
			throw AppError.badRequest(
				"We couldn't calculate the inspection fee for this booking.",
				{ token: "inspection_fee_pricing_unavailable" },
			);
		}

		return calculateInspectionFeePreview({
			technicianLatitude: technicianAddress.latitude,
			technicianLongitude: technicianAddress.longitude,
			destinationLatitude: destinationAddress.latitude,
			destinationLongitude: destinationAddress.longitude,
		});
	}

	private async writeOrderPricingSnapshot(
		orderId: string,
		preview: InspectionFeePreviewResult,
	): Promise<void> {
		const { error } = await supabaseAdmin
			.from("orders")
			.update({
				inspection_fee: preview.inspection_fee,
				inspection_distance_km: preview.inspection_distance_km,
			})
			.eq("id", orderId);
		if (error) throw error;
	}

	private async syncAcceptedQuotePricing(
		orderId: string,
		workPrice: number,
	): Promise<void> {
		const order = await this.readOrder(orderId);
		const inspectionFee = order.inspection_fee ?? 0;
		const { error } = await supabaseAdmin
			.from("orders")
			.update({
				work_price: workPrice,
				final_price: workPrice + inspectionFee,
			})
			.eq("id", orderId);
		if (error) throw error;
	}

	private async syncCancellationFeeObligation(orderId: string): Promise<void> {
		const order = await this.readOrder(orderId);
		const inspectionFee = order.inspection_fee ?? 0;

		const { data, error } = await supabaseAdmin
			.from("user_fee_obligations")
			.select("id")
			.eq("source_order_id", orderId)
			.eq("status", "unpaid")
			.order("created_at", { ascending: false })
			.limit(1)
			.maybeSingle();
		if (error) throw error;

		if (data) {
			const { error: updateError } = await supabaseAdmin
				.from("user_fee_obligations")
				.update({ amount: inspectionFee })
				.eq("id", (data as { id: string }).id);
			if (updateError) throw updateError;
			return;
		}

		const { error: insertError } = await supabaseAdmin
			.from("user_fee_obligations")
			.insert({
				user_id: order.user_id,
				technician_id: order.technician_id,
				source_order_id: order.id,
				amount: inspectionFee,
				reason: "inspection_cancellation_fee",
				status: "unpaid",
			});
		if (insertError) throw insertError;
	}

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

	private async readDestinationAddressForPricing(
		userId: string,
		addressId: string,
	): Promise<PricingAddressRow> {
		const { data, error } = await supabaseAdmin
			.from("addresses")
			.select("id, latitude, longitude")
			.eq("id", addressId)
			.eq("user_id", userId)
			.maybeSingle();
		if (error) throw error;
		if (!data) {
			throw AppError.forbidden("That address isn't on your account.", {
				token: "destination_address_not_owned_by_user",
			});
		}
		return data as PricingAddressRow;
	}

	private async readTechnicianPricingAddress(
		technicianId: string,
	): Promise<PricingAddressRow | null> {
		const { data, error } = await supabaseAdmin
			.from("addresses")
			.select("id, latitude, longitude, is_active, created_at")
			.eq("technician_id", technicianId)
			.order("is_active", { ascending: false })
			.order("created_at", { ascending: true });
		if (error) throw error;

		const rows = (data ?? []) as PricingAddressRow[];
		return (
			rows.find(
				(row) =>
					row.is_active === true &&
					row.latitude != null &&
					row.longitude != null,
			) ??
			rows.find((row) => row.latitude != null && row.longitude != null) ??
			null
		);
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

	private async buildPaymobBillingData(
		order: Order,
	): Promise<PaymobBillingData> {
		const fallbackName = order.user_name?.trim() || "FixIt Customer";
		const [first_name, ...rest] = fallbackName.split(/\s+/);
		const addressParts = (order.user_address ?? "").split(",").map((part) => part.trim());

		return {
			email: "paymob-sandbox@fixit.app",
			first_name: first_name || "FixIt",
			last_name: rest.join(" ") || "Customer",
			phone_number: order.user_phone ?? "+201000000000",
			apartment: "NA",
			floor: "NA",
			street: addressParts[0] || "NA",
			building: "NA",
			city: addressParts[1] || "Cairo",
			state: addressParts[1] || "Cairo",
			country: "EG",
			postal_code: "00000",
		};
	}

	private hashPayload(payload: Record<string, unknown>): string {
		return crypto
			.createHash("sha256")
			.update(JSON.stringify(payload))
			.digest("hex");
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
