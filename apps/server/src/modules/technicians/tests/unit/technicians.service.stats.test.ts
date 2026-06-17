import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

// ── Mock objects ─────────────────────────────────────────────────────────────
// TechniciansService receives its dependencies via constructor DI, so we pass
// plain mock objects — no vi.mock module-hoisting needed.

const makeRepo = () =>
	({
		getTechniciansByCategory: vi.fn(),
		searchTechniciansByCategory: vi.fn(),
		getTechnicianProfile: vi.fn(),
		getReviewAggregatesByTechnicianIds: vi.fn(),
		getTechnicianIdsWithActiveAvailability: vi.fn(),
		listTopRatedTechnicians: vi.fn(),
		getTechnicianSelf: vi.fn(),
		updateTechnicianSelf: vi.fn(),
		updateProfileImage: vi.fn(),
	}) as any;

const makeCategoriesRepo = () =>
	({
		getCategoryById: vi.fn(),
	}) as any;

const makeStorageRepo = () =>
	({
		uploadFile: vi.fn(),
	}) as any;

const makeStatsRepo = () =>
		({
			getPaidPaymentsSince: vi.fn(),
			getWalletEntries: vi.fn().mockResolvedValue([]),
			getOrdersSince: vi.fn(),
			getAcceptDeclineEvents: vi.fn(),
			getRatingStats: vi.fn(),
		getWeeklyRatingStats: vi
			.fn()
			.mockResolvedValue({ rating: null, review_count: 0 }),
	}) as any;

const technicianId = "tech-1";

// Fixed clock: Thursday 2026-01-15 14:00 Cairo (12:00 UTC, EET = UTC+2).
// Cairo week starts Sunday → week start is 2026-01-11.
const NOW_UTC = new Date("2026-01-15T12:00:00.000Z");

describe("TechniciansService.getStats", () => {
	let repo: ReturnType<typeof makeRepo>;
	let statsRepo: ReturnType<typeof makeStatsRepo>;
	let service: import("../../technicians.service.js").TechniciansService;

	beforeEach(async () => {
		vi.clearAllMocks();
		vi.useFakeTimers();
		vi.setSystemTime(NOW_UTC);

		repo = makeRepo();
		statsRepo = makeStatsRepo();

		const { TechniciansService } = await import("../../technicians.service.js");
		service = new TechniciansService(
			repo,
			makeCategoriesRepo(),
			makeStorageRepo(),
			statsRepo,
		);
	});

	afterEach(() => {
		vi.useRealTimers();
	});

	it("aggregates earnings into today / yesterday / week buckets and a 7-day series", async () => {
		statsRepo.getPaidPaymentsSince.mockResolvedValue([
			{ amount: 200, paid_at: "2026-01-15T10:00:00.000Z" }, // today (Cairo)
			{ amount: 150, paid_at: "2026-01-14T10:00:00.000Z" }, // yesterday
			{ amount: 100, paid_at: "2026-01-12T10:00:00.000Z" }, // this week, 3 days ago
			{ amount: 999, paid_at: "2026-01-05T10:00:00.000Z" }, // last week — week/series excluded
		]);
		statsRepo.getOrdersSince.mockResolvedValue([]);
		statsRepo.getAcceptDeclineEvents.mockResolvedValue([]);
		statsRepo.getRatingStats.mockResolvedValue({
			rating: null,
			review_count: 0,
		});

		const stats = await service.getStats(technicianId);

		expect(stats.earnings.today).toBe(200);
		expect(stats.earnings.yesterday).toBe(150);
		expect(stats.earnings.thisWeek).toBe(450);
		expect(stats.earnings.daily).toHaveLength(7);
		expect(stats.earnings.daily[0]).toEqual({ date: "2026-01-09", amount: 0 });
		expect(stats.earnings.daily[3]).toEqual({
			date: "2026-01-12",
			amount: 100,
		});
		expect(stats.earnings.daily[5]).toEqual({
			date: "2026-01-14",
			amount: 150,
		});
		expect(stats.earnings.daily[6]).toEqual({
			date: "2026-01-15",
			amount: 200,
		});
	});

	it("counts jobs and computes acceptance/cancellation rates from events and terminal statuses", async () => {
		statsRepo.getPaidPaymentsSince.mockResolvedValue([]);
		statsRepo.getOrdersSince.mockResolvedValue([
			{
				id: "o1",
				status: "completed",
				created_at: "2026-01-15T08:00:00Z",
				scheduled_date: "2026-01-15",
				active: false,
			},
			{
				id: "o2",
				status: "completed",
				created_at: "2026-01-12T08:00:00Z",
				scheduled_date: "2026-01-12",
				active: false,
			},
			{
				id: "o3",
				status: "completed",
				created_at: "2026-01-02T08:00:00Z",
				scheduled_date: "2026-01-03",
				active: false,
			},
			{
				id: "o4",
				status: "pending",
				created_at: "2026-01-15T11:00:00Z",
				scheduled_date: "2026-01-16",
				active: true,
			},
			{
				id: "o5",
				status: "pending",
				created_at: "2026-01-15T11:30:00Z",
				scheduled_date: "2026-01-17",
				active: true,
			},
			{
				id: "o6",
				status: "cancelled_by_technician",
				created_at: "2026-01-10T08:00:00Z",
				scheduled_date: "2026-01-11",
				active: false,
			},
			{
				id: "o7",
				status: "in_progress",
				created_at: "2026-01-15T07:00:00Z",
				scheduled_date: "2026-01-15",
				active: true,
			},
		]);
		statsRepo.getAcceptDeclineEvents.mockResolvedValue([
			{ event_type: "tech_accept", created_at: "2026-01-14T09:00:00Z" },
			{ event_type: "tech_accept", created_at: "2026-01-13T09:00:00Z" },
			{ event_type: "tech_accept", created_at: "2026-01-12T09:00:00Z" },
			{ event_type: "tech_decline", created_at: "2026-01-11T09:00:00Z" },
		]);
		statsRepo.getRatingStats.mockResolvedValue({
			rating: 4.8,
			review_count: 12,
		});

		const stats = await service.getStats(technicianId);

		expect(stats.jobs.doneToday).toBe(1); // o1 scheduled today
		expect(stats.jobs.thisWeek).toBe(2); // o1 + o2 (o3 last week)
		expect(stats.jobs.pendingCount).toBe(2);
		expect(stats.rates.acceptanceRate).toBeCloseTo(0.75);
		expect(stats.rates.cancellationRate).toBeCloseTo(0.25); // 1 / (1 + 3 completed)
		expect(stats.rates.rating).toBe(4.8);
		expect(stats.rates.reviewCount).toBe(12);
		expect(stats.pendingExpiryHours).toBe(6);
	});

	it("returns null rates when there is no evidence", async () => {
		statsRepo.getPaidPaymentsSince.mockResolvedValue([]);
		statsRepo.getOrdersSince.mockResolvedValue([]);
		statsRepo.getAcceptDeclineEvents.mockResolvedValue([]);
		statsRepo.getRatingStats.mockResolvedValue({
			rating: null,
			review_count: 0,
		});

		const stats = await service.getStats(technicianId);

		expect(stats.rates.acceptanceRate).toBeNull();
		expect(stats.rates.cancellationRate).toBeNull();
		expect(stats.earnings.today).toBe(0);
		expect(stats.earnings.daily.every((d) => d.amount === 0)).toBe(true);
	});

	it("queries every aggregate over a 30-day window with the week's scheduled_date guard", async () => {
		statsRepo.getPaidPaymentsSince.mockResolvedValue([]);
		statsRepo.getOrdersSince.mockResolvedValue([]);
		statsRepo.getAcceptDeclineEvents.mockResolvedValue([]);
		statsRepo.getRatingStats.mockResolvedValue({
			rating: null,
			review_count: 0,
		});

		await service.getStats(technicianId);

		const sinceIso = statsRepo.getPaidPaymentsSince.mock.calls[0][1];
		// 30 days before 2026-01-15 is 2025-12-16; Cairo midnight = 22:00 UTC prior day.
		expect(sinceIso).toBe("2025-12-15T22:00:00.000Z");
		expect(statsRepo.getOrdersSince).toHaveBeenCalledWith(
			technicianId,
			sinceIso,
			"2026-01-11", // Sunday week start
		);
	});

	it("passes through this-week rating, queried from the Cairo week start, independent of lifetime", async () => {
		statsRepo.getPaidPaymentsSince.mockResolvedValue([]);
		statsRepo.getOrdersSince.mockResolvedValue([]);
		statsRepo.getAcceptDeclineEvents.mockResolvedValue([]);
		statsRepo.getRatingStats.mockResolvedValue({
			rating: 4.9,
			review_count: 30,
		});
		statsRepo.getWeeklyRatingStats.mockResolvedValue({
			rating: 4.5,
			review_count: 2,
		});

		const stats = await service.getStats(technicianId);

		expect(stats.rates.weeklyRating).toBe(4.5);
		expect(stats.rates.weeklyReviewCount).toBe(2);
		// lifetime rating stays independent of the weekly figure
		expect(stats.rates.rating).toBe(4.9);
		expect(stats.rates.reviewCount).toBe(30);
		// queried from Cairo Sunday week start: 2026-01-11 00:00 EET = 2026-01-10T22:00Z
		expect(statsRepo.getWeeklyRatingStats).toHaveBeenCalledWith(
			technicianId,
			"2026-01-10T22:00:00.000Z",
		);
	});

	it("builds wallet totals from technician net snapshots", async () => {
		statsRepo.getWalletEntries.mockResolvedValue([
			{
				order_id: "o1",
				payment_method: "card",
				gross_amount: 1000,
				platform_fee_percent: 5,
				platform_fee_amount: 50,
				technician_net_amount: 950,
				status: "paid",
				paid_at: "2026-01-15T10:00:00.000Z",
				created_at: "2026-01-15T09:00:00.000Z",
			},
			{
				order_id: "o2",
				payment_method: "card",
				gross_amount: 800,
				platform_fee_percent: 5,
				platform_fee_amount: 40,
				technician_net_amount: 760,
				status: "paid",
				paid_at: "2026-01-14T10:00:00.000Z",
				created_at: "2026-01-14T09:00:00.000Z",
			},
		]);

		const wallet = await service.getWallet(technicianId);

		expect(wallet.summary.pendingBalance).toBe(1710);
		expect(wallet.summary.lifetimeNet).toBe(1710);
		expect(wallet.summary.lifetimeGross).toBe(1800);
		expect(wallet.summary.lifetimePlatformFees).toBe(90);
		expect(wallet.entries[0]?.payoutStatus).toBe("pending_settlement");
	});

	it("keeps off-site cash wallet rows paid out with no platform fee", async () => {
		statsRepo.getWalletEntries.mockResolvedValue([
			{
				order_id: "cash-1",
				payment_method: "cash",
				gross_amount: 600,
				platform_fee_percent: 0,
				platform_fee_amount: 0,
				technician_net_amount: 600,
				status: "paid",
				paid_at: "2026-01-15T10:00:00.000Z",
				created_at: "2026-01-15T09:00:00.000Z",
			},
		]);

		const wallet = await service.getWallet(technicianId);

		expect(wallet.summary.pendingBalance).toBe(0);
		expect(wallet.summary.paidOutBalance).toBe(600);
		expect(wallet.summary.lifetimeNet).toBe(600);
		expect(wallet.summary.lifetimeGross).toBe(600);
		expect(wallet.summary.lifetimePlatformFees).toBe(0);
		expect(wallet.entries[0]).toMatchObject({
			paymentMethod: "cash",
			payoutStatus: "paid_out",
		});
	});
});

describe("TechniciansService.updateAvailability", () => {
	it("writes is_available and returns the refreshed self profile", async () => {
		const repo = makeRepo();
		const selfProfile = { id: technicianId, is_available: true };
		repo.getTechnicianSelf.mockResolvedValue(selfProfile);
		repo.updateTechnicianSelf.mockResolvedValue({});

		const { TechniciansService } = await import("../../technicians.service.js");
		const service = new TechniciansService(
			repo,
			makeCategoriesRepo(),
			makeStorageRepo(),
			makeStatsRepo(),
		);

		const result = await service.updateAvailability(technicianId, true);

		expect(repo.updateTechnicianSelf).toHaveBeenCalledWith(technicianId, {
			is_available: true,
		});
		expect(result).toBe(selfProfile);
	});
});
