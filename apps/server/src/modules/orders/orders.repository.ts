import { supabaseAdmin } from "../../shared/db/supabase.js";
import type { RescheduleRequest } from "./reschedule.repository.js";

const supabase = supabaseAdmin;

// Mirror of public.order_status enum (supabase/migrations/20260512000000_order_state_machine_phase1_lean.sql).
export type OrderStatus =
	// New lifecycle (Phase 1)
	| "pending"
	| "accepted"
	| "tracking"
	| "arrived_inspection"
	| "awaiting_final_cost"
	| "negotiating"
	| "in_progress"
	| "awaiting_payment"
	| "completed"
	| "declined_by_technician"
	| "cancelled_no_fee"
	| "cancelled_with_fee"
	// Legacy compat statuses preserved in the DB enum.
	| "reschedule_requested_by_user"
	| "reschedule_requested_by_technician"
	| "rejected"
	| "cancelled"
	| "cancelled_by_user"
	| "cancelled_by_technician";

// Statuses during which it is appropriate to expose the counter-party's phone
// number. Pre-accept (`pending`) and terminal states (`completed`,
// `cancelled_*`, `rejected`, etc.) keep the phone null. This is intentionally
// wider than just `"accepted"` — once the tech is tracking / on-site /
// negotiating / awaiting payment, both parties need to be able to call.
const PHONE_VISIBLE_STATUSES: ReadonlySet<OrderStatus> = new Set([
	"accepted",
	"tracking",
	"arrived_inspection",
	"awaiting_final_cost",
	"negotiating",
	"in_progress",
	"awaiting_payment",
]);

function isPhoneVisible(status: OrderStatus): boolean {
	return PHONE_VISIBLE_STATUSES.has(status);
}

export interface Order {
	id: string;
	technician_id: string;
	user_id: string;
	service_id: string;
	status: OrderStatus;
	problem_description: string | null;
	attachment: string | null;
	cancellation_reason: string | null;
	scheduled_date: string;
	scheduled_start_at?: string | null;
	active: boolean;
	created_at: string;
	user_address?: string | null;
	service_name?: string | null;
	category_id?: string | null;
	user_name?: string | null;
	user_phone?: string | null;
	technician_name?: string | null;
	technician_image?: string | null;
	technician_phone?: string | null;
	has_review: boolean;
	reschedule_request?: RescheduleRequest | null;
	has_pending_reschedule?: boolean;
}

function mapOrderWithJoins(row: any): Order {
	const tech = Array.isArray(row.technicians) ? row.technicians[0] : row.technicians;
	const usr = Array.isArray(row.users) ? row.users[0] : row.users;
	const svc = Array.isArray(row.services) ? row.services[0] : row.services;
	const addr = Array.isArray(usr?.addresses)
		? usr.addresses[0]
		: (usr?.addresses ?? null);
	const parts = [addr?.building_no, addr?.street, addr?.city].filter(Boolean);

	return {
		...row,
		technicians: undefined,
		users: undefined,
		services: undefined,
		user_address: parts.length > 0 ? parts.join(", ") : row.user_address ?? null,
		service_name: svc?.name ?? row.service_name ?? null,
		category_id: svc?.category_id ?? row.category_id ?? null,
		user_name: usr?.full_name ?? row.user_name ?? null,
		user_phone: row.user_phone ?? (usr?.phone ?? null),
		technician_name:
			tech ? `${tech.first_name} ${tech.last_name}` : (row.technician_name ?? null),
		technician_image: tech?.profile_image ?? row.technician_image ?? null,
		technician_phone: row.technician_phone ?? (tech?.phone ?? null),
	} as Order;
}

export interface CreateOrderData {
	technician_id: string;
	user_id: string;
	service_id: string;
	problem_description?: string;
	attachment?: string;
	scheduled_date: string;
	scheduled_start_at?: string | null;
}

// Plan 02-04: `UpdateOrderData` removed alongside the `updateOrder` method.
// Order mutations go through `LifecycleService` → Postgres RPCs only.

export function applyReviewFlagsToOrders(
	rows: Order[],
	reviewedOrderIds: ReadonlySet<string>,
): Order[] {
	return rows.map((row) => ({
		...row,
		has_review: reviewedOrderIds.has(row.id),
	}));
}

export class OrdersRepository {
	async createOrder(data: CreateOrderData): Promise<Order> {
		const { data: row, error } = await supabase
			.from("orders")
			.insert({
				technician_id: data.technician_id,
				user_id: data.user_id,
				service_id: data.service_id,
				problem_description: data.problem_description ?? null,
				attachment: data.attachment ?? null,
				status: "pending",
				scheduled_date: data.scheduled_date,
				scheduled_start_at: data.scheduled_start_at ?? null,
				active: false,
			})
			.select()
			.single();

		if (error) throw error;
		return row as Order;
	}

	async getUserOrders(userId: string): Promise<Order[]> {
		const { data, error } = await supabase
			.from("orders")
			.select(
				"*, technicians(first_name, last_name, profile_image, phone), services(name, category_id)",
			)
			.eq("user_id", userId)
			.order("created_at", { ascending: false });

		if (error) throw error;

		const mapped = (data ?? []).map((row: any) => {
			const mappedRow = mapOrderWithJoins(row);
			return {
				...mappedRow,
				technician_phone: isPhoneVisible(row.status as OrderStatus)
					? mappedRow.technician_phone
					: null,
			};
		}) as Order[];

		const completedOrderIds = mapped
			.filter((order) => order.status === "completed")
			.map((order) => order.id);

		if (completedOrderIds.length === 0) {
			return applyReviewFlagsToOrders(mapped, new Set());
		}

		const { data: reviews, error: reviewsError } = await supabase
			.from("reviews")
			.select("order_id")
			.in("order_id", completedOrderIds);

		if (reviewsError) throw reviewsError;

		const reviewedOrderIds = new Set(
			(reviews ?? []).map((review: { order_id: string }) => review.order_id),
		);

		return applyReviewFlagsToOrders(mapped, reviewedOrderIds);
	}

	async getTechnicianOrders(technicianId: string): Promise<Order[]> {
		const { data, error } = await supabase
			.from("orders")
			.select(
				"*, users(full_name, phone, addresses(city, street, building_no)), services(name, category_id)",
			)
			.eq("technician_id", technicianId)
			.order("created_at", { ascending: false });

		if (error) throw error;

		return (data ?? []).map((row: any) => {
			const mappedRow = mapOrderWithJoins(row);
			return {
				...mappedRow,
				user_phone: isPhoneVisible(row.status as OrderStatus)
					? mappedRow.user_phone
					: null,
			};
		}) as Order[];
	}

	async getOrderById(id: string): Promise<Order | null> {
		const { data, error } = await supabase
			.from("orders")
			.select(
				"*, users(full_name, phone, addresses(city, street, building_no)), technicians(first_name, last_name, profile_image, phone), services(name, category_id)",
			)
			.eq("id", id)
			.single();

		if (error) {
			if (error.code === "PGRST116") return null;
			throw error;
		}
		const row = mapOrderWithJoins(data);
		return {
			...row,
			user_phone: isPhoneVisible(row.status) ? row.user_phone : null,
			technician_phone: isPhoneVisible(row.status)
				? row.technician_phone
				: null,
		};
	}

	async getActiveOrdersCountForDate(
		technicianId: string,
		date: string,
	): Promise<number> {
		const { count, error } = await supabase
			.from("orders")
			.select("*", { count: "exact", head: true })
			.eq("technician_id", technicianId)
			.eq("scheduled_date", date)
			.eq("active", true);

		if (error) throw error;
		return count ?? 0;
	}



	async checkTechnicianAvailability(
		technicianId: string,
		dayOfWeek: number,
		slotHour?: number,
	): Promise<boolean> {
		let query = supabase
			.from("availability_templates")
			.select("active")
			.eq("technician_id", technicianId)
			.eq("day_of_week", dayOfWeek);

		if (slotHour !== undefined) {
			query = query.eq("slot_hour", slotHour);
		}

		const { data, error } = await query;
		if (error) throw error;
		if (!data || data.length === 0) return false;

		return data.some(
			(row: { active?: boolean | null }) => row.active !== false,
		);
	}

	// Plan 02-04: `updateOrder` removed. All order-mutating writes now flow through
	// `LifecycleService` → `lifecycle.repository.ts` → service-role RPCs in Postgres.
	// No direct `.update({status:...})` on the orders table is allowed from the orders module.

	// check for pending orders
	async hasPendingBooking(
		userId: string,
		technicianId: string,
	): Promise<boolean> {
		const { data, error } = await supabase
			.from("orders")
			.select("id")
			.eq("user_id", userId)
			.eq("technician_id", technicianId)
			.eq("status", "pending")
			.limit(1)
			.maybeSingle();

		if (error) throw error;
		return !!data;
	}
}

export const ordersRepository = new OrdersRepository();
