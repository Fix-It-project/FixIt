import { beforeEach, describe, expect, it, vi } from "vitest";
import type {
	HomeownerStatsRow,
	TechnicianStatsRow,
} from "../../admin-dashboard.repository.js";

// ─── Hoisted singleton mocks (imported inside the service) ──────────────────

const { mockNotifications, mockLifecycle } = vi.hoisted(() => ({
	mockNotifications: { sendPushToRecipient: vi.fn() },
	mockLifecycle: { cancelOrder: vi.fn() },
}));

vi.mock("../../../notifications/notifications.service.js", () => ({
	notificationsService: mockNotifications,
}));
vi.mock("../../../orders/lifecycle/lifecycle.service.js", () => ({
	lifecycleService: mockLifecycle,
}));

const { AdminDashboardService } = await import(
	"../../admin-dashboard.service.js"
);
const { AppError } = await import("../../../../shared/errors/app-error.js");

// ─── Mock repository (constructor-injected) ─────────────────────────────────

function makeRepo() {
	return {
		// getSummary
		getDashboardKpis: vi.fn(),
		getOrderCreatedDaily: vi.fn(),
		getOrderCompletedDaily: vi.fn(),
		getReviewDaily: vi.fn(),
		getStatusShareCounts: vi.fn(),
		getCategoryShareCounts: vi.fn(),
		getTechOrderStats: vi.fn(),
		getCategories: vi.fn(),
		getTechnicians: vi.fn(),
		getRatingStats: vi.fn(),
		getRecentOrders: vi.fn(),
		// getOrdersSeries
		getAcceptDaily: vi.fn(),
		// verify/reject technician
		setTechnicianStatus: vi.fn(),
		getTechnicianStats: vi.fn(),
		// block homeowner
		getActiveOrders: vi.fn(),
		setBlocked: vi.fn(),
		getHomeownerStats: vi.fn(),
	};
}

type MockRepo = ReturnType<typeof makeRepo>;

// Full TechnicianStatsRow with overridable fields (used by verify re-fetch).
function techStatsRow(
	over: Partial<TechnicianStatsRow> = {},
): TechnicianStatsRow {
	return {
		id: "t1",
		created_at: "2026-01-01T00:00:00Z",
		first_name: "Ali",
		last_name: "Hassan",
		email: "ali@example.com",
		phone: "555",
		is_available: true,
		status: "verified",
		block_pending: false,
		blocked_reason: null,
		blocked_at: null,
		blocked_by: null,
		category_id: "cat-1",
		years_experience: 5,
		criminal_record: null,
		birth_certificate: null,
		national_id: null,
		category_name: "Plumbing",
		city: "Amman",
		rating: 4.8,
		review_count: 50,
		total_orders: 100,
		completed: 95,
		cancelled: 2,
		revenue: 50000,
		report_count: 0,
		...over,
	};
}

// Full HomeownerStatsRow with overridable fields (used by block re-fetch).
function homeownerStatsRow(
	over: Partial<HomeownerStatsRow> = {},
): HomeownerStatsRow {
	return {
		id: "u1",
		created_at: "2026-01-01T00:00:00Z",
		full_name: "John Doe",
		email: "john@example.com",
		phone: "555",
		blocked: false,
		block_pending: false,
		blocked_reason: null,
		blocked_at: null,
		blocked_by: null,
		city: "Amman",
		total_orders: 5,
		completed: 3,
		cancelled: 1,
		spend: 2500,
		last_order_at: "2026-06-17T10:00:00Z",
		review_given_sum: 12,
		review_given_count: 3,
		report_count: 0,
		...over,
	};
}

describe("AdminDashboardService", () => {
	let repo: MockRepo;
	let service: InstanceType<typeof AdminDashboardService>;

	beforeEach(() => {
		repo = makeRepo();
		service = new AdminDashboardService(repo as never);
		mockNotifications.sendPushToRecipient.mockReset();
		mockLifecycle.cancelOrder.mockReset();
	});

	// ── getSummary ────────────────────────────────────────────────────────────
	describe("getSummary", () => {
		it("orchestrates all aggregate repo calls and shapes a DashboardSummary", async () => {
			const today = new Date().toISOString().slice(0, 10);
			repo.getDashboardKpis.mockResolvedValue({
				total_orders: 100,
				active_orders: 5,
				completed_orders: 80,
				revenue_total: 5000,
			});
			repo.getOrderCreatedDaily.mockResolvedValue([
				{ day: today, orders_made: 5 },
			]);
			repo.getOrderCompletedDaily.mockResolvedValue([
				{ day: today, completed: 3, revenue: 1500 },
			]);
			repo.getReviewDaily.mockResolvedValue([
				{ day: today, rating_sum: 9, rating_count: 2 },
			]);
			repo.getStatusShareCounts.mockResolvedValue([
				{ status: "completed", count: 5 },
				{ status: "pending", count: 2 },
			]);
			repo.getCategoryShareCounts.mockResolvedValue([
				{ category_id: "cat-1", count: 10 },
			]);
			repo.getTechOrderStats.mockResolvedValue([
				{ technician_id: "t1", completed_jobs: 3, completed_revenue: 1000 },
			]);
			repo.getCategories.mockResolvedValue([{ id: "cat-1", name: "Plumbing" }]);
			repo.getTechnicians.mockResolvedValue([
				{
					id: "t1",
					first_name: "Ali",
					last_name: "Hassan",
					category_id: "cat-1",
				},
			]);
			repo.getRatingStats.mockResolvedValue(
				new Map([
					[
						"t1",
						{
							technician_id: "t1",
							review_count: 2,
							rating_sum: 9,
							rating: 4.5,
						},
					],
				]),
			);
			repo.getRecentOrders.mockResolvedValue([]);

			const result = await service.getSummary();

			// orchestration: every aggregate source was queried
			expect(repo.getDashboardKpis).toHaveBeenCalled();
			expect(repo.getCategoryShareCounts).toHaveBeenCalled();
			expect(repo.getRecentOrders).toHaveBeenCalledWith(8);

			// shape + private transforms ran (colorForName, pct, status buckets)
			expect(result).toMatchObject({
				kpis: expect.any(Array),
				categoryShare: expect.any(Array),
				statusShare: expect.any(Array),
				recentOrders: expect.any(Array),
				topTechnicians: expect.objectContaining({
					overall: expect.any(Array),
					byCategory: expect.any(Array),
				}),
			});
			expect(result.kpis).toHaveLength(4);
			expect(result.categoryShare[0]).toMatchObject({
				id: "cat-1",
				name: "Plumbing",
				color: expect.stringMatching(/^#/),
				pct: 100,
			});
			expect(result.statusShare).toHaveLength(4);
		});
	});

	// ── getOrdersSeries ─────────────────────────────────────────────────────────
	describe("getOrdersSeries", () => {
		it("returns 30 aligned daily buckets for the 30d range", async () => {
			repo.getOrderCreatedDaily.mockResolvedValue([]);
			repo.getOrderCompletedDaily.mockResolvedValue([]);
			repo.getAcceptDaily.mockResolvedValue([]);

			const result = await service.getOrdersSeries("30d");

			expect(result.days).toHaveLength(30);
			expect(result.ordersMade).toHaveLength(30);
			expect(result.accepted).toHaveLength(30);
			expect(result.completed).toHaveLength(30);
		});

		it("returns 7 buckets for the 7d range", async () => {
			repo.getOrderCreatedDaily.mockResolvedValue([]);
			repo.getOrderCompletedDaily.mockResolvedValue([]);
			repo.getAcceptDaily.mockResolvedValue([]);

			const result = await service.getOrdersSeries("7d");

			expect(result.days).toHaveLength(7);
			expect(result.ordersMade).toHaveLength(7);
		});
	});

	// ── verifyTechnician ─────────────────────────────────────────────────────────
	describe("verifyTechnician", () => {
		it("sets status=verified, fires the approval push, and returns the tech", async () => {
			repo.setTechnicianStatus.mockResolvedValue({ id: "t1" });
			repo.getTechnicianStats.mockResolvedValue([
				techStatsRow({ status: "verified" }),
			]);

			const result = await service.verifyTechnician("t1");

			expect(repo.setTechnicianStatus).toHaveBeenCalledWith("t1", {
				status: "verified",
			});
			expect(mockNotifications.sendPushToRecipient).toHaveBeenCalledWith(
				expect.objectContaining({
					recipientRole: "technician",
					recipientId: "t1",
					type: "technician_verified",
				}),
			);
			expect(result.status).toBe("verified");
		});

		it("throws notFound and skips the push when the tech does not exist", async () => {
			repo.setTechnicianStatus.mockResolvedValue(null);

			await expect(service.verifyTechnician("nope")).rejects.toBeInstanceOf(
				AppError,
			);
			await expect(service.verifyTechnician("nope")).rejects.toMatchObject({
				status: 404,
			});
			expect(mockNotifications.sendPushToRecipient).not.toHaveBeenCalled();
		});
	});

	// ── blockHomeowner ───────────────────────────────────────────────────────────
	describe("blockHomeowner", () => {
		it("defers the block when an in-flight order remains, cancelling pending ones", async () => {
			repo.getActiveOrders.mockResolvedValue([
				{ id: "o1", status: "pending" },
				{ id: "o2", status: "in_progress" }, // in-flight -> defer
			]);
			repo.setBlocked.mockResolvedValue({ id: "u1" });
			repo.getHomeownerStats.mockResolvedValue([
				homeownerStatsRow({ block_pending: true }),
			]);

			const result = await service.blockHomeowner("u1", "Suspicious");

			expect(mockLifecycle.cancelOrder).toHaveBeenCalledTimes(1);
			expect(mockLifecycle.cancelOrder).toHaveBeenCalledWith(
				"o1",
				"u1",
				"user",
				expect.any(String),
			);
			expect(repo.setBlocked).toHaveBeenCalledWith("u1", {
				blocked: false,
				blockPending: true,
				reason: "Suspicious",
				by: "admin@test.local",
			});
			expect(result.id).toBe("u1");
		});

		it("blocks immediately when only pending/accepted orders remain", async () => {
			repo.getActiveOrders.mockResolvedValue([{ id: "o1", status: "pending" }]);
			repo.setBlocked.mockResolvedValue({ id: "u1" });
			repo.getHomeownerStats.mockResolvedValue([
				homeownerStatsRow({ blocked: true }),
			]);

			await service.blockHomeowner("u1", "Spam");

			expect(repo.setBlocked).toHaveBeenCalledWith("u1", {
				blocked: true,
				blockPending: false,
				reason: "Spam",
				by: "admin@test.local",
			});
		});

		it("throws notFound when the homeowner row is missing", async () => {
			repo.getActiveOrders.mockResolvedValue([]);
			repo.setBlocked.mockResolvedValue(null);

			await expect(service.blockHomeowner("ghost", "x")).rejects.toMatchObject({
				status: 404,
			});
		});
	});
});
