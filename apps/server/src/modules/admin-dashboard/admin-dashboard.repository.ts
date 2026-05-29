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

const ORDER_FIELDS =
	"id, status, active, created_at, final_price, service_id, technician_id, user_id, user_completed_at, technician_completed_at, cancellation_reason" as const;

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
}

export const adminDashboardRepository = new AdminDashboardRepository();
