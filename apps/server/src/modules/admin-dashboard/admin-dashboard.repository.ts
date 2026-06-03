import { supabaseAdmin } from "../../shared/db/supabase.js";

// Raw row shapes (slim projections — only what the dashboard aggregates need).
export interface DashboardOrderRow {
	id: string;
	status: string;
	active: boolean;
	created_at: string;
	final_price: number | null;
	service_id: string | null;
	technician_id: string | null;
	user_id: string | null;
	user_completed_at: string | null;
	technician_completed_at: string | null;
	cancellation_reason: string | null;
}

export interface CategoryRow {
	id: string;
	name: string | null;
}

export interface TechnicianRow {
	id: string;
	first_name: string | null;
	last_name: string | null;
	category_id: string | null;
}

export interface RatingStatRow {
	technician_id: string;
	review_count: number;
	rating_sum: number;
	rating: number;
}

export interface ReviewRow {
	order_id: string;
	rating: number;
	comment: string | null;
	created_at: string;
	user_id: string | null;
}

export interface HomeownerUserRow {
	id: string;
	created_at: string;
	full_name: string | null;
	email: string | null;
	phone: string | null;
	blocked: boolean;
	blocked_reason: string | null;
	blocked_at: string | null;
	blocked_by: string | null;
}

export interface OrderQuoteRow {
	proposed_by: string;
	amount: number;
	round_number: number;
	status: string;
	notes: string | null;
	created_at: string;
}

export interface OrderEventRow {
	event_type: string;
	from_status: string | null;
	to_status: string | null;
	actor_role: string;
	metadata: unknown;
	created_at: string;
}

export interface OrderPaymentRow {
	amount: number;
	payment_method: string;
	status: string;
	paid_at: string | null;
	created_at: string;
}

/** Single order detail (admin order-detail modal). */
export interface OrderDetailRow {
	id: string;
	problem_description: string | null;
	status: string;
	created_at: string;
	scheduled_date: string | null;
	scheduled_start_at: string | null;
	arrived_at: string | null;
	user_completed_at: string | null;
	technician_completed_at: string | null;
	final_price: number | null;
	payment_method: string | null;
	cancellation_reason: string | null;
	attachment: string | null;
	customerName: string | null;
	techFirstName: string | null;
	techLastName: string | null;
	categoryName: string | null;
	review: { rating: number; comment: string | null; created_at: string } | null;
	quotes: OrderQuoteRow[];
	events: OrderEventRow[];
	payments: OrderPaymentRow[];
}

/** Fully-joined order row for the admin orders list. */
export interface DetailedOrderRow {
	id: string;
	status: string;
	created_at: string;
	final_price: number | null;
	cancellation_reason: string | null;
	customerName: string | null;
	techFirstName: string | null;
	techLastName: string | null;
	categoryName: string | null;
	review: {
		rating: number;
		comment: string | null;
		created_at: string;
		user_id: string | null;
	} | null;
}

const ORDER_FIELDS =
	"id, status, active, created_at, final_price, service_id, technician_id, user_id, user_completed_at, technician_completed_at, cancellation_reason" as const;

const DETAILED_SELECT =
	"id, status, created_at, final_price, cancellation_reason, " +
	"users(full_name), " +
	"technicians(first_name, last_name), " +
	"services(name, categories(name)), " +
	"reviews(rating, comment, created_at, user_id)";

// Supabase returns embedded to-one relations as an object (or null) and
// to-many as an array; normalize both to a single value.
function one<T>(rel: T | T[] | null | undefined): T | null {
	if (Array.isArray(rel)) return rel[0] ?? null;
	return rel ?? null;
}

export class AdminDashboardRepository {
	/** One read powers KPIs, statusShare, categoryShare, series, recent, top-tech. */
	async getOrders(): Promise<DashboardOrderRow[]> {
		const { data, error } = await supabaseAdmin
			.from("orders")
			.select(ORDER_FIELDS)
			.order("created_at", { ascending: false });
		if (error) throw new Error(error.message);
		return (data ?? []) as DashboardOrderRow[];
	}

	/** Timestamps of tech-accept events — drives the "accepted" series. */
	async getAcceptEventDates(): Promise<string[]> {
		const { data, error } = await supabaseAdmin
			.from("order_events")
			.select("created_at")
			.eq("event_type", "tech_accept");
		if (error) throw new Error(error.message);
		return (data ?? []).map((r: { created_at: string }) => r.created_at);
	}

	async getCategories(): Promise<CategoryRow[]> {
		const { data, error } = await supabaseAdmin
			.from("categories")
			.select("id, name");
		if (error) throw new Error(error.message);
		return (data ?? []) as CategoryRow[];
	}

	/** Map service_id -> category_id (orders reference services, not categories). */
	async getServiceCategoryMap(): Promise<Map<string, string>> {
		const { data, error } = await supabaseAdmin
			.from("services")
			.select("id, category_id");
		if (error) throw new Error(error.message);
		const map = new Map<string, string>();
		for (const row of (data ?? []) as Array<{
			id: string;
			category_id: string | null;
		}>) {
			if (row.category_id) map.set(row.id, row.category_id);
		}
		return map;
	}

	async getTechnicians(): Promise<TechnicianRow[]> {
		const { data, error } = await supabaseAdmin
			.from("technicians")
			.select("id, first_name, last_name, category_id");
		if (error) throw new Error(error.message);
		return (data ?? []) as TechnicianRow[];
	}

	async getRatingStats(): Promise<Map<string, RatingStatRow>> {
		const { data, error } = await supabaseAdmin
			.from("technician_rating_stats")
			.select("technician_id, review_count, rating_sum, rating");
		if (error) throw new Error(error.message);
		const map = new Map<string, RatingStatRow>();
		for (const row of (data ?? []) as Array<{
			technician_id: string;
			review_count: number | string;
			rating_sum: number | string;
			rating: number | string;
		}>) {
			map.set(row.technician_id, {
				technician_id: row.technician_id,
				review_count: Number(row.review_count),
				rating_sum: Number(row.rating_sum),
				rating: Number(row.rating),
			});
		}
		return map;
	}

	async getUsersMap(): Promise<Map<string, string>> {
		const { data, error } = await supabaseAdmin
			.from("users")
			.select("id, full_name");
		if (error) throw new Error(error.message);
		const map = new Map<string, string>();
		for (const row of (data ?? []) as Array<{
			id: string;
			full_name: string | null;
		}>) {
			map.set(row.id, row.full_name ?? "Unknown");
		}
		return map;
	}

	// ---- Homeowners ----

	async getHomeownerUsers(): Promise<HomeownerUserRow[]> {
		const { data, error } = await supabaseAdmin
			.from("users")
			.select(
				"id, created_at, full_name, email, phone, blocked, blocked_reason, blocked_at, blocked_by",
			);
		if (error) throw new Error(error.message);
		return (data ?? []) as HomeownerUserRow[];
	}

	/** user_id -> city (prefer the active address). */
	async getCitiesByUser(): Promise<Map<string, string>> {
		const { data, error } = await supabaseAdmin
			.from("addresses")
			.select("user_id, city, is_active")
			.not("user_id", "is", null);
		if (error) throw new Error(error.message);
		const map = new Map<string, string>();
		for (const row of (data ?? []) as Array<{
			user_id: string | null;
			city: string | null;
			is_active: boolean;
		}>) {
			if (!row.user_id || !row.city) continue;
			if (row.is_active || !map.has(row.user_id)) map.set(row.user_id, row.city);
		}
		return map;
	}

	/** user_id -> { sum, count } of review ratings given. */
	async getReviewAggByUser(): Promise<Map<string, { sum: number; count: number }>> {
		const { data, error } = await supabaseAdmin
			.from("reviews")
			.select("user_id, rating");
		if (error) throw new Error(error.message);
		const map = new Map<string, { sum: number; count: number }>();
		for (const row of (data ?? []) as Array<{ user_id: string; rating: number }>) {
			const cur = map.get(row.user_id) ?? { sum: 0, count: 0 };
			cur.sum += row.rating;
			cur.count += 1;
			map.set(row.user_id, cur);
		}
		return map;
	}

	async setBlocked(
		userId: string,
		state: { blocked: boolean; reason: string | null; by: string | null },
	): Promise<HomeownerUserRow | null> {
		const { data, error } = await supabaseAdmin
			.from("users")
			.update({
				blocked: state.blocked,
				blocked_reason: state.reason,
				blocked_at: state.blocked ? new Date().toISOString() : null,
				blocked_by: state.by,
			})
			.eq("id", userId)
			.select(
				"id, created_at, full_name, email, phone, blocked, blocked_reason, blocked_at, blocked_by",
			)
			.single();
		if (error) {
			if (error.code === "PGRST116") return null; // no row matched
			throw new Error(error.message);
		}
		return data as HomeownerUserRow;
	}

	/** Reviews keyed by order_id — embedded into recent orders. */
	async getReviewsByOrderId(): Promise<Map<string, ReviewRow>> {
		const { data, error } = await supabaseAdmin
			.from("reviews")
			.select("order_id, rating, comment, created_at, user_id");
		if (error) throw new Error(error.message);
		const map = new Map<string, ReviewRow>();
		for (const row of (data ?? []) as ReviewRow[]) {
			map.set(row.order_id, row);
		}
		return map;
	}

	/** Fully-joined orders for the admin orders list (newest first). */
	async getDetailedOrders(): Promise<DetailedOrderRow[]> {
		const { data, error } = await supabaseAdmin
			.from("orders")
			.select(DETAILED_SELECT)
			.order("created_at", { ascending: false });
		if (error) throw new Error(error.message);

		return (data ?? []).map((row: any): DetailedOrderRow => {
			const user = one<{ full_name: string | null }>(row.users);
			const tech = one<{ first_name: string | null; last_name: string | null }>(
				row.technicians,
			);
			const service = one<{
				name: string | null;
				categories: { name: string | null } | { name: string | null }[] | null;
			}>(row.services);
			const category = service ? one<{ name: string | null }>(service.categories) : null;
			const review = one<{
				rating: number;
				comment: string | null;
				created_at: string;
				user_id: string | null;
			}>(row.reviews);

			return {
				id: row.id,
				status: row.status,
				created_at: row.created_at,
				final_price: row.final_price,
				cancellation_reason: row.cancellation_reason,
				customerName: user?.full_name ?? null,
				techFirstName: tech?.first_name ?? null,
				techLastName: tech?.last_name ?? null,
				categoryName: category?.name ?? null,
				review,
			};
		});
	}

	/** Single order with everything the admin order-detail modal needs. */
	async getOrderDetail(id: string): Promise<OrderDetailRow | null> {
		const { data: row, error } = await supabaseAdmin
			.from("orders")
			.select(
				"id, problem_description, status, created_at, scheduled_date, scheduled_start_at, arrived_at, user_completed_at, technician_completed_at, final_price, payment_method, cancellation_reason, attachment, " +
					"users(full_name), technicians(first_name, last_name), services(name, categories(name)), " +
					"reviews(rating, comment, created_at), " +
					"order_quotes(proposed_by, amount, round_number, status, notes, created_at), " +
					"order_events(event_type, from_status, to_status, actor_role, metadata, created_at), " +
					"payments(amount, payment_method, status, paid_at, created_at)",
			)
			.eq("id", id)
			.single();
		if (error) {
			if (error.code === "PGRST116") return null; // not found
			throw new Error(error.message);
		}

		const r = row as any;
		const user = one<{ full_name: string | null }>(r.users);
		const tech = one<{ first_name: string | null; last_name: string | null }>(r.technicians);
		const service = one<{
			name: string | null;
			categories: { name: string | null } | { name: string | null }[] | null;
		}>(r.services);
		const category = service ? one<{ name: string | null }>(service.categories) : null;
		const review = one<OrderDetailRow["review"]>(r.reviews);

		const quotes = ((r.order_quotes ?? []) as OrderDetailRow["quotes"]).sort(
			(a, b) => a.round_number - b.round_number,
		);
		const events = ((r.order_events ?? []) as OrderDetailRow["events"]).sort(
			(a, b) => +new Date(a.created_at) - +new Date(b.created_at),
		);
		const payments = ((r.payments ?? []) as OrderDetailRow["payments"]).slice();

		return {
			id: r.id,
			problem_description: r.problem_description,
			status: r.status,
			created_at: r.created_at,
			scheduled_date: r.scheduled_date,
			scheduled_start_at: r.scheduled_start_at,
			arrived_at: r.arrived_at,
			user_completed_at: r.user_completed_at,
			technician_completed_at: r.technician_completed_at,
			final_price: r.final_price,
			payment_method: r.payment_method,
			cancellation_reason: r.cancellation_reason,
			attachment: r.attachment,
			customerName: user?.full_name ?? null,
			techFirstName: tech?.first_name ?? null,
			techLastName: tech?.last_name ?? null,
			categoryName: category?.name ?? null,
			review,
			quotes,
			events,
			payments,
		};
	}
}

export const adminDashboardRepository = new AdminDashboardRepository();
