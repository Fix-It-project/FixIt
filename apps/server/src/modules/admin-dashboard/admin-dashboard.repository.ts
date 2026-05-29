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
}

export const adminDashboardRepository = new AdminDashboardRepository();
