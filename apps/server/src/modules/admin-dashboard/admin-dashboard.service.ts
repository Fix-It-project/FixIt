import { env } from "@FixIt/env/server";
import type { OrdersListQuery } from "../../shared/dtos/admin-dashboard.dto.js";
import { AppError } from "../../shared/errors/app-error.js";
import { logger } from "../../shared/logger.js";
import { notificationsService } from "../notifications/notifications.service.js";
import { lifecycleService } from "../orders/lifecycle/lifecycle.service.js";
import {
	type AdminDashboardRepository,
	type AdminOrderListRow,
	adminDashboardRepository,
	type CategoryShareCountRow,
	type DashboardKpisRow,
	type DetailedOrderRow,
	type HomeownerStatsRow,
	type OrderCompletedDailyRow,
	type OrderCreatedDailyRow,
	type OrdersStatusBucket,
	type ReviewDailyRow,
	type StatusShareRow,
	type TechnicianStatsRow,
	type TechOrderStatsRow,
} from "./admin-dashboard.repository.js";
import type {
	AdminHomeowner,
	AdminHomeownerHistory,
	AdminOrder,
	AdminOrderDetail,
	AdminOrderReview,
	AdminTechnician,
	AdminTechnicianDocument,
	AdminTechnicianHistory,
	CategoryShare,
	DashboardOrder,
	DashboardOrderReview,
	DashboardSummary,
	KpiMetric,
	OrdersSeries,
	SeriesRange,
	StatusShare,
	TechnicianStatus,
	TopTech,
} from "./admin-dashboard.types.js";

export type * from "./admin-dashboard.types.js";

// ---- Status buckets ----

const CANCELLED_STATUSES = new Set([
	"cancelled",
	"cancelled_no_fee",
	"cancelled_with_fee",
	"cancelled_by_user",
	"cancelled_by_technician",
	"declined_by_technician",
	"rejected",
]);

type StatusBucket = "completed" | "pending" | "cancelled" | "active";

function collapseStatus(raw: string): StatusBucket {
	if (raw === "completed") return "completed";
	if (raw === "pending") return "pending";
	if (CANCELLED_STATUSES.has(raw)) return "cancelled";
	return "active";
}

/** Who cancelled, inferred from the raw order status. */
function cancelledByFrom(
	status: string,
): "customer" | "technician" | "system" | null {
	switch (status) {
		case "cancelled_by_user":
			return "customer";
		case "cancelled_by_technician":
		case "declined_by_technician":
			return "technician";
		case "cancelled":
		case "cancelled_no_fee":
		case "cancelled_with_fee":
		case "rejected":
			return "system";
		default:
			return null;
	}
}

// ---- Small formatters / helpers ----

const AVATAR_PALETTE = [
	"#3b82f6",
	"#06b6d4",
	"#22c55e",
	"#f97316",
	"#a855f7",
	"#ef4444",
	"#f43f5e",
	"#6366f1",
	"#92400e",
	"#0ea5e9",
];

function colorForName(name: string): string {
	let hash = 0;
	for (let i = 0; i < name.length; i++) {
		hash = (hash * 31 + name.charCodeAt(i)) | 0;
	}
	const idx = Math.abs(hash) % AVATAR_PALETTE.length;
	return AVATAR_PALETTE[idx] ?? AVATAR_PALETTE[0]!;
}

function initialsOf(name: string): string {
	const parts = name.trim().split(/\s+/).filter(Boolean);
	const first = parts[0] ?? "";
	if (parts.length === 0) return "?";
	if (parts.length === 1) return first.slice(0, 2).toUpperCase() || "?";
	const last = parts[parts.length - 1] ?? "";
	return ((first[0] ?? "") + (last[0] ?? "")).toUpperCase() || "?";
}

function formatInt(n: number): string {
	return Math.round(n).toLocaleString("en-US");
}

function formatCompact(n: number): string {
	if (n >= 1_000_000) return `${(n / 1_000_000).toFixed(2)}M`;
	if (n >= 1_000) return `${(n / 1_000).toFixed(1)}k`;
	return formatInt(n);
}

function dayKeyFor(date: Date): string {
	return date.toISOString().slice(0, 10);
}

/** % change of `current` vs `prior`, one decimal. 0 when prior is 0. */
function pctDelta(current: number, prior: number): number {
	if (prior === 0) return 0;
	return Math.round(((current - prior) / prior) * 1000) / 10;
}

// ---- Daily-bucket helpers ----
// The dashboard now reads pre-aggregated per-day rows (≤ number of distinct
// days) from Postgres instead of every order row. These mirror the raw-date
// helpers above but sum a `value` per `day` ("YYYY-MM-DD", UTC).

interface DailyPoint {
	day: string;
	value: number;
}

/** Midnight-UTC epoch ms for a "YYYY-MM-DD" day key. */
function dayStartMs(day: string): number {
	return new Date(`${day}T00:00:00Z`).getTime();
}

/** The last `n` UTC day keys ending today (oldest first). */
function lastNDayKeys(n: number): string[] {
	const keys: string[] = [];
	const today = new Date();
	for (let i = n - 1; i >= 0; i--) {
		const d = new Date(today);
		d.setUTCDate(d.getUTCDate() - i);
		keys.push(dayKeyFor(d));
	}
	return keys;
}

/** Align daily points to a window's day keys (summing into matching buckets). */
function alignDaily(keys: string[], points: DailyPoint[]): number[] {
	const idx = new Map(keys.map((k, i) => [k, i]));
	const out = new Array(keys.length).fill(0);
	for (const p of points) {
		const pos = idx.get(p.day);
		if (pos !== undefined) out[pos] = (out[pos] ?? 0) + p.value;
	}
	return out;
}

/** Sum over a rolling window of `days` ending now, vs the prior window. */
function rollingWindowCompareDaily(
	points: DailyPoint[],
	days: number,
): { current: number; prior: number } {
	const now = Date.now();
	const windowMs = days * 24 * 60 * 60 * 1000;
	const currentStart = now - windowMs;
	const priorStart = now - 2 * windowMs;
	let current = 0;
	let prior = 0;
	for (const p of points) {
		const t = dayStartMs(p.day);
		if (t >= currentStart) current += p.value;
		else if (t >= priorStart) prior += p.value;
	}
	return { current, prior };
}

/** Average rating last `days` vs prior `days` as a % delta, from daily sums/counts. */
function rollingRatingDeltaDaily(
	rows: ReviewDailyRow[],
	days: number,
): { delta: number | null } {
	const now = Date.now();
	const windowMs = days * 24 * 60 * 60 * 1000;
	const currentStart = now - windowMs;
	const priorStart = now - 2 * windowMs;
	let curSum = 0;
	let curCount = 0;
	let priorSum = 0;
	let priorCount = 0;
	for (const r of rows) {
		const t = dayStartMs(r.day);
		if (t >= currentStart) {
			curSum += r.rating_sum;
			curCount += r.rating_count;
		} else if (t >= priorStart) {
			priorSum += r.rating_sum;
			priorCount += r.rating_count;
		}
	}
	if (curCount === 0 || priorCount === 0) return { delta: null };
	return { delta: pctDelta(curSum / curCount, priorSum / priorCount) };
}

/** Last 14 days' daily average rating, carrying the last known value forward. */
function dailyAvgRatingTrendDaily(
	rows: ReviewDailyRow[],
	overallAvg: number,
): number[] {
	const byDay = new Map(rows.map((r) => [r.day, r]));
	let last = Math.round(overallAvg * 100) / 100;
	const out: number[] = [];
	for (const k of lastNDayKeys(14)) {
		const r = byDay.get(k);
		if (r && r.rating_count > 0) {
			last = Math.round((r.rating_sum / r.rating_count) * 100) / 100;
		}
		out.push(last);
	}
	return out;
}

/** N-day window: short labels ("May 23") + the matching "YYYY-MM-DD" keys. */
function buildDayWindowKeys(days: number): {
	labels: string[];
	keys: string[];
} {
	const keys: string[] = [];
	const labels: string[] = [];
	const today = new Date();
	for (let i = days - 1; i >= 0; i--) {
		const d = new Date(today);
		d.setUTCDate(d.getUTCDate() - i);
		keys.push(dayKeyFor(d));
		labels.push(
			d.toLocaleDateString("en-US", { month: "short", day: "numeric" }),
		);
	}
	return { labels, keys };
}

function relativeWhen(iso: string): { when: string; time: string } {
	const then = new Date(iso);
	const diffMs = Date.now() - then.getTime();
	const mins = Math.floor(diffMs / 60000);
	const hours = Math.floor(mins / 60);
	const days = Math.floor(hours / 24);
	const hhmm = then.toLocaleTimeString("en-US", {
		hour: "numeric",
		minute: "2-digit",
	});
	let when: string;
	if (days === 0) when = `Today, ${hhmm}`;
	else if (days === 1) when = `Yesterday, ${hhmm}`;
	else if (days < 7) when = `${days} days ago`;
	else when = `${then.getDate()}/${then.getMonth() + 1}/${then.getFullYear()}`;

	let time: string;
	if (mins < 60) time = `${Math.max(mins, 1)}m`;
	else if (hours < 24) time = `${hours}h`;
	else time = `${days}d`;
	return { when, time };
}

// ---- Service ----

export class AdminDashboardService {
	constructor(private readonly repo: AdminDashboardRepository) {}

	async getSummary(): Promise<DashboardSummary> {
		const [
			kpis,
			createdDaily,
			completedDaily,
			reviewDaily,
			statusCounts,
			categoryCounts,
			techStats,
			categories,
			technicians,
			ratingStats,
			recent,
		] = await Promise.all([
			this.repo.getDashboardKpis(),
			this.repo.getOrderCreatedDaily(),
			this.repo.getOrderCompletedDaily(),
			this.repo.getReviewDaily(),
			this.repo.getStatusShareCounts(),
			this.repo.getCategoryShareCounts(),
			this.repo.getTechOrderStats(),
			this.repo.getCategories(),
			this.repo.getTechnicians(),
			this.repo.getRatingStats(),
			this.repo.getRecentOrders(8),
		]);

		const categoryNameById = new Map(
			categories.map((c) => [c.id, c.name ?? "Unknown"]),
		);

		return {
			kpis: this.buildKpis(
				kpis,
				createdDaily,
				completedDaily,
				ratingStats,
				reviewDaily,
			),
			categoryShare: this.buildCategoryShare(categoryCounts, categoryNameById),
			statusShare: this.buildStatusShare(statusCounts),
			recentOrders: this.buildRecentOrders(recent),
			topTechnicians: this.buildTopTechnicians(
				techStats,
				technicians,
				ratingStats,
				categoryNameById,
			),
		};
	}

	async getOrdersSeries(range: SeriesRange): Promise<OrdersSeries> {
		const days = range === "7d" ? 7 : range === "90d" ? 90 : 30;
		const [createdDaily, completedDaily, acceptDaily] = await Promise.all([
			this.repo.getOrderCreatedDaily(),
			this.repo.getOrderCompletedDaily(),
			this.repo.getAcceptDaily(),
		]);

		const { labels, keys } = buildDayWindowKeys(days);
		const ordersMade = alignDaily(
			keys,
			createdDaily.map((r) => ({ day: r.day, value: r.orders_made })),
		);
		const accepted = alignDaily(
			keys,
			acceptDaily.map((r) => ({ day: r.day, value: r.accepted })),
		);
		const completed = alignDaily(
			keys,
			completedDaily.map((r) => ({ day: r.day, value: r.completed })),
		);

		return {
			days: labels,
			ordersMade,
			accepted,
			completed,
		};
	}

	// --- KPI block ---
	private buildKpis(
		kpis: DashboardKpisRow,
		createdDaily: OrderCreatedDailyRow[],
		completedDaily: OrderCompletedDailyRow[],
		ratingStats: Map<string, { review_count: number; rating_sum: number }>,
		reviewDaily: ReviewDailyRow[],
	): KpiMetric[] {
		const createdPoints = createdDaily.map((r) => ({
			day: r.day,
			value: r.orders_made,
		}));
		const revenuePoints = completedDaily.map((r) => ({
			day: r.day,
			value: r.revenue,
		}));
		const last14 = lastNDayKeys(14);

		// Orders — 30-day headline (so the % vs the prior 30 days actually matches);
		// the all-time total (uncapped) is surfaced as the secondary figure.
		const totalCmp = rollingWindowCompareDaily(createdPoints, 30);

		// Active Orders — a live snapshot of in-flight orders (orders.active=true:
		// accepted -> awaiting_payment). No history exists, so there's no delta.

		// Revenue — 30-day headline; all-time total as the secondary figure.
		const revCmp = rollingWindowCompareDaily(revenuePoints, 30);

		// Avg Rating — overall weighted average (headline) plus a real last-30d vs
		// prior-30d delta from daily review buckets.
		let sumRatings = 0;
		let sumCount = 0;
		for (const s of ratingStats.values()) {
			sumRatings += s.rating_sum;
			sumCount += s.review_count;
		}
		const avgRating = sumCount > 0 ? sumRatings / sumCount : 5;
		const ratingCmp = rollingRatingDeltaDaily(reviewDaily, 30);

		return [
			{
				label: "Orders (30d)",
				value: formatInt(totalCmp.current),
				delta: pctDelta(totalCmp.current, totalCmp.prior),
				deltaLabel: "vs. prior 30 days",
				icon: "list",
				trend: alignDaily(last14, createdPoints),
				previous: formatInt(kpis.total_orders),
				previousLabel: "all-time",
			},
			{
				label: "Active Orders",
				value: formatInt(kpis.active_orders),
				delta: null,
				deltaLabel: "orders in progress",
				icon: "activity",
				trend: [],
			},
			{
				label: "Revenue (30d)",
				value: formatCompact(revCmp.current),
				delta: pctDelta(revCmp.current, revCmp.prior),
				deltaLabel: "vs. prior 30 days",
				icon: "wallet",
				trend: alignDaily(last14, revenuePoints),
				previous: formatCompact(kpis.revenue_total),
				previousLabel: "all-time",
			},
			{
				label: "Avg. Rating",
				value: avgRating.toFixed(2),
				delta: ratingCmp.delta,
				deltaLabel: "vs. prior 30 days",
				icon: "star",
				trend: dailyAvgRatingTrendDaily(reviewDaily, avgRating),
			},
		];
	}

	// --- Category share ---
	private buildCategoryShare(
		rows: CategoryShareCountRow[],
		categoryNameById: Map<string, string>,
	): CategoryShare[] {
		const total = rows.reduce((s, r) => s + r.count, 0);
		if (total === 0) return [];
		return rows
			.map((r) => {
				const name = categoryNameById.get(r.category_id) ?? "Unknown";
				return {
					id: r.category_id,
					name,
					color: colorForName(name),
					pct: Math.round((r.count / total) * 100),
				};
			})
			.sort((a, b) => b.pct - a.pct);
	}

	// --- Status share (collapsed to 4 UI buckets) ---
	private buildStatusShare(rows: StatusShareRow[]): StatusShare[] {
		const counts: Record<StatusBucket, number> = {
			completed: 0,
			active: 0,
			pending: 0,
			cancelled: 0,
		};
		for (const r of rows) counts[collapseStatus(r.status)] += r.count;
		return [
			{
				key: "completed",
				label: "Completed",
				count: counts.completed,
				color: "#10b981",
			},
			{
				key: "in_progress",
				label: "Accepted",
				count: counts.active,
				color: "#3b82f6",
			},
			{
				key: "pending",
				label: "Pending",
				count: counts.pending,
				color: "#f59e0b",
			},
			{
				key: "cancelled",
				label: "Cancelled",
				count: counts.cancelled,
				color: "#ef4444",
			},
		];
	}

	// --- Recent orders (8 newest, raw status) ---
	private buildRecentOrders(orders: DetailedOrderRow[]): DashboardOrder[] {
		return orders.map((o) => {
			const techName =
				`${o.techFirstName ?? ""} ${o.techLastName ?? ""}`.trim() ||
				"Unassigned";
			const customer = o.customerName ?? "Unknown";
			const category = o.categoryName ?? "Unknown";
			const { when, time } = relativeWhen(o.created_at);

			const r = o.review;
			const review: DashboardOrderReview | null = r
				? {
						rating: r.rating,
						comment: r.comment,
						customer,
						date: new Date(r.created_at).toLocaleDateString("en-US", {
							day: "numeric",
							month: "short",
						}),
					}
				: null;

			return {
				id: o.id,
				customer,
				tech: techName,
				techInitials: initialsOf(techName),
				techColor: colorForName(techName),
				category,
				status: o.status,
				amount: o.final_price ?? 0,
				time,
				when,
				cancelReason: o.cancellation_reason ?? undefined,
				review,
			};
		});
	}

	// --- Top technicians ---
	private buildTopTechnicians(
		techStats: TechOrderStatsRow[],
		technicians: Array<{
			id: string;
			first_name: string | null;
			last_name: string | null;
			category_id: string | null;
		}>,
		ratingStats: Map<string, { rating: number }>,
		categoryNameById: Map<string, string>,
	): { overall: TopTech[]; byCategory: TopTech[] } {
		const jobs = new Map<string, number>();
		const revenue = new Map<string, number>();
		for (const s of techStats) {
			jobs.set(s.technician_id, s.completed_jobs);
			revenue.set(s.technician_id, s.completed_revenue);
		}

		const toTopTech = (t: (typeof technicians)[number]): TopTech => {
			const name =
				`${t.first_name ?? ""} ${t.last_name ?? ""}`.trim() || "Unknown";
			const specialty = t.category_id
				? (categoryNameById.get(t.category_id) ?? "General")
				: "General";
			return {
				name,
				initials: initialsOf(name),
				color: colorForName(name),
				specialty,
				jobs: jobs.get(t.id) ?? 0,
				rating: ratingStats.get(t.id)?.rating ?? 5,
				revenue: formatCompact(revenue.get(t.id) ?? 0),
			};
		};

		const overall = [...technicians]
			.sort((a, b) => (revenue.get(b.id) ?? 0) - (revenue.get(a.id) ?? 0))
			.slice(0, 10)
			.map(toTopTech);

		// Top earner (by revenue) per category.
		const bestByCat = new Map<string, (typeof technicians)[number]>();
		for (const t of technicians) {
			if (!t.category_id) continue;
			const cur = bestByCat.get(t.category_id);
			if (!cur || (revenue.get(t.id) ?? 0) > (revenue.get(cur.id) ?? 0)) {
				bestByCat.set(t.category_id, t);
			}
		}
		const byCategory = [...bestByCat.values()]
			.map(toTopTech)
			.sort((a, b) => b.jobs - a.jobs);

		return { overall, byCategory };
	}

	// --- Orders list (admin orders page; server-side filter + pagination) ---
	async getOrders(params: OrdersListQuery): Promise<{
		data: AdminOrder[];
		total: number;
		counts: Record<OrdersStatusBucket, number>;
	}> {
		const [{ rows, total }, counts] = await Promise.all([
			this.repo.listOrders(params),
			this.repo.countOrdersByBucket(params),
		]);
		return {
			data: rows.map((r) => this.toAdminOrderFromListRow(r)),
			total,
			counts,
		};
	}

	/** Full filtered set (no pagination, capped) for CSV export. */
	async exportOrders(params: OrdersListQuery): Promise<AdminOrder[]> {
		const rows = await this.repo.exportOrders(params);
		return rows.map((r) => this.toAdminOrderFromListRow(r));
	}

	private toAdminOrderFromListRow(r: AdminOrderListRow): AdminOrder {
		const tech = r.tech_name ?? "Unassigned";
		const customer = r.customer_name ?? "Unknown";
		const { when, time } = relativeWhen(r.created_at);

		const review: AdminOrderReview | null =
			r.review_rating != null
				? {
						rating: r.review_rating,
						comment: r.review_comment,
						customer,
						date: r.review_created_at
							? new Date(r.review_created_at).toLocaleDateString("en-US", {
									day: "numeric",
									month: "short",
								})
							: "",
					}
				: null;

		return {
			id: r.id,
			customer,
			tech,
			techInitials: initialsOf(tech),
			techColor: colorForName(tech),
			category: r.category_name ?? "Unknown",
			status: r.status,
			amount: r.final_price ?? 0,
			time,
			when,
			createdAt: r.created_at,
			cancelReason: r.cancellation_reason ?? undefined,
			review,
		};
	}

	async getOrderDetail(id: string): Promise<AdminOrderDetail> {
		const r = await this.repo.getOrderDetail(id);
		if (!r) throw AppError.notFound("Order not found");
		const tech =
			`${r.techFirstName ?? ""} ${r.techLastName ?? ""}`.trim() || "Unassigned";
		return {
			id: r.id,
			problemDescription: r.problem_description,
			status: r.status,
			createdAt: r.created_at,
			scheduledDate: r.scheduled_date,
			scheduledStartAt: r.scheduled_start_at,
			arrivedAt: r.arrived_at,
			userCompletedAt: r.user_completed_at,
			technicianCompletedAt: r.technician_completed_at,
			finalPrice: r.final_price,
			paymentMethod: r.payment_method,
			cancellationReason: r.cancellation_reason,
			attachment: r.attachment,
			customer: r.customerName ?? "Unknown",
			tech,
			service: r.serviceName ?? "Unknown",
			category: r.categoryName ?? "Unknown",
			review: r.review
				? {
						rating: r.review.rating,
						comment: r.review.comment,
						date: new Date(r.review.created_at).toLocaleDateString("en-US", {
							day: "numeric",
							month: "short",
							year: "numeric",
						}),
					}
				: null,
			quotes: r.quotes.map((q) => ({
				proposedBy: q.proposed_by,
				amount: q.amount,
				round: q.round_number,
				status: q.status,
				notes: q.notes,
				createdAt: q.created_at,
			})),
			events: r.events.map((e) => ({
				type: e.event_type,
				fromStatus: e.from_status,
				toStatus: e.to_status,
				actorRole: e.actor_role,
				createdAt: e.created_at,
			})),
			payments: r.payments.map((p) => ({
				amount: p.amount,
				method: p.payment_method,
				status: p.status,
				paidAt: p.paid_at,
			})),
		};
	}

	// --- Homeowners (admin homeowners page) ---
	// One aggregated row per homeowner from `admin_homeowner_stats` (counts/spend/
	// city done in Postgres). Per-order history loads separately via
	// `getHomeownerHistory` so the list query stays small and uncapped.
	async getHomeowners(): Promise<AdminHomeowner[]> {
		const rows = await this.repo.getHomeownerStats();
		return rows.map((r) => this.toAdminHomeowner(r));
	}

	private toAdminHomeowner(s: HomeownerStatsRow): AdminHomeowner {
		const name = s.full_name ?? "Unknown";
		const avgRatingGiven =
			s.review_given_count > 0
				? Math.round((s.review_given_sum / s.review_given_count) * 100) / 100
				: null;
		const joinedDate = new Date(s.created_at);

		return {
			id: s.id,
			name,
			initials: initialsOf(name),
			color: colorForName(name),
			phone: s.phone ?? "—",
			email: s.email ?? "—",
			city: s.city ?? "—",
			joined: joinedDate.toLocaleDateString("en-US", {
				month: "short",
				year: "numeric",
			}),
			joinedAt: s.created_at,
			totalOrders: s.total_orders,
			completed: s.completed,
			cancelled: s.cancelled,
			spend: formatCompact(s.spend),
			spendValue: s.spend,
			avgRatingGiven,
			lastOrder: s.last_order_at ? relativeWhen(s.last_order_at).when : "—",
			lastOrderAt: s.last_order_at,
			reportCount: s.report_count,
			blocked: s.blocked,
			blockPending: s.block_pending,
			blockedReason: s.blocked_reason ?? undefined,
			blockedAt: s.blocked_at
				? new Date(s.blocked_at).toLocaleDateString("en-GB", {
						day: "2-digit",
						month: "short",
						year: "numeric",
					})
				: undefined,
			blockedBy: s.blocked_by ?? undefined,
		};
	}

	/** One homeowner's order history (detail page). Mirrors getTechnicianHistory. */
	async getHomeownerHistory(id: string): Promise<AdminHomeownerHistory[]> {
		if (!(await this.repo.homeownerExists(id))) {
			throw AppError.notFound("Homeowner not found");
		}
		const rows = await this.repo.getOrdersForEntity("user_id", id);
		return rows.map(
			(r): AdminHomeownerHistory => ({
				id: r.id,
				date: relativeWhen(r.created_at).when,
				category: r.category_name ?? "Unknown",
				tech: r.tech_name ?? "Unassigned",
				status: r.status,
				amount: r.final_price ?? 0,
				rating: r.review_rating ?? null,
			}),
		);
	}

	/**
	 * Order-aware block: cancel the account's `pending`/`accepted` orders (no
	 * fee), and decide whether to block fully now or defer until in-flight orders
	 * finish. Returns `fullyBlocked=false` when in-flight orders remain (the
	 * finalize trigger flips the account to blocked once they terminate).
	 */
	private async resolveBlock(
		role: "user" | "technician",
		id: string,
	): Promise<{ fullyBlocked: boolean }> {
		const active = await this.repo.getActiveOrders(role, id);
		const reasonText =
			role === "user"
				? "The customer's account was suspended"
				: "The technician's account was suspended";
		const toCancel = active.filter(
			(o) => o.status === "pending" || o.status === "accepted",
		);
		for (const o of toCancel) {
			try {
				await lifecycleService.cancelOrder(o.id, id, role, reasonText);
			} catch (err) {
				logger.warn(
					{ err, orderId: o.id, accountId: id, role },
					"[admin-dashboard] block: order cancel failed",
				);
			}
		}
		// In-flight orders (anything active that wasn't pending/accepted) defer the block.
		return { fullyBlocked: active.length - toCancel.length === 0 };
	}

	async blockHomeowner(id: string, reason: string): Promise<AdminHomeowner> {
		const { fullyBlocked } = await this.resolveBlock("user", id);
		const row = await this.repo.setBlocked(id, {
			blocked: fullyBlocked,
			blockPending: !fullyBlocked,
			reason,
			by: env.ADMIN_EMAIL,
		});
		if (!row) throw AppError.notFound("Homeowner not found");
		return this.findHomeownerOrThrow(id);
	}

	async unblockHomeowner(id: string): Promise<AdminHomeowner> {
		const row = await this.repo.setBlocked(id, {
			blocked: false,
			blockPending: false,
			reason: null,
			by: null,
		});
		if (!row) throw AppError.notFound("Homeowner not found");
		return this.findHomeownerOrThrow(id);
	}

	private async findHomeownerOrThrow(id: string): Promise<AdminHomeowner> {
		const all = await this.getHomeowners();
		const found = all.find((h) => h.id === id);
		if (!found) throw AppError.notFound("Homeowner not found");
		return found;
	}

	// --- Technicians (admin technicians page) ---
	async getTechnicians(): Promise<AdminTechnician[]> {
		const rows = await this.repo.getTechnicianStats();
		return rows.map((r) => this.toAdminTechnician(r));
	}

	private toAdminTechnician(s: TechnicianStatsRow): AdminTechnician {
		const name =
			`${s.first_name ?? ""} ${s.last_name ?? ""}`.trim() || "Unknown";
		const documents: AdminTechnicianDocument[] = [
			{
				kind: "National ID",
				status: s.national_id ? "uploaded" : "missing",
				url: s.national_id ?? null,
			},
			{
				kind: "Criminal Record",
				status: s.criminal_record ? "uploaded" : "missing",
				url: s.criminal_record ?? null,
			},
			{
				kind: "Birth Certificate",
				status: s.birth_certificate ? "uploaded" : "missing",
				url: s.birth_certificate ?? null,
			},
		];
		const joinedDate = new Date(s.created_at);
		return {
			id: s.id,
			name,
			initials: initialsOf(name),
			color: colorForName(name),
			specialty: s.category_name ?? "General",
			city: s.city ?? "—",
			phone: s.phone ?? "—",
			email: s.email ?? "—",
			joined: joinedDate.toLocaleDateString("en-US", {
				month: "short",
				year: "numeric",
			}),
			joinedAt: s.created_at,
			appliedAt: relativeWhen(s.created_at).when,
			availability: s.is_available ? "online" : "offline",
			rating: s.rating,
			reviews: s.review_count,
			completed: s.completed,
			totalOrders: s.total_orders,
			cancelled: s.cancelled,
			revenue: formatCompact(s.revenue),
			revenueValue: s.revenue,
			yearsExperience: s.years_experience,
			reportCount: s.report_count,
			documents,
			status: s.status as TechnicianStatus,
			blocked: s.status === "blocked",
			blockPending: s.block_pending,
			blockedReason: s.blocked_reason ?? undefined,
			blockedAt: s.blocked_at
				? new Date(s.blocked_at).toLocaleDateString("en-GB", {
						day: "2-digit",
						month: "short",
						year: "numeric",
					})
				: undefined,
			blockedBy: s.blocked_by ?? undefined,
		};
	}

	async getTechnicianHistory(id: string): Promise<AdminTechnicianHistory[]> {
		if (!(await this.repo.technicianExists(id))) {
			throw AppError.notFound("Technician not found");
		}
		const rows = await this.repo.getOrdersForEntity("technician_id", id);
		return rows.map(
			(r): AdminTechnicianHistory => ({
				id: r.id,
				date: relativeWhen(r.created_at).when,
				category: r.category_name ?? "Unknown",
				customer: r.customer_name ?? "Unknown",
				status: r.status,
				cancelReason: r.cancellation_reason,
				cancelledBy: cancelledByFrom(r.status),
				review:
					r.review_rating != null
						? { rating: r.review_rating, comment: r.review_comment }
						: null,
				amount: r.final_price ?? 0,
			}),
		);
	}

	async verifyTechnician(id: string): Promise<AdminTechnician> {
		const row = await this.repo.setTechnicianStatus(id, { status: "verified" });
		if (!row) throw AppError.notFound("Technician not found");
		// Fire-and-forget: a slow/failed push (exp.host egress) must never delay or
		// fail the verification. Runs in the background with its own retries.
		void Promise.resolve(
			notificationsService.sendPushToRecipient({
				recipientRole: "technician",
				recipientId: id,
				type: "technician_verified",
				title: "You're approved!",
				body: "Your FixIt technician account is verified. Open the app to sign in.",
			}),
		).catch((err) => {
			logger.warn(
				{ err, technicianId: id },
				"[admin-dashboard] verify push failed",
			);
		});
		return this.findTechnicianOrThrow(id);
	}

	async rejectTechnician(id: string): Promise<AdminTechnician> {
		const row = await this.repo.setTechnicianStatus(id, { status: "rejected" });
		if (!row) throw AppError.notFound("Technician not found");
		// Fire-and-forget (see verifyTechnician).
		void Promise.resolve(
			notificationsService.sendPushToRecipient({
				recipientRole: "technician",
				recipientId: id,
				type: "technician_rejected",
				title: "Application update",
				body: "Your FixIt technician application was not approved. Open the app for details.",
			}),
		).catch((err) => {
			logger.warn(
				{ err, technicianId: id },
				"[admin-dashboard] reject push failed",
			);
		});
		return this.findTechnicianOrThrow(id);
	}

	async blockTechnician(id: string, reason: string): Promise<AdminTechnician> {
		const { fullyBlocked } = await this.resolveBlock("technician", id);
		// Deferred block keeps status='verified' (they can finish in-flight jobs)
		// with block_pending=true; the finalize trigger flips status to 'blocked'.
		const row = await this.repo.setTechnicianStatus(
			id,
			fullyBlocked
				? { status: "blocked", reason, by: env.ADMIN_EMAIL }
				: {
						status: "verified",
						reason,
						by: env.ADMIN_EMAIL,
						blockPending: true,
					},
		);
		if (!row) throw AppError.notFound("Technician not found");
		return this.findTechnicianOrThrow(id);
	}

	async unblockTechnician(id: string): Promise<AdminTechnician> {
		const row = await this.repo.setTechnicianStatus(id, {
			status: "verified",
			reason: null,
			by: null,
			blockPending: false,
		});
		if (!row) throw AppError.notFound("Technician not found");
		return this.findTechnicianOrThrow(id);
	}

	private async findTechnicianOrThrow(id: string): Promise<AdminTechnician> {
		const all = await this.getTechnicians();
		const found = all.find((t) => t.id === id);
		if (!found) throw AppError.notFound("Technician not found");
		return found;
	}
}

export const adminDashboardService = new AdminDashboardService(
	adminDashboardRepository,
);
