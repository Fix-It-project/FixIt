import { beforeEach, describe, expect, it, vi } from "vitest";

// TechniciansService takes its deps via constructor DI — pass plain mock objects.
const makeRepo = () =>
	({
		getTechnicianSelf: vi.fn(),
		updateTechnicianSelf: vi.fn(),
		completeScheduleSetup: vi.fn(),
		getServicesForTechnician: vi.fn(),
	}) as any;

const makeCategoriesRepo = () => ({ getCategoryById: vi.fn() }) as any;
const makeStorageRepo = () => ({ uploadFile: vi.fn() }) as any;
const makeStatsRepo = () => ({}) as any;

const { TechniciansService } = await import("../../technicians.service.js");

const technicianId = "tech-1";

function selfProfile(over: Record<string, unknown> = {}) {
	return {
		id: technicianId,
		first_name: "Ali",
		last_name: "Hassan",
		email: "ali@example.com",
		phone: "555",
		profile_image: null,
		description: "Plumber",
		category_name: "Plumbing",
		is_available: true,
		total_orders: 10,
		completed_orders: 8,
		avg_rating: 4.5,
		review_count: 6,
		schedule_setup_completed_at: null,
		...over,
	};
}

describe("TechniciansService self-profile", () => {
	let repo: ReturnType<typeof makeRepo>;
	let service: InstanceType<typeof TechniciansService>;

	beforeEach(() => {
		repo = makeRepo();
		service = new TechniciansService(
			repo,
			makeCategoriesRepo(),
			makeStorageRepo(),
			makeStatsRepo(),
		);
	});

	describe("getSelf", () => {
		it("returns the technician's own profile", async () => {
			const profile = selfProfile();
			repo.getTechnicianSelf.mockResolvedValue(profile);

			const result = await service.getSelf(technicianId);

			expect(repo.getTechnicianSelf).toHaveBeenCalledWith(technicianId);
			expect(result).toBe(profile);
		});

		it("throws 404 when the technician does not exist", async () => {
			repo.getTechnicianSelf.mockResolvedValue(null);

			await expect(service.getSelf("ghost")).rejects.toMatchObject({
				status: 404,
			});
		});
	});

	describe("updateSelf", () => {
		it("writes the fields then refetches the fresh profile", async () => {
			const fresh = selfProfile({ description: "Senior plumber" });
			repo.updateTechnicianSelf.mockResolvedValue(undefined);
			repo.getTechnicianSelf.mockResolvedValue(fresh);

			const data = { description: "Senior plumber" };
			const result = await service.updateSelf(technicianId, data);

			expect(repo.updateTechnicianSelf).toHaveBeenCalledWith(
				technicianId,
				data,
			);
			expect(repo.getTechnicianSelf).toHaveBeenCalledWith(technicianId);
			expect(result).toBe(fresh);
		});
	});

	describe("completeScheduleSetup", () => {
		it("marks setup complete then refetches the profile", async () => {
			const fresh = selfProfile({
				schedule_setup_completed_at: "2026-06-18T00:00:00Z",
			});
			repo.completeScheduleSetup.mockResolvedValue(undefined);
			repo.getTechnicianSelf.mockResolvedValue(fresh);

			const result = await service.completeScheduleSetup(technicianId);

			expect(repo.completeScheduleSetup).toHaveBeenCalledWith(technicianId);
			expect(result).toBe(fresh);
		});
	});

	describe("getTechnicianServices", () => {
		it("delegates to the repository", async () => {
			const services = [{ id: "svc-1", name: "Drain unblock" }];
			repo.getServicesForTechnician.mockResolvedValue(services);

			const result = await service.getTechnicianServices(technicianId);

			expect(repo.getServicesForTechnician).toHaveBeenCalledWith(technicianId);
			expect(result).toBe(services);
		});
	});
});
