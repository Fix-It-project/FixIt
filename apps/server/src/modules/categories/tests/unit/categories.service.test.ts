import { beforeEach, describe, expect, it, vi } from "vitest";

const { CategoriesService } = await import("../../categories.service.js");

function makeRepo() {
	return {
		getAllCategories: vi.fn(),
		getCategoryById: vi.fn(),
	};
}

describe("CategoriesService", () => {
	let repo: ReturnType<typeof makeRepo>;
	let service: InstanceType<typeof CategoriesService>;

	beforeEach(() => {
		repo = makeRepo();
		service = new CategoriesService(repo as never);
	});

	it("getAllCategories delegates to the repository", async () => {
		const rows = [{ id: "c1", name: "Plumbing", created_at: "2026-01-01" }];
		repo.getAllCategories.mockResolvedValue(rows);

		const result = await service.getAllCategories();

		expect(repo.getAllCategories).toHaveBeenCalled();
		expect(result).toBe(rows);
	});

	it("getCategoryById returns the category when found", async () => {
		const row = { id: "c1", name: "Plumbing", created_at: "2026-01-01" };
		repo.getCategoryById.mockResolvedValue(row);

		const result = await service.getCategoryById("c1");

		expect(repo.getCategoryById).toHaveBeenCalledWith("c1");
		expect(result).toBe(row);
	});

	it("getCategoryById throws 404 when the category is missing", async () => {
		repo.getCategoryById.mockResolvedValue(null);

		await expect(service.getCategoryById("nope")).rejects.toMatchObject({
			status: 404,
		});
	});
});
