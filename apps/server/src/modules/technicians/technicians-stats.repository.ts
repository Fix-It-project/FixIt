import { getPaymobConfig } from "../../config/paymob.js";
import { supabaseAdmin } from "../../shared/db/supabase.js";

/** Paid payment row scoped to one technician's orders. */
export interface PaidPaymentRow {
	amount: number;
	paid_at: string;
}

export interface TechnicianWalletEntryRow {
	order_id: string;
	payment_method: string;
	provider: string | null;
	gross_amount: number | null;
	platform_fee_percent: number | null;
	platform_fee_amount: number | null;
	technician_net_amount: number | null;
	status: string;
	paid_at: string | null;
	created_at: string;
}

/** Narrow order row — terminal-status counts + pending queue only. */
export interface StatsOrderRow {
	id: string;
	status: string;
	created_at: string;
	scheduled_date: string;
	active: boolean;
}

/** Accept/decline decision evidence from the order event log. */
export interface AcceptDeclineEventRow {
	event_type: "tech_accept" | "tech_decline";
	created_at: string;
}

export interface TechnicianRatingStats {
	rating: number | null;
	review_count: number;
}

export interface ITechniciansStatsRepository {
	getPaidPaymentsSince(
		technicianId: string,
		sinceIso: string,
	): Promise<PaidPaymentRow[]>;
	getWalletEntries(technicianId: string): Promise<TechnicianWalletEntryRow[]>;
	getOrdersSince(
		technicianId: string,
		sinceIso: string,
		scheduledSinceDate?: string,
	): Promise<StatsOrderRow[]>;
	getAcceptDeclineEvents(
		technicianId: string,
		sinceIso: string,
	): Promise<AcceptDeclineEventRow[]>;
	getRatingStats(technicianId: string): Promise<TechnicianRatingStats>;
	getWeeklyRatingStats(
		technicianId: string,
		sinceIso: string,
	): Promise<TechnicianRatingStats>;
}

export class TechniciansStatsRepository implements ITechniciansStatsRepository {
	async getPaidPaymentsSince(
		technicianId: string,
		sinceIso: string,
	): Promise<PaidPaymentRow[]> {
		const { data, error } = await supabaseAdmin
			.from("payments")
			.select(
				"amount, technician_net_amount, paid_at, orders!inner(technician_id)",
			)
			.eq("status", "paid")
			.eq("orders.technician_id", technicianId)
			.gte("paid_at", sinceIso);
		if (error) throw new Error(error.message);
		return (
			data ?? []
		).map((row: { amount: number; technician_net_amount?: number | null; paid_at: string }) => ({
			amount: Number(row.technician_net_amount ?? row.amount),
			paid_at: row.paid_at,
		}));
	}

	async getWalletEntries(
		technicianId: string,
	): Promise<TechnicianWalletEntryRow[]> {
		// Both card (provider=paymob) and off-site cash (provider=null) earnings.
		const { data, error } = await supabaseAdmin
			.from("payments")
			.select(
				"order_id, amount, payment_method, provider, gross_amount, platform_fee_percent, platform_fee_amount, technician_net_amount, status, paid_at, created_at, orders!inner(technician_id)",
			)
			.eq("status", "paid")
			.eq("orders.technician_id", technicianId)
			.order("paid_at", { ascending: false });
		if (error) throw new Error(error.message);
		const defaultFeePercent = getPaymobConfig().platformFeePercent;
		return (
			data ?? []
		).map(
			(row: {
				order_id: string;
				amount: number;
				payment_method: string;
				provider?: string | null;
				gross_amount?: number | null;
				platform_fee_percent?: number | null;
				platform_fee_amount?: number | null;
				technician_net_amount?: number | null;
				status: string;
				paid_at: string | null;
				created_at: string;
			}) => ({
				order_id: row.order_id,
				payment_method: row.payment_method,
				provider: row.provider ?? null,
				gross_amount:
					row.gross_amount == null ? Number(row.amount) : Number(row.gross_amount),
				platform_fee_percent:
					row.platform_fee_percent == null
						? defaultFeePercent
						: Number(row.platform_fee_percent),
				platform_fee_amount:
					row.platform_fee_amount == null
						? 0
						: Number(row.platform_fee_amount),
				technician_net_amount:
					row.technician_net_amount == null
						? Number(row.amount)
						: Number(row.technician_net_amount),
				status: row.status,
				paid_at: row.paid_at,
				created_at: row.created_at,
			}),
		);
	}

	async getOrdersSince(
		technicianId: string,
		sinceIso: string,
		scheduledSinceDate?: string,
	): Promise<StatsOrderRow[]> {
		// scheduled_date catches orders created before the window but booked
		// inside it (e.g. created last month, scheduled this week).
		let query = supabaseAdmin
			.from("orders")
			.select("id, status, created_at, scheduled_date, active")
			.eq("technician_id", technicianId);
		query = scheduledSinceDate
			? query.or(
					`created_at.gte.${sinceIso},scheduled_date.gte.${scheduledSinceDate}`,
				)
			: query.gte("created_at", sinceIso);
		const { data, error } = await query;
		if (error) throw new Error(error.message);
		return (data ?? []) as StatsOrderRow[];
	}

	async getAcceptDeclineEvents(
		technicianId: string,
		sinceIso: string,
	): Promise<AcceptDeclineEventRow[]> {
		const { data, error } = await supabaseAdmin
			.from("order_events")
			.select("event_type, created_at, orders!inner(technician_id)")
			.in("event_type", ["tech_accept", "tech_decline"])
			.eq("orders.technician_id", technicianId)
			.gte("created_at", sinceIso);
		if (error) throw new Error(error.message);
		return (data ?? []).map(
			(row: { event_type: string; created_at: string }) => ({
				event_type: row.event_type as AcceptDeclineEventRow["event_type"],
				created_at: row.created_at,
			}),
		);
	}

	async getRatingStats(technicianId: string): Promise<TechnicianRatingStats> {
		const { data, error } = await supabaseAdmin
			.from("technician_rating_stats")
			.select("rating, review_count")
			.eq("technician_id", technicianId)
			.maybeSingle();
		if (error) throw new Error(error.message);
		if (!data) return { rating: null, review_count: 0 };
		return {
			rating: data.rating == null ? null : Number(data.rating),
			review_count: Number(data.review_count ?? 0),
		};
	}

	/**
	 * This-week rating, computed live from the `reviews` table (not the lifetime
	 * `technician_rating_stats` view). `rating` is nullable for comment-only
	 * reviews — the average ignores nulls and `review_count` counts rated reviews
	 * only. `sinceIso` should be the Cairo start-of-week boundary.
	 */
	async getWeeklyRatingStats(
		technicianId: string,
		sinceIso: string,
	): Promise<TechnicianRatingStats> {
		const { data, error } = await supabaseAdmin
			.from("reviews")
			.select("rating")
			.eq("technician_id", technicianId)
			.gte("created_at", sinceIso);
		if (error) throw new Error(error.message);

		const rows = (data ?? []) as Array<{ rating: number | null }>;
		let sum = 0;
		let rated = 0;
		for (const row of rows) {
			if (row.rating != null) {
				sum += Number(row.rating);
				rated += 1;
			}
		}
		return {
			rating: rated > 0 ? Math.round((sum / rated) * 10) / 10 : null,
			review_count: rated,
		};
	}
}

export const techniciansStatsRepository = new TechniciansStatsRepository();
