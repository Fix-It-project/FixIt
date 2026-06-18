import { beforeEach, describe, expect, it, vi } from "vitest";
import {
	createMockReq,
	createMockRes,
} from "../../../../../tests/mocks/express.mock.js";

const { mockService } = vi.hoisted(() => ({
	mockService: { getServicesByCategoryId: vi.fn(), getServiceById: vi.fn() },
}));

vi.mock("../../services.service.js", () => ({
	servicesService: mockService,
}));

const { servicesController } = await import("../../services.controller.js");

describe("ServicesController", () => {
	beforeEach(() => {
		for (const m of Object.values(mockService)) m.mockReset();
	});

	it("getByCategoryId passes categoryId and returns 200 { services }", async () => {
		const services = [{ id: "s1", name: "Drain unblock" }];
		mockService.getServicesByCategoryId.mockResolvedValue(services);

		const req = createMockReq({ params: { categoryId: "c1" } } as never) as any;
		const res = createMockRes();
		await servicesController.getByCategoryId(req, res);

		expect(mockService.getServicesByCategoryId).toHaveBeenCalledWith("c1");
		expect(res.statusCode).toBe(200);
		expect(res.body).toEqual({ services });
	});

	it("getById passes serviceId and returns 200 { service }", async () => {
		const service = { id: "s1", name: "Drain unblock" };
		mockService.getServiceById.mockResolvedValue(service);

		const req = createMockReq({ params: { serviceId: "s1" } } as never) as any;
		const res = createMockRes();
		await servicesController.getById(req, res);

		expect(mockService.getServiceById).toHaveBeenCalledWith("s1");
		expect(res.statusCode).toBe(200);
		expect(res.body).toEqual({ service });
	});
});
