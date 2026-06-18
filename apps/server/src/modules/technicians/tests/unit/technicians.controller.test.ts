import { beforeEach, describe, expect, it, vi } from "vitest";
import {
	createMockReq,
	createMockRes,
} from "../../../../../tests/mocks/express.mock.js";

// The controller builds its service inline from these repo singletons at import
// time, so mock the repo modules (not a service singleton).
const { mockRepo } = vi.hoisted(() => ({
	mockRepo: {
		getTechnicianSelf: vi.fn(),
		updateTechnicianSelf: vi.fn(),
		getServicesForTechnician: vi.fn(),
		getTechniciansByCategory: vi.fn(),
		searchTechniciansByCategory: vi.fn(),
		getTechnicianProfile: vi.fn(),
		getReviewAggregatesByTechnicianIds: vi.fn(),
		getTechnicianIdsWithActiveAvailability: vi.fn(),
		listTopRatedTechnicians: vi.fn(),
		completeScheduleSetup: vi.fn(),
		updateProfileImage: vi.fn(),
	},
}));

vi.mock("../../technicians.repository.js", () => ({
	techniciansRepository: mockRepo,
}));
vi.mock("../../technicians-stats.repository.js", () => ({
	techniciansStatsRepository: {},
}));
vi.mock("../../../categories/categories.repository.js", () => ({
	categoriesRepository: { getCategoryById: vi.fn() },
}));
vi.mock("../../../../shared/storage/storage.repository.js", () => ({
	storageRepository: { uploadFile: vi.fn() },
}));

const { techniciansController } = await import(
	"../../technicians.controller.js"
);

async function runHandler(
	handler: (req: any, res: any, next: any) => void,
	req: any,
	res: any,
): Promise<{ next: ReturnType<typeof vi.fn> }> {
	const next = vi.fn();
	handler(req, res, next);
	await new Promise((resolve) => setImmediate(resolve));
	return { next };
}

function mockReq(overrides: Record<string, unknown> = {}) {
	const req = createMockReq(overrides as never) as any;
	req.log = { info: vi.fn(), warn: vi.fn(), error: vi.fn(), debug: vi.fn() };
	return req;
}

describe("TechniciansController", () => {
	beforeEach(() => {
		for (const fn of Object.values(mockRepo)) fn.mockReset();
	});

	describe("getSelf", () => {
		it("returns the authed technician's profile as { profile }", async () => {
			const profile = { id: "tech-1", first_name: "Ali" };
			mockRepo.getTechnicianSelf.mockResolvedValue(profile);

			const req = mockReq({ technician: { id: "tech-1" } } as never);
			const res = createMockRes();
			await runHandler(techniciansController.getSelf, req, res);

			expect(mockRepo.getTechnicianSelf).toHaveBeenCalledWith("tech-1");
			expect(res.body).toEqual({ profile });
		});

		it("forwards a 401 via next() when not authenticated", async () => {
			const req = mockReq(); // no req.technician
			const res = createMockRes();
			const { next } = await runHandler(
				techniciansController.getSelf,
				req,
				res,
			);

			expect(next).toHaveBeenCalledTimes(1);
			expect(next.mock.calls[0]?.[0]).toMatchObject({ status: 401 });
			expect(mockRepo.getTechnicianSelf).not.toHaveBeenCalled();
		});
	});

	describe("updateSelf", () => {
		it("writes the body fields then returns the refetched profile", async () => {
			mockRepo.updateTechnicianSelf.mockResolvedValue(undefined);
			const fresh = { id: "tech-1", description: "Senior plumber" };
			mockRepo.getTechnicianSelf.mockResolvedValue(fresh);

			const req = mockReq({
				technician: { id: "tech-1" },
				body: { description: "Senior plumber" },
			} as never);
			const res = createMockRes();
			await runHandler(techniciansController.updateSelf, req, res);

			expect(mockRepo.updateTechnicianSelf).toHaveBeenCalledWith("tech-1", {
				first_name: undefined,
				last_name: undefined,
				phone: undefined,
				description: "Senior plumber",
			});
			expect(res.body).toEqual({ profile: fresh });
		});
	});

	describe("getServices", () => {
		it("returns the technician's services as { services }", async () => {
			const services = [{ id: "svc-1" }];
			mockRepo.getServicesForTechnician.mockResolvedValue(services);

			const req = mockReq({ params: { id: "tech-1" } } as never);
			const res = createMockRes();
			await runHandler(techniciansController.getServices, req, res);

			expect(mockRepo.getServicesForTechnician).toHaveBeenCalledWith("tech-1");
			expect(res.body).toEqual({ services });
		});
	});
});
