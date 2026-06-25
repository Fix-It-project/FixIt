import { supabaseAdmin } from "../../shared/db/supabase.js";
import type { OrdersListQuery } from "../../shared/dtos/admin-dashboard.dto.js";
import type {
	AcceptDailyRow,
	AdminOrderListRow,
	CategoryRow,
	CategoryShareCountRow,
	DashboardKpisRow,
	DetailedOrderRow,
	HomeownerStatsRow,
	HomeownerUserRow,
	OrderCompletedDailyRow,
	OrderCreatedDailyRow,
	OrderDetailRow,
	RatingStatRow,
	ReviewDailyRow,
	StatusShareRow,
	TechnicianRow,
	TechnicianStatsRow,
	TechOrderStatsRow,
} from "./admin-dashboard.repository.types.js";

// Row shapes live in `admin-dashboard.repository.types.js` (colocated with the
// data layer); re-exported here so existing consumers keep importing from the
// repository module.
export type * from "./admin-dashboard.repository.types.js";

// Non-terminal order statuses (everything except completed / declined / the
// cancelled* variants / rejected). An account with any of these is mid-engagement.
const ACTIVE_ORDER_STATUSES = [
	"pending",
	"accepted",
	"tracking",
	"arrived_inspection",
	"awaiting_final_cost",
	"negotiating",
	"in_progress",
	"awaiting_payment",
	"reschedule_requested_by_user",
	"reschedule_requested_by_technician",
] as const;

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

/** Map a `DETAILED_SELECT` row into a `DetailedOrderRow` (recent + orders list). */
function mapDetailedOrderRow(row: any): DetailedOrderRow {
	const user = one<{ full_name: string | null }>(row.users);
	const tech = one<{ first_name: string | null; last_name: string | null }>(
		row.technicians,
	);
	const service = one<{
		name: string | null;
		categories: { name: string | null } | { name: string | null }[] | null;
	}>(row.services);
	const category = service
		? one<{ name: string | null }>(service.categories)
		: null;
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
}

// ---- Orders list (server-side pagination/filter on the admin_orders view) ----

export type OrdersStatusBucket = OrdersListQuery["status"];

/** Raw statuses that collapse into each orders-page filter chip. */
const ORDERS_BUCKET_STATUSES: Record<
	Exclude<OrdersStatusBucket, "all">,
	readonly string[]
> = {
	pending: ["pending"],
	accepted: ["accepted"],
	completed: ["completed"],
	cancelled: [
		"cancelled",
		"cancelled_no_fee",
		"cancelled_with_fee",
		"cancelled_by_user",
		"cancelled_by_technician",
		"declined_by_technician",
		"rejected",
	],
	active: [
		"tracking",
		"arrived_inspection",
		"awaiting_final_cost",
		"negotiating",
		"in_progress",
		"awaiting_payment",
		"reschedule_requested_by_user",
		"reschedule_requested_by_technician",
	],
};

function ordersDateCutoffIso(date: OrdersListQuery["date"]): string | null {
	if (date === "all") return null;
	let days = 90;
	if (date === "today") days = 1;
	else if (date === "7d") days = 7;
	else if (date === "30d") days = 30;
	return new Date(Date.now() - days * 24 * 60 * 60 * 1000).toISOString();
}

/** Strip characters that would break the PostgREST `.or()` filter grammar. */
function sanitizeSearch(q?: string): string | null {
	if (!q) return null;
	const cleaned = q.replace(/[,()*%]/g, " ").trim();
	return cleaned.length > 0 ? cleaned : null;
}

/** Apply search/date/amount (+ optional status list) to an admin_orders query. */
function applyOrderFilters(
	// biome-ignore lint/suspicious/noExplicitAny: PostgREST builder generics are unwieldy.
	query: any,
	params: OrdersListQuery,
	statuses: readonly string[] | null,
	// biome-ignore lint/suspicious/noExplicitAny: see above.
): any {
	let q = query;
	if (statuses) q = q.in("status", statuses as string[]);
	const s = sanitizeSearch(params.search);
	if (s) {
		q = q.or(
			`id_text.ilike.*${s}*,customer_name.ilike.*${s}*,tech_name.ilike.*${s}*`,
		);
	}
	const cutoff = ordersDateCutoffIso(params.date);
	if (cutoff) q = q.gte("created_at", cutoff);
	switch (params.amount) {
		case "lt100":
			q = q.lt("final_price", 100);
			break;
		case "100_500":
			q = q.gte("final_price", 100).lte("final_price", 500);
			break;
		case "500_1000":
			q = q.gt("final_price", 500).lte("final_price", 1000);
			break;
		case "gt1000":
			q = q.gt("final_price", 1000);
			break;
	}
	return q;
}

export class AdminDashboardRepository {
	// ---- Dashboard aggregates (computed in Postgres; see admin-dashboard-aggregates.sql) ----
	// These read small fixed result sets from the aggregate views instead of
	// pulling every order row into Node (which capped totals at PostgREST's
	// 1000-row default and did not scale).

	/** Single-row headline KPIs. */
	async getDashboardKpis(): Promise<DashboardKpisRow> {
		const { data, error } = await supabaseAdmin
			.from("admin_dashboard_kpis")
			.select("total_orders, active_orders, completed_orders, revenue_total")
			.maybeSingle();
		if (error) throw new Error(error.message);
		const r = (data ?? {}) as Partial<DashboardKpisRow>;
		return {
			total_orders: Number(r.total_orders ?? 0),
			active_orders: Number(r.active_orders ?? 0),
			completed_orders: Number(r.completed_orders ?? 0),
			revenue_total: Number(r.revenue_total ?? 0),
		};
	}

	/** Orders created per UTC day. */
	async getOrderCreatedDaily(): Promise<OrderCreatedDailyRow[]> {
		const { data, error } = await supabaseAdmin
			.from("admin_order_created_daily")
			.select("day, orders_made");
		if (error) throw new Error(error.message);
		return (data ?? []).map((r: any) => ({
			day: r.day as string,
			orders_made: Number(r.orders_made ?? 0),
		}));
	}

	/** Orders completed per UTC day + revenue. */
	async getOrderCompletedDaily(): Promise<OrderCompletedDailyRow[]> {
		const { data, error } = await supabaseAdmin
			.from("admin_order_completed_daily")
			.select("day, completed, revenue");
		if (error) throw new Error(error.message);
		return (data ?? []).map((r: any) => ({
			day: r.day as string,
			completed: Number(r.completed ?? 0),
			revenue: Number(r.revenue ?? 0),
		}));
	}

	/** Technician-accept events per UTC day — drives the "accepted" series. */
	async getAcceptDaily(): Promise<AcceptDailyRow[]> {
		const { data, error } = await supabaseAdmin
			.from("admin_accept_daily")
			.select("day, accepted");
		if (error) throw new Error(error.message);
		return (data ?? []).map((r: any) => ({
			day: r.day as string,
			accepted: Number(r.accepted ?? 0),
		}));
	}

	/** Review ratings per UTC day — drives the rolling avg-rating delta + sparkline. */
	async getReviewDaily(): Promise<ReviewDailyRow[]> {
		const { data, error } = await supabaseAdmin
			.from("admin_review_daily")
			.select("day, rating_sum, rating_count");
		if (error) throw new Error(error.message);
		return (data ?? []).map((r: any) => ({
			day: r.day as string,
			rating_sum: Number(r.rating_sum ?? 0),
			rating_count: Number(r.rating_count ?? 0),
		}));
	}

	/** Order count per raw status (collapsed to UI buckets in the service). */
	async getStatusShareCounts(): Promise<StatusShareRow[]> {
		const { data, error } = await supabaseAdmin
			.from("admin_status_share")
			.select("status, count");
		if (error) throw new Error(error.message);
		return (data ?? []).map((r: any) => ({
			status: r.status as string,
			count: Number(r.count ?? 0),
		}));
	}

	/** Order count per category. */
	async getCategoryShareCounts(): Promise<CategoryShareCountRow[]> {
		const { data, error } = await supabaseAdmin
			.from("admin_category_share")
			.select("category_id, count");
		if (error) throw new Error(error.message);
		return (data ?? []).map((r: any) => ({
			category_id: r.category_id as string,
			count: Number(r.count ?? 0),
		}));
	}

	/** Completed jobs + revenue per technician — drives top technicians. */
	async getTechOrderStats(): Promise<TechOrderStatsRow[]> {
		const { data, error } = await supabaseAdmin
			.from("admin_tech_order_stats")
			.select("technician_id, completed_jobs, completed_revenue");
		if (error) throw new Error(error.message);
		return (data ?? []).map((r: any) => ({
			technician_id: r.technician_id as string,
			completed_jobs: Number(r.completed_jobs ?? 0),
			completed_revenue: Number(r.completed_revenue ?? 0),
		}));
	}

	/** The N newest orders, fully joined — drives the dashboard "recent orders" panel. */
	async getRecentOrders(limit = 8): Promise<DetailedOrderRow[]> {
		const { data, error } = await supabaseAdmin
			.from("orders")
			.select(DETAILED_SELECT)
			.order("created_at", { ascending: false })
			.limit(limit);
		if (error) throw new Error(error.message);
		return (data ?? []).map(mapDetailedOrderRow);
	}

	async getCategories(): Promise<CategoryRow[]> {
		const { data, error } = await supabaseAdmin
			.from("categories")
			.select("id, name");
		if (error) throw new Error(error.message);
		return (data ?? []) as CategoryRow[];
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

	// ---- Homeowners ----

	/** One already-aggregated row per homeowner (counts/spend/city done by the view). */
	async getHomeownerStats(): Promise<HomeownerStatsRow[]> {
		const { data, error } = await supabaseAdmin
			.from("admin_homeowner_stats")
			.select("*");
		if (error) throw new Error(error.message);
		return (data ?? []).map(
			(r: any): HomeownerStatsRow => ({
				id: r.id,
				created_at: r.created_at,
				full_name: r.full_name,
				email: r.email,
				phone: r.phone,
				blocked: !!r.blocked,
				block_pending: !!r.block_pending,
				blocked_reason: r.blocked_reason,
				blocked_at: r.blocked_at,
				blocked_by: r.blocked_by,
				city: r.city,
				total_orders: Number(r.total_orders ?? 0),
				completed: Number(r.completed ?? 0),
				cancelled: Number(r.cancelled ?? 0),
				spend: Number(r.spend ?? 0),
				last_order_at: r.last_order_at,
				review_given_sum: Number(r.review_given_sum ?? 0),
				review_given_count: Number(r.review_given_count ?? 0),
				report_count: Number(r.report_count ?? 0),
			}),
		);
	}

	/** Does a homeowner id exist? (history endpoint 404 guard.) */
	async homeownerExists(id: string): Promise<boolean> {
		const { data, error } = await supabaseAdmin
			.from("users")
			.select("id")
			.eq("id", id)
			.maybeSingle();
		if (error) throw new Error(error.message);
		return !!data;
	}

	async setBlocked(
		userId: string,
		state: {
			blocked: boolean;
			blockPending: boolean;
			reason: string | null;
			by: string | null;
		},
	): Promise<HomeownerUserRow | null> {
		const { data, error } = await supabaseAdmin
			.from("users")
			.update({
				blocked: state.blocked,
				block_pending: state.blockPending,
				blocked_reason: state.reason,
				// blocked_at is set now when fully blocked; for a deferred block the
				// finalize trigger sets it when the last order completes.
				blocked_at: state.blocked ? new Date().toISOString() : null,
				blocked_by: state.by,
			})
			.eq("id", userId)
			.select(
				"id, created_at, full_name, email, phone, blocked, block_pending, blocked_reason, blocked_at, blocked_by",
			)
			.single();
		if (error) {
			if (error.code === "PGRST116") return null; // no row matched
			throw new Error(error.message);
		}
		return data as HomeownerUserRow;
	}

	/** Non-terminal (active) orders for an account — drives block deferral. */
	async getActiveOrders(
		role: "user" | "technician",
		id: string,
	): Promise<{ id: string; status: string }[]> {
		const column = role === "user" ? "user_id" : "technician_id";
		const { data, error } = await supabaseAdmin
			.from("orders")
			.select("id, status")
			.eq(column, id)
			.in("status", ACTIVE_ORDER_STATUSES);
		if (error) throw new Error(error.message);
		return (data ?? []) as { id: string; status: string }[];
	}

	// ---- Technicians ----

	/** One already-aggregated row per technician (counts/revenue done by the view). */
	async getTechnicianStats(): Promise<TechnicianStatsRow[]> {
		const { data, error } = await supabaseAdmin
			.from("admin_technician_stats")
			.select("*");
		if (error) throw new Error(error.message);
		return (data ?? []).map(
			(r: any): TechnicianStatsRow => ({
				id: r.id,
				created_at: r.created_at,
				first_name: r.first_name,
				last_name: r.last_name,
				email: r.email,
				phone: r.phone,
				is_available: r.is_available,
				status: r.status,
				block_pending: !!r.block_pending,
				blocked_reason: r.blocked_reason,
				blocked_at: r.blocked_at,
				blocked_by: r.blocked_by,
				category_id: r.category_id,
				years_experience:
					r.years_experience == null ? null : Number(r.years_experience),
				criminal_record: r.criminal_record,
				birth_certificate: r.birth_certificate,
				national_id: r.national_id,
				category_name: r.category_name,
				city: r.city,
				rating: r.rating == null ? null : Number(r.rating),
				review_count: Number(r.review_count ?? 0),
				total_orders: Number(r.total_orders ?? 0),
				completed: Number(r.completed ?? 0),
				cancelled: Number(r.cancelled ?? 0),
				revenue: Number(r.revenue ?? 0),
				report_count: Number(r.report_count ?? 0),
			}),
		);
	}

	/** Does a technician id exist? (history endpoint 404 guard.) */
	async technicianExists(id: string): Promise<boolean> {
		const { data, error } = await supabaseAdmin
			.from("technicians")
			.select("id")
			.eq("id", id)
			.maybeSingle();
		if (error) throw new Error(error.message);
		return !!data;
	}

	/** Set a technician's status + block metadata. Returns null if no row matched. */
	async setTechnicianStatus(
		id: string,
		state: {
			status: string;
			reason?: string | null;
			by?: string | null;
			blockPending?: boolean;
		},
	): Promise<{ id: string } | null> {
		const isBlocked = state.status === "blocked";
		const { data, error } = await supabaseAdmin
			.from("technicians")
			.update({
				status: state.status,
				block_pending: state.blockPending ?? false,
				blocked_reason: state.reason ?? null,
				blocked_at: isBlocked ? new Date().toISOString() : null,
				blocked_by: state.by ?? null,
			})
			.eq("id", id)
			.select("id")
			.single();
		if (error) {
			if (error.code === "PGRST116") return null; // no row matched
			throw new Error(error.message);
		}
		return data as { id: string };
	}

	/** Admin orders list page (server-side filter + pagination + exact count). */
	async listOrders(
		params: OrdersListQuery,
	): Promise<{ rows: AdminOrderListRow[]; total: number }> {
		const statuses =
			params.status === "all" ? null : ORDERS_BUCKET_STATUSES[params.status];
		let q = supabaseAdmin.from("admin_orders").select("*", { count: "exact" });
		q = applyOrderFilters(q, params, statuses);
		q = q
			.order("created_at", { ascending: false })
			.range(
				(params.page - 1) * params.pageSize,
				params.page * params.pageSize - 1,
			);
		const { data, error, count } = await q;
		if (error) throw new Error(error.message);
		return { rows: (data ?? []) as AdminOrderListRow[], total: count ?? 0 };
	}

	/** Per-bucket counts under the base filters (search/date/amount, no status). */
	async countOrdersByBucket(
		params: OrdersListQuery,
	): Promise<Record<OrdersStatusBucket, number>> {
		const buckets: OrdersStatusBucket[] = [
			"all",
			"pending",
			"accepted",
			"active",
			"completed",
			"cancelled",
		];
		const entries = await Promise.all(
			buckets.map(async (bucket) => {
				const statuses =
					bucket === "all" ? null : ORDERS_BUCKET_STATUSES[bucket];
				let q = supabaseAdmin
					.from("admin_orders")
					.select("id", { count: "exact", head: true });
				q = applyOrderFilters(q, params, statuses);
				const { count, error } = await q;
				if (error) throw new Error(error.message);
				return [bucket, count ?? 0] as const;
			}),
		);
		return Object.fromEntries(entries) as Record<OrdersStatusBucket, number>;
	}

	/** All orders matching the filters (no pagination, capped) — drives CSV export. */
	async exportOrders(
		params: OrdersListQuery,
		cap = 5000,
	): Promise<AdminOrderListRow[]> {
		const statuses =
			params.status === "all" ? null : ORDERS_BUCKET_STATUSES[params.status];
		let q = supabaseAdmin.from("admin_orders").select("*");
		q = applyOrderFilters(q, params, statuses);
		q = q.order("created_at", { ascending: false }).range(0, cap - 1);
		const { data, error } = await q;
		if (error) throw new Error(error.message);
		return (data ?? []) as AdminOrderListRow[];
	}

	/** One entity's orders (newest first) from the flat view — detail-page history. */
	async getOrdersForEntity(
		column: "user_id" | "technician_id",
		id: string,
	): Promise<AdminOrderListRow[]> {
		const { data, error } = await supabaseAdmin
			.from("admin_orders")
			.select("*")
			.eq(column, id)
			.order("created_at", { ascending: false });
		if (error) throw new Error(error.message);
		return (data ?? []) as AdminOrderListRow[];
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
		const tech = one<{ first_name: string | null; last_name: string | null }>(
			r.technicians,
		);
		const service = one<{
			name: string | null;
			categories: { name: string | null } | { name: string | null }[] | null;
		}>(r.services);
		const category = service
			? one<{ name: string | null }>(service.categories)
			: null;
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
			serviceName: service?.name ?? null,
			categoryName: category?.name ?? null,
			review,
			quotes,
			events,
			payments,
		};
	}
}

export const adminDashboardRepository = new AdminDashboardRepository();
