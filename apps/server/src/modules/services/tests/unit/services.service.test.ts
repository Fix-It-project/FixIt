import { beforeEach, describe, expect, it, vi } from "vitest";

const { ServicesService } = await import("../../services.service.js");

function makeServicesRepo() {
	return {
		getServicesByCategoryId: vi.fn(),
		getServiceById: vi.fn(),
	};
}

function makeCategoriesRepo() {
	return {
		getAllCategories: vi.fn(),
		getCategoryById: vi.fn(),
	};
}

describe("ServicesService", () => {
	let repo: ReturnType<typeof makeServicesRepo>;
	let categoriesRepo: ReturnType<typeof makeCategoriesRepo>;
	let service: InstanceType<typeof ServicesService>;

	beforeEach(() => {
		repo = makeServicesRepo();
		categoriesRepo = makeCategoriesRepo();
		service = new ServicesService(repo as never, categoriesRepo as never);
	});

	describe("getServicesByCategoryId", () => {
		it("returns the services after the category is validated", async () => {
			categoriesRepo.getCategoryById.mockResolvedValue({ id: "c1" });
			const rows = [{ id: "s1", name: "Drain unblock", category_id: "c1" }];
			repo.getServicesByCategoryId.mockResolvedValue(rows);

			const result = await service.getServicesByCategoryId("c1");

			expect(categoriesRepo.getCategoryById).toHaveBeenCalledWith("c1");
			expect(repo.getServicesByCategoryId).toHaveBeenCalledWith("c1");
			expect(result).toBe(rows);
		});

		it("throws 404 and skips the services query when the category is missing", async () => {
			categoriesRepo.getCategoryById.mockResolvedValue(null);

			await expect(
				service.getServicesByCategoryId("nope"),
			).rejects.toMatchObject({ status: 404 });
			expect(repo.getServicesByCategoryId).not.toHaveBeenCalled();
		});
	});

	describe("getServiceById", () => {
		it("returns the service when found", async () => {
			const row = { id: "s1", name: "Drain unblock", category_id: "c1" };
			repo.getServiceById.mockResolvedValue(row);

			const result = await service.getServiceById("s1");

			expect(repo.getServiceById).toHaveBeenCalledWith("s1");
			expect(result).toBe(row);
		});

		it("throws 404 when the service is missing", async () => {
			repo.getServiceById.mockResolvedValue(null);

			await expect(service.getServiceById("nope")).rejects.toMatchObject({
				status: 404,
			});
		});
	});
});
