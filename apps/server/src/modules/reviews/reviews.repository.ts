import { supabaseAdmin } from "../../shared/db/supabase.js";

const supabase = supabaseAdmin;

export interface Review {
	id: string;
	rating: number | null;
	comment: string | null;
	user_id: string;
	order_id: string;
	technician_id: string;
	created_at: string;
}

export interface CreateReviewRow {
	user_id: string;
	order_id: string;
	technician_id: string;
	rating?: number | null;
	comment?: string | null;
}

export interface TechnicianReviewWithReviewer {
	id: string;
	rating: number | null;
	comment: string | null;
	created_at: string;
	reviewer_name: string | null;
}

export interface TechnicianReviewSummary {
	avg_rating: number | null;
	review_count: number;
	/** Count of reviews per star rating (1..5). */
	distribution: Record<"1" | "2" | "3" | "4" | "5", number>;
}

export class ReviewsRepository {
	async createReview(row: CreateReviewRow): Promise<Review> {
		// technician_rating_stats is updated automatically by trigger_maintain_technician_rating_stats — do not recompute here.
		const { data, error } = await supabase
			.from("reviews")
			.insert({
				user_id: row.user_id,
				order_id: row.order_id,
				technician_id: row.technician_id,
				rating: row.rating ?? null,
				comment: row.comment ?? null,
			})
			.select()
			.single();

		if (error) throw error;
		return data as Review;
	}

	async getReviewSummary(
		technicianId: string,
	): Promise<TechnicianReviewSummary> {
		const { data, error } = await supabase
			.from("reviews")
			.select("rating")
			.eq("technician_id", technicianId);

		if (error) throw error;

		const distribution: TechnicianReviewSummary["distribution"] = {
			"1": 0,
			"2": 0,
			"3": 0,
			"4": 0,
			"5": 0,
		};
		let sum = 0;
		let rated = 0;
		const rows = (data ?? []) as Array<{ rating: number | null }>;
		for (const row of rows) {
			if (row.rating != null && row.rating >= 1 && row.rating <= 5) {
				distribution[String(row.rating) as keyof typeof distribution] += 1;
				sum += row.rating;
				rated += 1;
			}
		}

		return {
			avg_rating: rated > 0 ? Math.round((sum / rated) * 10) / 10 : null,
			review_count: rows.length,
			distribution,
		};
	}

	async listReviewsForTechnician(
		technicianId: string,
		limit: number,
		offset: number,
	): Promise<TechnicianReviewWithReviewer[]> {
		const { data, error } = await supabase
			.from("reviews")
			.select("id, rating, comment, created_at, users(full_name)")
			.eq("technician_id", technicianId)
			.order("created_at", { ascending: false })
			.range(offset, offset + limit - 1);

		if (error) throw error;

		return (data ?? []).map((row: any) => {
			const usr = Array.isArray(row.users) ? row.users[0] : row.users;
			return {
				id: row.id,
				rating: row.rating,
				comment: row.comment,
				created_at: row.created_at,
				reviewer_name: usr?.full_name ?? null,
			};
		});
	}
}

export const reviewsRepository = new ReviewsRepository();
