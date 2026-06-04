import { beforeEach, describe, expect, it, vi } from "vitest";

// ── Mock objects ─────────────────────────────────────────────────────────────
// TechniciansService receives its dependencies via constructor DI, so we pass
// plain mock objects — no vi.mock module-hoisting needed.

const makeRepo = () =>
	({
		getTechniciansByCategory: vi.fn(),
		searchTechniciansByCategory: vi.fn(),
		getTechnicianProfile: vi.fn(),
		getReviewAggregatesByTechnicianIds: vi.fn(),
		listTopRatedTechnicians: vi.fn(),
		getTechnicianSelf: vi.fn(),
		updateTechnicianSelf: vi.fn(),
		updateProfileImage: vi.fn(),
	}) as any;

const makeCategoriesRepo = () =>
	({
		getCategoryById: vi.fn(),
		getAllCategories: vi.fn(),
		createCategory: vi.fn(),
		deleteCategory: vi.fn(),
	}) as any;

const makeStorageRepo = () =>
	({
		uploadFile: vi.fn(),
	}) as any;

// ── Shared fixtures ───────────────────────────────────────────────────────────
const categoryId = "cat-1";

// Minimal TechnicianWithAddressRow-compatible rows
const baseRow = (id: string, firstName: string) => ({
	id,
	first_name: firstName,
	last_name: id.toUpperCase(),
	email: `${id}@test.com`,
	phone: null,
	is_available: true,
	category_id: categoryId,
	addresses: [],
});

const rowA = {
	...baseRow("tech-A", "Ahmed"),
	avg_rating: 5.0,
	review_count: 1,
};
const rowB = {
	...baseRow("tech-B", "Bilal"),
	avg_rating: 4.7,
	review_count: 200,
};
const rowC = {
	...baseRow("tech-C", "Carol"),
	avg_rating: 5.0,
	review_count: 0,
};

// ── Test suite ────────────────────────────────────────────────────────────────
describe("TechniciansService.getTechniciansByCategory", () => {
	let repo: ReturnType<typeof makeRepo>;
	let categoriesRepo: ReturnType<typeof makeCategoriesRepo>;
	let storageRepo: ReturnType<typeof makeStorageRepo>;
	let service: import("../../technicians.service.js").TechniciansService;

	beforeEach(async () => {
		vi.clearAllMocks();

		repo = makeRepo();
		categoriesRepo = makeCategoriesRepo();
		storageRepo = makeStorageRepo();

		categoriesRepo.getCategoryById.mockResolvedValue({
			id: categoryId,
			name: "plumbing",
		});
		repo.getTechniciansByCategory.mockResolvedValue([rowA, rowB, rowC]);

		const { TechniciansService } = await import("../../technicians.service.js");
		service = new TechniciansService(
			repo as any,
			categoriesRepo as any,
			storageRepo as any,
		);
	});

	describe("sort=top_rated", () => {
		it("delegates ranking to listTopRatedTechnicians and preserves the RPC order", async () => {
			// RPC returns DB-ranked order: B (high-volume) > A (single 5★) > C (no reviews).
			repo.listTopRatedTechnicians.mockResolvedValue([rowB, rowA, rowC]);

			const result = await service.getTechniciansByCategory(categoryId, {
				sort: "top_rated",
			});

			expect(result.map((t) => t.id)).toEqual(["tech-B", "tech-A", "tech-C"]);
			expect(repo.listTopRatedTechnicians).toHaveBeenCalledTimes(1);
			expect(repo.listTopRatedTechnicians).toHaveBeenCalledWith({ categoryId });
		});

		it("does NOT call the non-RPC list path when sort=top_rated", async () => {
			repo.listTopRatedTechnicians.mockResolvedValue([rowB, rowA, rowC]);

			await service.getTechniciansByCategory(categoryId, { sort: "top_rated" });

			expect(repo.getTechniciansByCategory).not.toHaveBeenCalled();
		});

		it("forwards pagination to the top-rated RPC path", async () => {
			repo.listTopRatedTechnicians.mockResolvedValue([rowB]);

			await service.getTechniciansByCategory(categoryId, {
				sort: "top_rated",
				limit: 20,
				offset: 40,
			});

			expect(repo.listTopRatedTechnicians).toHaveBeenCalledWith({
				categoryId,
				limit: 20,
				offset: 40,
			});
		});

		it("hydrates avg_rating and review_count on every returned DTO", async () => {
			repo.listTopRatedTechnicians.mockResolvedValue([rowB, rowA, rowC]);

			const result = await service.getTechniciansByCategory(categoryId, {
				sort: "top_rated",
			});

			for (const dto of result) {
				expect(dto).toHaveProperty("avg_rating");
				expect(dto).toHaveProperty("review_count");
			}
			const c = result.find((t) => t.id === "tech-C")!;
			expect(c.avg_rating).toBe(5);
			expect(c.review_count).toBe(0);
		});
	});

	describe("default sort (no sort param)", () => {
		it("preserves the repository ordering (A, B, C) unchanged", async () => {
			const result = await service.getTechniciansByCategory(categoryId);
			const ids = result.map((t) => t.id);
			expect(ids).toEqual(["tech-A", "tech-B", "tech-C"]);
		});

		it("can include distance without changing default ordering", async () => {
			repo.getTechniciansByCategory.mockResolvedValue([
				{
					...rowA,
					addresses: [
						{
							city: "Far",
							street: "A",
							latitude: 30.1,
							longitude: 31.1,
							is_active: true,
						},
					],
				},
				{
					...rowB,
					addresses: [
						{
							city: "Near",
							street: "B",
							latitude: 30.01,
							longitude: 31.01,
							is_active: true,
						},
					],
				},
			]);

			const result = await service.getTechniciansByCategory(categoryId, {
				lat: 30,
				lng: 31,
			});

			expect(result.map((t) => t.id)).toEqual(["tech-A", "tech-B"]);
			expect(result[0]?.distance_km).not.toBeNull();
			expect(result[1]?.distance_km).not.toBeNull();
		});

		it("does NOT call listTopRatedTechnicians on the default path", async () => {
			await service.getTechniciansByCategory(categoryId);
			expect(repo.listTopRatedTechnicians).not.toHaveBeenCalled();
		});
	});

	describe("sort=most_reviews", () => {
		it("orders by review_count desc, then avg_rating desc, then name", async () => {
			const rowD = {
				...baseRow("tech-D", "Dina"),
				avg_rating: 4.9,
				review_count: 1,
			};
			repo.getTechniciansByCategory.mockResolvedValue([rowA, rowB, rowC, rowD]);

			const result = await service.getTechniciansByCategory(categoryId, {
				sort: "most_reviews",
			});

			expect(result.map((t) => t.id)).toEqual([
				"tech-B",
				"tech-A",
				"tech-D",
				"tech-C",
			]);
		});

		it("applies offset pagination after the local most_reviews sort", async () => {
			const rowD = {
				...baseRow("tech-D", "Dina"),
				avg_rating: 4.9,
				review_count: 1,
			};
			repo.getTechniciansByCategory.mockResolvedValue([rowA, rowB, rowC, rowD]);

			const result = await service.getTechniciansByCategory(categoryId, {
				sort: "most_reviews",
				limit: 2,
				offset: 1,
			});

			expect(result.map((t) => t.id)).toEqual(["tech-A", "tech-D"]);
		});

		it("does NOT call listTopRatedTechnicians for most_reviews", async () => {
			await service.getTechniciansByCategory(categoryId, {
				sort: "most_reviews",
			});
			expect(repo.listTopRatedTechnicians).not.toHaveBeenCalled();
		});
	});

	describe("nearest sort via coordinates", () => {
		it("orders by distance when sort=nearest and lat/lng are provided", async () => {
			repo.getTechniciansByCategory.mockResolvedValue([
				{
					...rowA,
					addresses: [
						{
							city: "Far",
							street: "A",
							latitude: 30.1,
							longitude: 31.1,
							is_active: true,
						},
					],
				},
				{
					...rowB,
					addresses: [
						{
							city: "Near",
							street: "B",
							latitude: 30.01,
							longitude: 31.01,
							is_active: true,
						},
					],
				},
				{
					...rowC,
					addresses: [],
				},
			]);

			const result = await service.getTechniciansByCategory(categoryId, {
				lat: 30,
				lng: 31,
				sort: "nearest",
			});

			expect(result.map((t) => t.id)).toEqual(["tech-B", "tech-A", "tech-C"]);
			const [near, , missingDistance] = result;
			expect(near?.distance_km).not.toBeNull();
			expect(missingDistance?.distance_km).toBeNull();
		});
	});
});

describe("TechniciansService.searchTechniciansByCategory", () => {
	let repo: ReturnType<typeof makeRepo>;
	let categoriesRepo: ReturnType<typeof makeCategoriesRepo>;
	let storageRepo: ReturnType<typeof makeStorageRepo>;
	let service: import("../../technicians.service.js").TechniciansService;

	beforeEach(async () => {
		vi.clearAllMocks();

		repo = makeRepo();
		categoriesRepo = makeCategoriesRepo();
		storageRepo = makeStorageRepo();

		categoriesRepo.getCategoryById.mockResolvedValue({
			id: categoryId,
			name: "plumbing",
		});

		const { TechniciansService } = await import("../../technicians.service.js");
		service = new TechniciansService(
			repo as any,
			categoriesRepo as any,
			storageRepo as any,
		);
	});

	it("top_rated forwards the search query to listTopRatedTechnicians and skips the JS sort", async () => {
		repo.listTopRatedTechnicians.mockResolvedValue([rowB, rowA]);

		const result = await service.searchTechniciansByCategory(categoryId, "ah", {
			sort: "top_rated",
		});

		expect(result.map((t) => t.id)).toEqual(["tech-B", "tech-A"]);
		expect(repo.listTopRatedTechnicians).toHaveBeenCalledWith({
			categoryId,
			searchQuery: "ah",
		});
		expect(repo.searchTechniciansByCategory).not.toHaveBeenCalled();
	});

	it("non-top_rated search uses the regular search path", async () => {
		repo.searchTechniciansByCategory.mockResolvedValue([rowA, rowB]);

		const result = await service.searchTechniciansByCategory(categoryId, "a");

		expect(result.map((t) => t.id)).toEqual(["tech-A", "tech-B"]);
		expect(repo.searchTechniciansByCategory).toHaveBeenCalledWith(
			categoryId,
			"a",
		);
		expect(repo.listTopRatedTechnicians).not.toHaveBeenCalled();
	});
});
