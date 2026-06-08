import { env } from "@FixIt/env/server";
import { AppError } from "../../shared/errors/app-error.js";
import { logger } from "../../shared/logger.js";
import { notificationsService } from "../notifications/notifications.service.js";
import {
	adminDashboardRepository,
	type AdminDashboardRepository,
	type DashboardOrderRow,
	type DetailedOrderRow,
	type HomeownerUserRow,
	type TechnicianStatsRow,
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

function isCompleted(row: DashboardOrderRow): boolean {
	return row.status === "completed";
}

/** Who cancelled, inferred from the raw order status. */
function cancelledByFrom(status: string): "customer" | "technician" | "system" | null {
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

function dayKey(iso: string): string {
	return iso.slice(0, 10); // YYYY-MM-DD (UTC)
}

function dayKeyFor(date: Date): string {
	return date.toISOString().slice(0, 10);
}

/** % change of `current` vs `prior`, one decimal. 0 when prior is 0. */
function pctDelta(current: number, prior: number): number {
	if (prior === 0) return 0;
	return Math.round(((current - prior) / prior) * 1000) / 10;
}

/** Sum/count over a rolling window of `days` ending now, vs the prior window. */
function rollingWindowCompare(
	dates: string[],
	values: number[],
	days: number,
): { current: number; prior: number } {
	const now = Date.now();
	const windowMs = days * 24 * 60 * 60 * 1000;
	const currentStart = now - windowMs;
	const priorStart = now - 2 * windowMs;
	let current = 0;
	let prior = 0;
	for (let i = 0; i < dates.length; i++) {
		const iso = dates[i];
		if (iso === undefined) continue;
		const t = new Date(iso).getTime();
		const v = values[i] ?? 0;
		if (t >= currentStart) current += v;
		else if (t >= priorStart) prior += v;
	}
	return { current, prior };
}

/** Last 14 calendar days (UTC), summing `values` into the matching day bucket. */
function last14DayTrend(dates: string[], values: number[]): number[] {
	const keys: string[] = [];
	const today = new Date();
	for (let i = 13; i >= 0; i--) {
		const d = new Date(today);
		d.setUTCDate(d.getUTCDate() - i);
		keys.push(dayKeyFor(d));
	}
	const idx = new Map(keys.map((k, i) => [k, i]));
	const out = new Array(14).fill(0);
	for (let i = 0; i < dates.length; i++) {
		const iso = dates[i];
		if (iso === undefined) continue;
		const pos = idx.get(dayKey(iso));
		if (pos !== undefined) out[pos] = (out[pos] ?? 0) + (values[i] ?? 0);
	}
	return out;
}

/**
 * Build an N-day window ending today: `labels` are short dates ("May 23"),
 * `count(dates)` buckets timestamps into per-day counts aligned to the window.
 */
function buildDayWindow(days: number): {
	labels: string[];
	count: (dates: string[]) => number[];
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
	const idx = new Map(keys.map((k, i) => [k, i]));
	const count = (dates: string[]): number[] => {
		const out = new Array(days).fill(0);
		for (const iso of dates) {
			const pos = idx.get(dayKey(iso));
			if (pos !== undefined) out[pos] = (out[pos] ?? 0) + 1;
		}
		return out;
	};
	return { labels, count };
}

function completionDate(row: DashboardOrderRow): string {
	return row.user_completed_at ?? row.technician_completed_at ?? row.created_at;
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
		const [orders, categories, serviceCat, technicians, ratingStats, users, reviews] =
			await Promise.all([
				this.repo.getOrders(),
				this.repo.getCategories(),
				this.repo.getServiceCategoryMap(),
				this.repo.getTechnicians(),
				this.repo.getRatingStats(),
				this.repo.getUsersMap(),
				this.repo.getReviewsByOrderId(),
			]);

		const categoryNameById = new Map(
			categories.map((c) => [c.id, c.name ?? "Unknown"]),
		);

		return {
			kpis: this.buildKpis(orders, ratingStats),
			categoryShare: this.buildCategoryShare(orders, serviceCat, categoryNameById),
			statusShare: this.buildStatusShare(orders),
			recentOrders: this.buildRecentOrders(
				orders,
				serviceCat,
				categoryNameById,
				technicians,
				users,
				reviews,
			),
			topTechnicians: this.buildTopTechnicians(
				orders,
				technicians,
				ratingStats,
				categoryNameById,
			),
		};
	}

	async getOrdersSeries(range: SeriesRange): Promise<OrdersSeries> {
		const days = range === "7d" ? 7 : range === "90d" ? 90 : 30;
		const [orders, acceptDates] = await Promise.all([
			this.repo.getOrders(),
			this.repo.getAcceptEventDates(),
		]);

		const { labels, count } = buildDayWindow(days);
		const ordersMade = count(orders.map((o) => o.created_at));
		const accepted = count(acceptDates);
		const completed = count(orders.filter(isCompleted).map(completionDate));

		return {
			days: labels,
			ordersMade,
			accepted,
			completed,
		};
	}

	// --- KPI block ---
	private buildKpis(
		orders: DashboardOrderRow[],
		ratingStats: Map<string, { review_count: number; rating_sum: number }>,
	): KpiMetric[] {
		const createdDates = orders.map((o) => o.created_at);
		const ones = orders.map(() => 1);

		// Total Orders
		const totalOrders = orders.length;
		const totalCmp = rollingWindowCompare(createdDates, ones, 30);

		// Active Now (no historical snapshot -> delta 0, trend is a new-orders proxy)
		const activeNow = orders.filter((o) => o.active).length;

		// Revenue (completed orders' final_price)
		const completedOrders = orders.filter(isCompleted);
		const revenueTotal = completedOrders.reduce(
			(s, o) => s + (o.final_price ?? 0),
			0,
		);
		const revCmp = rollingWindowCompare(
			completedOrders.map(completionDate),
			completedOrders.map((o) => o.final_price ?? 0),
			30,
		);

		// Avg Rating (weighted global from rating stats)
		let sumRatings = 0;
		let sumCount = 0;
		for (const s of ratingStats.values()) {
			sumRatings += s.rating_sum;
			sumCount += s.review_count;
		}
		const avgRating = sumCount > 0 ? sumRatings / sumCount : 5;

		return [
			{
				label: "Total Orders",
				value: formatInt(totalOrders),
				delta: pctDelta(totalCmp.current, totalCmp.prior),
				deltaLabel: "vs. last month",
				icon: "list",
				trend: last14DayTrend(createdDates, ones),
				previous: formatInt(totalCmp.prior),
			},
			{
				label: "Active Now",
				value: formatInt(activeNow),
				delta: 0,
				deltaLabel: "since yesterday",
				icon: "activity",
				trend: last14DayTrend(createdDates, ones),
			},
			{
				label: "Revenue (EGP)",
				value: formatCompact(revenueTotal),
				delta: pctDelta(revCmp.current, revCmp.prior),
				deltaLabel: "vs. last month",
				icon: "wallet",
				trend: last14DayTrend(
					completedOrders.map(completionDate),
					completedOrders.map((o) => o.final_price ?? 0),
				),
				previous: formatCompact(revCmp.prior),
			},
			{
				label: "Avg. Rating",
				value: avgRating.toFixed(2),
				delta: 0,
				deltaLabel: "vs. last month",
				icon: "star",
				trend: new Array(14).fill(Math.round(avgRating * 100) / 100),
			},
		];
	}

	// --- Category share ---
	private buildCategoryShare(
		orders: DashboardOrderRow[],
		serviceCat: Map<string, string>,
		categoryNameById: Map<string, string>,
	): CategoryShare[] {
		const counts = new Map<string, number>();
		let total = 0;
		for (const o of orders) {
			if (!o.service_id) continue;
			const catId = serviceCat.get(o.service_id);
			if (!catId) continue;
			counts.set(catId, (counts.get(catId) ?? 0) + 1);
			total += 1;
		}
		if (total === 0) return [];
		return [...counts.entries()]
			.map(([id, count]) => {
				const name = categoryNameById.get(id) ?? "Unknown";
				return {
					id,
					name,
					color: colorForName(name),
					pct: Math.round((count / total) * 100),
				};
			})
			.sort((a, b) => b.pct - a.pct);
	}

	// --- Status share (collapsed to 4 UI buckets) ---
	private buildStatusShare(orders: DashboardOrderRow[]): StatusShare[] {
		const counts: Record<StatusBucket, number> = {
			completed: 0,
			active: 0,
			pending: 0,
			cancelled: 0,
		};
		for (const o of orders) counts[collapseStatus(o.status)] += 1;
		return [
			{ key: "completed", label: "Completed", count: counts.completed, color: "#10b981" },
			{ key: "in_progress", label: "Accepted", count: counts.active, color: "#3b82f6" },
			{ key: "pending", label: "Pending", count: counts.pending, color: "#f59e0b" },
			{ key: "cancelled", label: "Cancelled", count: counts.cancelled, color: "#ef4444" },
		];
	}

	// --- Recent orders (8 newest, raw status) ---
	private buildRecentOrders(
		orders: DashboardOrderRow[],
		serviceCat: Map<string, string>,
		categoryNameById: Map<string, string>,
		technicians: Array<{ id: string; first_name: string | null; last_name: string | null }>,
		users: Map<string, string>,
		reviews: Map<string, { rating: number; comment: string | null; created_at: string; user_id: string | null }>,
	): DashboardOrder[] {
		const techNameById = new Map(
			technicians.map((t) => [
				t.id,
				`${t.first_name ?? ""} ${t.last_name ?? ""}`.trim() || "Unassigned",
			]),
		);

		return orders.slice(0, 8).map((o) => {
			const techName = o.technician_id
				? techNameById.get(o.technician_id) ?? "Unassigned"
				: "Unassigned";
			const customer = o.user_id ? users.get(o.user_id) ?? "Unknown" : "Unknown";
			const catId = o.service_id ? serviceCat.get(o.service_id) : undefined;
			const category = catId ? categoryNameById.get(catId) ?? "Unknown" : "Unknown";
			const { when, time } = relativeWhen(o.created_at);

			const r = reviews.get(o.id);
			const review: DashboardOrderReview | null = r
				? {
						rating: r.rating,
						comment: r.comment,
						customer: r.user_id ? users.get(r.user_id) ?? customer : customer,
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
		orders: DashboardOrderRow[],
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
		for (const o of orders) {
			if (!o.technician_id || !isCompleted(o)) continue;
			jobs.set(o.technician_id, (jobs.get(o.technician_id) ?? 0) + 1);
			revenue.set(
				o.technician_id,
				(revenue.get(o.technician_id) ?? 0) + (o.final_price ?? 0),
			);
		}

		const toTopTech = (t: (typeof technicians)[number]): TopTech => {
			const name = `${t.first_name ?? ""} ${t.last_name ?? ""}`.trim() || "Unknown";
			const specialty = t.category_id
				? categoryNameById.get(t.category_id) ?? "General"
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

	// --- Orders list (admin orders page) ---
	async getAllOrders(): Promise<AdminOrder[]> {
		const rows = await this.repo.getDetailedOrders();
		return rows.map((r) => this.toAdminOrder(r));
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

	private toAdminOrder(r: DetailedOrderRow): AdminOrder {
		const tech =
			`${r.techFirstName ?? ""} ${r.techLastName ?? ""}`.trim() || "Unassigned";
		const customer = r.customerName ?? "Unknown";
		const { when, time } = relativeWhen(r.created_at);

		const review: AdminOrderReview | null = r.review
			? {
					rating: r.review.rating,
					comment: r.review.comment,
					customer,
					date: new Date(r.review.created_at).toLocaleDateString("en-US", {
						day: "numeric",
						month: "short",
					}),
				}
			: null;

		return {
			id: r.id,
			customer,
			tech,
			techInitials: initialsOf(tech),
			techColor: colorForName(tech),
			category: r.categoryName ?? "Unknown",
			status: r.status,
			amount: r.final_price ?? 0,
			time,
			when,
			createdAt: r.created_at,
			cancelReason: r.cancellation_reason ?? undefined,
			review,
		};
	}

	// --- Homeowners (admin homeowners page) ---
	async getHomeowners(): Promise<AdminHomeowner[]> {
		const [users, orders, cities, reviewAgg, serviceCat, categories, technicians, reviewsByOrder] =
			await Promise.all([
				this.repo.getHomeownerUsers(),
				this.repo.getOrders(),
				this.repo.getCitiesByUser(),
				this.repo.getReviewAggByUser(),
				this.repo.getServiceCategoryMap(),
				this.repo.getCategories(),
				this.repo.getTechnicians(),
				this.repo.getReviewsByOrderId(),
			]);

		const categoryNameById = new Map(
			categories.map((c) => [c.id, c.name ?? "Unknown"]),
		);
		const techNameById = new Map(
			technicians.map((t) => [
				t.id,
				`${t.first_name ?? ""} ${t.last_name ?? ""}`.trim() || "Unassigned",
			]),
		);

		// Orders come newest-first from getOrders(); group by user preserving order.
		const ordersByUser = new Map<string, DashboardOrderRow[]>();
		for (const o of orders) {
			if (!o.user_id) continue;
			const arr = ordersByUser.get(o.user_id) ?? [];
			arr.push(o);
			ordersByUser.set(o.user_id, arr);
		}

		return users.map((u) =>
			this.toAdminHomeowner(
				u,
				ordersByUser.get(u.id) ?? [],
				cities,
				reviewAgg,
				serviceCat,
				categoryNameById,
				techNameById,
				reviewsByOrder,
			),
		);
	}

	private toAdminHomeowner(
		u: HomeownerUserRow,
		userOrders: DashboardOrderRow[],
		cities: Map<string, string>,
		reviewAgg: Map<string, { sum: number; count: number }>,
		serviceCat: Map<string, string>,
		categoryNameById: Map<string, string>,
		techNameById: Map<string, string>,
		reviewsByOrder: Map<string, { rating: number }>,
	): AdminHomeowner {
		const name = u.full_name ?? "Unknown";

		let completed = 0;
		let cancelled = 0;
		let spendValue = 0;
		for (const o of userOrders) {
			const bucket = collapseStatus(o.status);
			if (bucket === "completed") {
				completed += 1;
				spendValue += o.final_price ?? 0;
			} else if (bucket === "cancelled") {
				cancelled += 1;
			}
		}

		const lastOrderAt = userOrders[0]?.created_at ?? null;
		const history: AdminHomeownerHistory[] = userOrders.map((o) => ({
			id: o.id,
			date: relativeWhen(o.created_at).when,
			category: o.service_id
				? (categoryNameById.get(serviceCat.get(o.service_id) ?? "") ?? "Unknown")
				: "Unknown",
			tech: o.technician_id ? (techNameById.get(o.technician_id) ?? "Unassigned") : "Unassigned",
			status: o.status,
			amount: o.final_price ?? 0,
			rating: reviewsByOrder.get(o.id)?.rating ?? null,
		}));

		const agg = reviewAgg.get(u.id);
		const avgRatingGiven = agg && agg.count > 0 ? Math.round((agg.sum / agg.count) * 100) / 100 : null;
		const joinedDate = new Date(u.created_at);

		return {
			id: u.id,
			name,
			initials: initialsOf(name),
			color: colorForName(name),
			phone: u.phone ?? "—",
			email: u.email ?? "—",
			city: cities.get(u.id) ?? "—",
			joined: joinedDate.toLocaleDateString("en-US", { month: "short", year: "numeric" }),
			joinedAt: u.created_at,
			totalOrders: userOrders.length,
			completed,
			cancelled,
			spend: formatCompact(spendValue),
			spendValue,
			avgRatingGiven,
			lastOrder: lastOrderAt ? relativeWhen(lastOrderAt).when : "—",
			lastOrderAt,
			blocked: u.blocked,
			blockedReason: u.blocked_reason ?? undefined,
			blockedAt: u.blocked_at
				? new Date(u.blocked_at).toLocaleDateString("en-GB", {
						day: "2-digit",
						month: "short",
						year: "numeric",
					})
				: undefined,
			blockedBy: u.blocked_by ?? undefined,
			history,
		};
	}

	async blockHomeowner(id: string, reason: string): Promise<AdminHomeowner> {
		const row = await this.repo.setBlocked(id, {
			blocked: true,
			reason,
			by: env.ADMIN_EMAIL,
		});
		if (!row) throw AppError.notFound("Homeowner not found");
		return this.findHomeownerOrThrow(id);
	}

	async unblockHomeowner(id: string): Promise<AdminHomeowner> {
		const row = await this.repo.setBlocked(id, { blocked: false, reason: null, by: null });
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
		const name = `${s.first_name ?? ""} ${s.last_name ?? ""}`.trim() || "Unknown";
		const documents: AdminTechnicianDocument[] = [
			{ kind: "National ID", status: s.national_id ? "uploaded" : "missing" },
			{ kind: "Criminal Record", status: s.criminal_record ? "uploaded" : "missing" },
			{ kind: "Birth Certificate", status: s.birth_certificate ? "uploaded" : "missing" },
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
			joined: joinedDate.toLocaleDateString("en-US", { month: "short", year: "numeric" }),
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
			documents,
			status: s.status as TechnicianStatus,
			blocked: s.status === "blocked",
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
		const [orders, serviceCat, categories, users, reviewsByOrder] = await Promise.all([
			this.repo.getOrdersByTechnician(id),
			this.repo.getServiceCategoryMap(),
			this.repo.getCategories(),
			this.repo.getUsersMap(),
			this.repo.getReviewsByOrderId(),
		]);
		const categoryNameById = new Map(categories.map((c) => [c.id, c.name ?? "Unknown"]));

		return orders.map((o): AdminTechnicianHistory => {
			const r = reviewsByOrder.get(o.id);
			return {
				id: o.id,
				date: relativeWhen(o.created_at).when,
				category: o.service_id
					? (categoryNameById.get(serviceCat.get(o.service_id) ?? "") ?? "Unknown")
					: "Unknown",
				customer: o.user_id ? (users.get(o.user_id) ?? "Unknown") : "Unknown",
				status: o.status,
				cancelReason: o.cancellation_reason,
				cancelledBy: cancelledByFrom(o.status),
				review: r ? { rating: r.rating, comment: r.comment } : null,
				amount: o.final_price ?? 0,
			};
		});
	}

	async verifyTechnician(id: string): Promise<AdminTechnician> {
		const row = await this.repo.setTechnicianStatus(id, { status: "verified" });
		if (!row) throw AppError.notFound("Technician not found");
		// Notify the technician their account is approved (best-effort — never
		// fails the verification). No-op when they have no registered device.
		try {
			await notificationsService.sendPushToRecipient({
				recipientRole: "technician",
				recipientId: id,
				type: "technician_verified",
				title: "You're approved!",
				body: "Your FixIt technician account is verified. Open the app to sign in.",
			});
		} catch (err) {
			logger.warn({ err, technicianId: id }, "[admin-dashboard] verify push failed");
		}
		return this.findTechnicianOrThrow(id);
	}

	async rejectTechnician(id: string): Promise<AdminTechnician> {
		const row = await this.repo.setTechnicianStatus(id, { status: "rejected" });
		if (!row) throw AppError.notFound("Technician not found");
		// Notify the applicant their application was not approved (best-effort).
		try {
			await notificationsService.sendPushToRecipient({
				recipientRole: "technician",
				recipientId: id,
				type: "technician_rejected",
				title: "Application update",
				body: "Your FixIt technician application was not approved. Open the app for details.",
			});
		} catch (err) {
			logger.warn({ err, technicianId: id }, "[admin-dashboard] reject push failed");
		}
		return this.findTechnicianOrThrow(id);
	}

	async blockTechnician(id: string, reason: string): Promise<AdminTechnician> {
		const row = await this.repo.setTechnicianStatus(id, {
			status: "blocked",
			reason,
			by: env.ADMIN_EMAIL,
		});
		if (!row) throw AppError.notFound("Technician not found");
		return this.findTechnicianOrThrow(id);
	}

	async unblockTechnician(id: string): Promise<AdminTechnician> {
		const row = await this.repo.setTechnicianStatus(id, {
			status: "verified",
			reason: null,
			by: null,
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
