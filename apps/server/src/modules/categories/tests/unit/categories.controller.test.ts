import { beforeEach, describe, expect, it, vi } from "vitest";
import {
	createMockReq,
	createMockRes,
} from "../../../../../tests/mocks/express.mock.js";

const { mockService } = vi.hoisted(() => ({
	mockService: { getAllCategories: vi.fn(), getCategoryById: vi.fn() },
}));

vi.mock("../../categories.service.js", () => ({
	categoriesService: mockService,
}));

const { categoriesController } = await import("../../categories.controller.js");

describe("CategoriesController", () => {
	beforeEach(() => {
		for (const m of Object.values(mockService)) m.mockReset();
	});

	it("getAll returns 200 { categories }", async () => {
		const categories = [{ id: "c1", name: "Plumbing" }];
		mockService.getAllCategories.mockResolvedValue(categories);

		const req = createMockReq() as any;
		const res = createMockRes();
		await categoriesController.getAll(req, res);

		expect(mockService.getAllCategories).toHaveBeenCalled();
		expect(res.statusCode).toBe(200);
		expect(res.body).toEqual({ categories });
	});

	it("getById passes the route id and returns 200 { category }", async () => {
		const category = { id: "c1", name: "Plumbing" };
		mockService.getCategoryById.mockResolvedValue(category);

		const req = createMockReq({ params: { id: "c1" } } as never) as any;
		const res = createMockRes();
		await categoriesController.getById(req, res);

		expect(mockService.getCategoryById).toHaveBeenCalledWith("c1");
		expect(res.statusCode).toBe(200);
		expect(res.body).toEqual({ category });
	});
});
