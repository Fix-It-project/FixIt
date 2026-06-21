import { supabaseAdmin } from "../../shared/db/supabase.js";
import { logger } from "../../shared/logger.js";
import type { OrderQuote } from "./lifecycle/lifecycle.repository.js";
import { type Order, ordersRepository } from "./orders.repository.js";
import { rescheduleRepository } from "./reschedule.repository.js";

/**
 * OrdersService — Phase 2 Plan 02-04
 *
 * Reads only. All order-mutating flow lives in `LifecycleService`.
 *
 * Removed in Plan 02-04:
 *   - `createOrderForUser` (replaced by `lifecycleService.submitOrder` via `OrdersController.createOrder`)
 *   - `technicianUpdateOrder` / `userUpdateOrder` (replaced by the legacy-patch-shim routing to `lifecycleService`)
 *   - The legacy transition map constants (technician/user "transitions" and the user "cancellable" set) are gone; transition guards are now enforced by the `order_status` enum + Phase-1 RPCs.
 *
 * Kept here:
 *   - List + single-order readers
 *   - `enrichWithReconcile` (lazy auto-reject of stale reschedule requests; embeds `reschedule_request`)
 *   - `enrichWithPendingFlag` (cheap pending-reschedule lookup for list endpoints — Pitfall 15: never reconcile in list)
 *   - `attachActiveQuote` (D9: GET single-order embeds the pending `order_quotes` row, nullable)
 */
export class OrdersService {
	async getUserOrders(userId: string) {
		const orders = await ordersRepository.getUserOrders(userId);
		return this.enrichWithPendingFlag(orders);
	}

	async getTechnicianOrders(technicianId: string) {
		const orders = await ordersRepository.getTechnicianOrders(technicianId);
		return this.enrichWithPendingFlag(orders);
	}

	async getUserOrderById(userId: string, id: string) {
		const order = await ordersRepository.getOrderById(id);
		if (order?.user_id !== userId) {
			throw Object.assign(new Error("Order not found"), { status: 404 });
		}
		const enriched = await this.enrichWithReconcile(order);
		// D9 (Phase 2 CONTEXT): GET enriched with active_quote
		return this.attachActiveQuote(enriched);
	}

	async getTechnicianOrderById(technicianId: string, id: string) {
		const order = await ordersRepository.getOrderById(id);
		if (order?.technician_id !== technicianId) {
			throw Object.assign(new Error("Order not found"), { status: 404 });
		}
		const enriched = await this.enrichWithReconcile(order);
		// D9 (Phase 2 CONTEXT): GET enriched with active_quote
		return this.attachActiveQuote(enriched);
	}

	/**
	 * D9: attach the single pending `order_quotes` row (if any) as `active_quote`.
	 * Non-blocking — on lookup failure we log and set `active_quote = null` so
	 * the rest of the read path stays usable.
	 */
	private async attachActiveQuote(order: Order): Promise<Order> {
		let quote: OrderQuote | null = null;
		try {
			const { data, error } = await supabaseAdmin
				.from("order_quotes")
				.select("*")
				.eq("order_id", order.id)
				.eq("status", "pending")
				.maybeSingle();
			if (error) throw error;
			quote = (data as OrderQuote | null) ?? null;
		} catch (err) {
			logger.error({ orderId: order.id, err }, "[orders.service] failed to load active_quote");
		}
		(order as unknown as Record<string, unknown>).active_quote = quote;
		return order;
	}

	/**
	 * Single-record read enrichment: lazy auto-reject + embed reschedule_request.
	 * Lazy import avoids circular service↔service cycle.
	 */
	private async enrichWithReconcile(order: Order): Promise<Order> {
		const { rescheduleService } = await import("./reschedule.service.js");
		const { request } = await rescheduleService.loadAndReconcile(order.id);
		const refreshed = await ordersRepository.getOrderById(order.id);
		return { ...(refreshed ?? order), reschedule_request: request };
	}

	/**
	 * List enrichment: cheap pending lookup only — NO auto-reject reconcile (Pitfall 15).
	 */
	private async enrichWithPendingFlag(orders: Order[]): Promise<Order[]> {
		const RESCHEDULABLE = new Set([
			"accepted",
			"reschedule_requested_by_user",
			"reschedule_requested_by_technician",
		]);
		return Promise.all(
			orders.map(async (o) => {
				if (!RESCHEDULABLE.has(o.status))
					return { ...o, has_pending_reschedule: false };
				const pending = await rescheduleRepository.getPendingByOrderId(o.id);
				return { ...o, has_pending_reschedule: pending !== null };
			}),
		);
	}
}

export const ordersService = new OrdersService();
