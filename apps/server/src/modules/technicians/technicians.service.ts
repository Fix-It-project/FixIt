import { supabaseAdmin } from "../../shared/db/supabase.js";
import type { TechnicianSort } from "../../shared/dtos/index.js";
import type { IStorageRepository } from "../../shared/storage/storage.repository.js";
import {
	cairoDateString,
	cairoLastNDays,
	cairoMidnightUtc,
	cairoStartOfToday,
	cairoStartOfWeek,
	cairoStartOfYesterday,
	shiftDateString,
} from "../../shared/time/cairo-time.js";
import { PENDING_ORDER_EXPIRY_HOURS } from "../../shared/time/order-expiry.js";
import { sortByDistance } from "../../shared/utils/technicians/index.js";
import type { ICategoriesRepository } from "../categories/categories.repository.js";
import type {
	ITechnicianQueryRepository,
	ITechniciansRepository,
	TechnicianListDTO,
	TechnicianProfile,
	TechnicianSelfProfile,
	TechnicianServiceDTO,
	TechnicianWithAddressRow,
	UpdateTechnicianSelfData,
} from "./technicians.repository.js";
import { toDTO } from "./technicians.repository.js";
import type { ITechniciansStatsRepository } from "./technicians-stats.repository.js";

export interface TechnicianListOpts {
	lat?: number;
	lng?: number;
	sort?: TechnicianSort;
	limit?: number;
	offset?: number;
}

/** Dashboard aggregates for the technician home screen. */
export interface TechnicianDashboardStats {
	earnings: {
		today: number;
		yesterday: number;
		thisWeek: number;
		/** Last 7 Cairo calendar days, oldest first, today last. */
		daily: Array<{ date: string; amount: number }>;
	};
	jobs: {
		doneToday: number;
		thisWeek: number;
		pendingCount: number;
	};
	rates: {
		/** tech_accept / (tech_accept + tech_decline), last 30 days. Null when no decisions. */
		acceptanceRate: number | null;
		/** cancelled_by_technician / (cancelled_by_technician + completed), last 30 days. Null when no resolved orders. */
		cancellationRate: number | null;
		/** Lifetime rating from the technician_rating_stats view. */
		rating: number | null;
		reviewCount: number;
		/** This-week rating computed live from reviews (Cairo week, nulls ignored). */
		weeklyRating: number | null;
		/** Count of rated reviews this week. */
		weeklyReviewCount: number;
	};
	/** Hours before a pending order is auto-rejected (see shared/time/order-expiry). */
	pendingExpiryHours: number;
}

export interface TechnicianWalletEntry {
	orderId: string;
	paymentMethod: "cash" | "card";
	grossAmount: number;
	platformFeePercent: number;
	platformFeeAmount: number;
	technicianNetAmount: number;
	paymentStatus: string;
	payoutStatus: "pending_settlement" | "paid_out";
	paidAt: string | null;
}

/**
 * Technician wallet for profile + wallet screens.
 * `lifetimeEarnings` and `last30` power the profile earnings chart; `summary`
 * and `entries` power the settlement/payment detail screen.
 */
export interface TechnicianWallet {
	lifetimeEarnings: number;
	currency: string;
	/** Last 30 Cairo calendar days, oldest first, today last. */
	last30: Array<{ date: string; amount: number }>;
	summary: {
		pendingBalance: number;
		paidOutBalance: number;
		lifetimeNet: number;
		lifetimeGross: number;
		lifetimePlatformFees: number;
	};
	entries: TechnicianWalletEntry[];
}

export interface ITechniciansService {
	getTechniciansByCategory(
		categoryId: string,
		opts?: TechnicianListOpts,
	): Promise<TechnicianListDTO[]>;
	searchTechniciansByCategory(
		categoryId: string,
		query: string,
		opts?: TechnicianListOpts,
	): Promise<TechnicianListDTO[]>;
	getTechnicianProfile(id: string): Promise<TechnicianProfile>;
	getTechnicianServices(id: string): Promise<TechnicianServiceDTO[]>;
	getSelf(technicianId: string): Promise<TechnicianSelfProfile>;
	updateSelf(
		technicianId: string,
		data: UpdateTechnicianSelfData,
	): Promise<TechnicianSelfProfile>;
	updateAvailability(
		technicianId: string,
		isAvailable: boolean,
	): Promise<TechnicianSelfProfile>;
	completeScheduleSetup(technicianId: string): Promise<TechnicianSelfProfile>;
	getStats(technicianId: string): Promise<TechnicianDashboardStats>;
	getWallet(technicianId: string): Promise<TechnicianWallet>;
	uploadProfileImage(
		technicianId: string,
		file: Express.Multer.File,
	): Promise<{ profile_image: string }>;
}

export class TechniciansService implements ITechniciansService {
	constructor(
		private readonly repo: ITechnicianQueryRepository &
			Pick<
				ITechniciansRepository,
				| "getTechnicianSelf"
				| "updateTechnicianSelf"
				| "completeScheduleSetup"
				| "updateProfileImage"
			>,
		private readonly categoriesRepo: ICategoriesRepository,
		private readonly storageRepo: IStorageRepository,
		private readonly statsRepo: ITechniciansStatsRepository,
	) {}

	async getTechniciansByCategory(
		categoryId: string,
		opts?: TechnicianListOpts,
	): Promise<TechnicianListDTO[]> {
		const { lat, lng, sort, limit, offset } = opts ?? {};
		const category = await this.categoriesRepo.getCategoryById(categoryId);
		if (!category)
			throw Object.assign(new Error("Category not found"), { status: 404 });

		if (sort === "top_rated") {
			const rows = await this.filterRowsWithActiveSchedule(
				await this.repo.listTopRatedTechnicians({
					categoryId,
					...(limit != null ? { limit } : {}),
					...(offset != null ? { offset } : {}),
				}),
			);
			return rows.map((r) => toDTO(r, lat, lng));
		}

		const rows = await this.filterRowsWithActiveSchedule(
			await this.repo.getTechniciansByCategory(categoryId),
		);
		return this.buildListPage(rows, { lat, lng, sort, limit, offset });
	}

	async searchTechniciansByCategory(
		categoryId: string,
		query: string,
		opts?: TechnicianListOpts,
	): Promise<TechnicianListDTO[]> {
		const { lat, lng, sort, limit, offset } = opts ?? {};
		const category = await this.categoriesRepo.getCategoryById(categoryId);
		if (!category)
			throw Object.assign(new Error("Category not found"), { status: 404 });

		if (sort === "top_rated") {
			const rows = await this.filterRowsWithActiveSchedule(
				await this.repo.listTopRatedTechnicians({
					categoryId,
					searchQuery: query,
					...(limit != null ? { limit } : {}),
					...(offset != null ? { offset } : {}),
				}),
			);
			return rows.map((r) => toDTO(r, lat, lng));
		}

		const rows = await this.filterRowsWithActiveSchedule(
			await this.repo.searchTechniciansByCategory(categoryId, query),
		);
		return this.buildListPage(rows, { lat, lng, sort, limit, offset });
	}

	private async filterRowsWithActiveSchedule(
		rows: TechnicianWithAddressRow[],
	): Promise<TechnicianWithAddressRow[]> {
		if (rows.length === 0) return [];

		const scheduledIds = await this.repo.getTechnicianIdsWithActiveAvailability(
			rows.map((row) => row.id),
		);
		return rows.filter((row) => scheduledIds.has(row.id));
	}

	private buildListPage(
		rows: TechnicianWithAddressRow[],
		opts: TechnicianListOpts,
	): TechnicianListDTO[] {
		const { lat, lng, sort, limit, offset } = opts;
		if (sort === "nearest") {
			const dtos = rows.map((r) => toDTO(r, lat, lng));
			return this.paginate(sortByDistance(dtos), limit, offset);
		}

		const sortedRows =
			sort === "most_reviews" ? this.sortRowsByMostReviews(rows) : rows;
		return this.paginate(sortedRows, limit, offset).map((r) =>
			toDTO(r, lat, lng),
		);
	}

	private sortRowsByMostReviews(
		rows: TechnicianWithAddressRow[],
	): TechnicianWithAddressRow[] {
		return [...rows].sort((a, b) => {
			const reviewCountA = a.review_count ?? 0;
			const reviewCountB = b.review_count ?? 0;
			if (reviewCountB !== reviewCountA) return reviewCountB - reviewCountA;
			const ratingA = a.avg_rating ?? -1;
			const ratingB = b.avg_rating ?? -1;
			if (ratingB !== ratingA) return ratingB - ratingA;
			return a.first_name.localeCompare(b.first_name);
		});
	}

	private paginate<T>(
		items: T[],
		limit: number | undefined,
		offset: number | undefined,
	): T[] {
		const start = offset ?? 0;
		if (limit == null) return start > 0 ? items.slice(start) : items;
		return items.slice(start, start + limit);
	}

	async getTechnicianProfile(id: string): Promise<TechnicianProfile> {
		const technician = await this.repo.getTechnicianProfile(id);
		if (!technician) {
			throw Object.assign(new Error("Technician not found"), { status: 404 });
		}

		const [{ count: totalBookings }, { count: completedOrders }] =
			await Promise.all([
				supabaseAdmin
					.from("orders")
					.select("*", { count: "exact", head: true })
					.eq("technician_id", id),
				supabaseAdmin
					.from("orders")
					.select("*", { count: "exact", head: true })
					.eq("technician_id", id)
					.eq("status", "completed"),
			]);

		const reviewCount = technician.review_count ?? 0;
		const activeAddress =
			technician.addresses.find((address) => address.is_active) ??
			technician.addresses[0] ??
			null;

		return {
			name: `${technician.first_name} ${technician.last_name}`,
			profilePicture: technician.profile_image ?? null,
			description: technician.description ?? "No description available",
			completedOrders: Number(completedOrders ?? 0),
			totalBookings: Number(totalBookings ?? 0),
			reviews: reviewCount,
			phoneNumber: technician.phone ?? "Not provided",
			city: activeAddress?.city ?? null,
			street: activeAddress?.street ?? null,
			avg_rating: technician.avg_rating ?? null,
			review_count: reviewCount,
		};
	}

	async getTechnicianServices(id: string): Promise<TechnicianServiceDTO[]> {
		return this.repo.getServicesForTechnician(id);
	}

	async getSelf(technicianId: string): Promise<TechnicianSelfProfile> {
		const profile = await this.repo.getTechnicianSelf(technicianId);
		if (!profile) {
			throw Object.assign(new Error("Technician not found"), { status: 404 });
		}
		return profile;
	}

	async updateSelf(
		technicianId: string,
		data: UpdateTechnicianSelfData,
	): Promise<TechnicianSelfProfile> {
		await this.repo.updateTechnicianSelf(technicianId, data);
		return this.getSelf(technicianId);
	}

	async updateAvailability(
		technicianId: string,
		isAvailable: boolean,
	): Promise<TechnicianSelfProfile> {
		await this.repo.updateTechnicianSelf(technicianId, {
			is_available: isAvailable,
		});
		return this.getSelf(technicianId);
	}

	async completeScheduleSetup(
		technicianId: string,
	): Promise<TechnicianSelfProfile> {
		await this.repo.completeScheduleSetup(technicianId);
		return this.getSelf(technicianId);
	}

	async getStats(technicianId: string): Promise<TechnicianDashboardStats> {
		const now = new Date();
		const todayStr = cairoDateString(now);
		const last7Days = cairoLastNDays(7, now);
		const startOfToday = cairoStartOfToday(now);
		const startOfYesterday = cairoStartOfYesterday(now);
		const startOfWeek = cairoStartOfWeek(now);
		const weekStartDate = cairoDateString(startOfWeek);
		const thirtyDaysAgo = cairoMidnightUtc(shiftDateString(todayStr, -30));
		// Single window wide enough for every aggregate (30d covers the 7-day
		// series, yesterday, and the week).
		const sinceIso = thirtyDaysAgo.toISOString();

		const [payments, orders, decisions, ratingStats, weeklyRatingStats] =
			await Promise.all([
				this.statsRepo.getPaidPaymentsSince(technicianId, sinceIso),
				this.statsRepo.getOrdersSince(technicianId, sinceIso, weekStartDate),
				this.statsRepo.getAcceptDeclineEvents(technicianId, sinceIso),
				this.statsRepo.getRatingStats(technicianId),
				this.statsRepo.getWeeklyRatingStats(
					technicianId,
					startOfWeek.toISOString(),
				),
			]);

		const dailyMap = new Map<string, number>(last7Days.map((d) => [d, 0]));
		let today = 0;
		let yesterday = 0;
		let thisWeek = 0;
		for (const p of payments) {
			const paidAt = new Date(p.paid_at);
			const day = cairoDateString(paidAt);
			if (dailyMap.has(day))
				dailyMap.set(day, (dailyMap.get(day) ?? 0) + p.amount);
			if (paidAt >= startOfToday) today += p.amount;
			else if (paidAt >= startOfYesterday) yesterday += p.amount;
			if (paidAt >= startOfWeek) thisWeek += p.amount;
		}

		let doneToday = 0;
		let doneThisWeek = 0;
		let pendingCount = 0;
		let cancelledByTech = 0;
		let completedTotal = 0;
		for (const o of orders) {
			if (o.status === "pending") pendingCount += 1;
			if (o.status === "completed") {
				completedTotal += 1;
				if (o.scheduled_date === todayStr) doneToday += 1;
				if (o.scheduled_date >= weekStartDate) doneThisWeek += 1;
			}
			if (o.status === "cancelled_by_technician") cancelledByTech += 1;
		}

		const accepts = decisions.filter(
			(d) => d.event_type === "tech_accept",
		).length;
		const declines = decisions.length - accepts;
		const acceptanceRate =
			accepts + declines > 0 ? accepts / (accepts + declines) : null;
		const cancellationRate =
			cancelledByTech + completedTotal > 0
				? cancelledByTech / (cancelledByTech + completedTotal)
				: null;

		return {
			earnings: {
				today,
				yesterday,
				thisWeek,
				daily: last7Days.map((date) => ({
					date,
					amount: dailyMap.get(date) ?? 0,
				})),
			},
			jobs: { doneToday, thisWeek: doneThisWeek, pendingCount },
			rates: {
				acceptanceRate,
				cancellationRate,
				rating: ratingStats.rating,
				reviewCount: ratingStats.review_count,
				weeklyRating: weeklyRatingStats.rating,
				weeklyReviewCount: weeklyRatingStats.review_count,
			},
			pendingExpiryHours: PENDING_ORDER_EXPIRY_HOURS,
		};
	}

	async getWallet(technicianId: string): Promise<TechnicianWallet> {
		const now = new Date();
		const last30Days = cairoLastNDays(30, now);
		const todayStr = cairoDateString(now);
		const thirtyDaysAgoIso = cairoMidnightUtc(
			shiftDateString(todayStr, -30),
		).toISOString();

		const [lifetimeEarnings, recentPayments, rows] = await Promise.all([
			this.statsRepo.getLifetimePaidTotal(technicianId),
			this.statsRepo.getPaidPaymentsSince(technicianId, thirtyDaysAgoIso),
			this.statsRepo.getWalletEntries(technicianId),
		]);

		const last30Map = new Map<string, number>(last30Days.map((d) => [d, 0]));
		for (const p of recentPayments ?? []) {
			const day = cairoDateString(new Date(p.paid_at));
			if (last30Map.has(day))
				last30Map.set(day, (last30Map.get(day) ?? 0) + p.amount);
		}

		const entries: TechnicianWalletEntry[] = (rows ?? []).map((row) => {
			const paymentMethod = row.payment_method === "card" ? "card" : "cash";
			return {
				orderId: row.order_id,
				paymentMethod,
				grossAmount: row.gross_amount ?? row.technician_net_amount ?? 0,
				platformFeePercent: row.platform_fee_percent ?? 0,
				platformFeeAmount: row.platform_fee_amount ?? 0,
				technicianNetAmount:
					row.technician_net_amount ?? row.gross_amount ?? 0,
				paymentStatus: row.status,
				payoutStatus:
					paymentMethod === "cash" ? "paid_out" : "pending_settlement",
				paidAt: row.paid_at,
			};
		});

		const summary = entries.reduce(
			(acc, entry) => ({
				pendingBalance:
					acc.pendingBalance +
					(entry.payoutStatus === "pending_settlement"
						? entry.technicianNetAmount
						: 0),
				paidOutBalance:
					acc.paidOutBalance +
					(entry.payoutStatus === "paid_out" ? entry.technicianNetAmount : 0),
				lifetimeNet: acc.lifetimeNet + entry.technicianNetAmount,
				lifetimeGross: acc.lifetimeGross + entry.grossAmount,
				lifetimePlatformFees:
					acc.lifetimePlatformFees + entry.platformFeeAmount,
			}),
			{
				pendingBalance: 0,
				paidOutBalance: 0,
				lifetimeNet: 0,
				lifetimeGross: 0,
				lifetimePlatformFees: 0,
			},
		);

		return {
			lifetimeEarnings,
			currency: "EGP",
			last30: last30Days.map((date) => ({
				date,
				amount: last30Map.get(date) ?? 0,
			})),
			summary,
			entries,
		};
	}

	async uploadProfileImage(
		technicianId: string,
		file: Express.Multer.File,
	): Promise<{ profile_image: string }> {
		const url = await this.storageRepo.uploadFile(
			technicianId,
			"profile_image",
			file,
		);
		await this.repo.updateProfileImage(technicianId, url);
		return { profile_image: url };
	}
}
