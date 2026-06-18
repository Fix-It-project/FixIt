import { beforeEach, describe, expect, it, vi } from "vitest";

const { mockRepo, mockStats } = vi.hoisted(() => ({
	mockRepo: {
		getProfileWithAddresses: vi.fn(),
		updateAuthEmail: vi.fn(),
		updateUserProfile: vi.fn(),
	},
	mockStats: { getUserStats: vi.fn() },
}));

vi.mock("../../user-auth.repository.js", () => ({
	usersRepository: mockRepo,
}));
vi.mock("../../users-stats.repository.js", () => ({
	usersStatsRepository: mockStats,
}));

const { UsersService } = await import("../../users.service.js");

describe("UsersService", () => {
	let service: InstanceType<typeof UsersService>;

	beforeEach(() => {
		service = new UsersService();
		for (const fn of Object.values(mockRepo)) fn.mockReset();
		mockStats.getUserStats.mockReset();
	});

	it("getProfile delegates to getProfileWithAddresses", async () => {
		const profile = { id: "u1", addresses: [] };
		mockRepo.getProfileWithAddresses.mockResolvedValue(profile);

		const result = await service.getProfile("u1");

		expect(mockRepo.getProfileWithAddresses).toHaveBeenCalledWith("u1");
		expect(result).toBe(profile);
	});

	it("updateProfile syncs the auth email first when email changes", async () => {
		const fresh = { id: "u1", email: "new@example.com" };
		mockRepo.getProfileWithAddresses.mockResolvedValue(fresh);

		const data = { full_name: "Jane", email: "new@example.com" };
		const result = await service.updateProfile("u1", data);

		expect(mockRepo.updateAuthEmail).toHaveBeenCalledWith(
			"u1",
			"new@example.com",
		);
		expect(mockRepo.updateUserProfile).toHaveBeenCalledWith("u1", data);
		expect(result).toBe(fresh);
	});

	it("updateProfile skips the auth-email sync when no email is given", async () => {
		mockRepo.getProfileWithAddresses.mockResolvedValue({ id: "u1" });

		await service.updateProfile("u1", { phone: "555" });

		expect(mockRepo.updateAuthEmail).not.toHaveBeenCalled();
		expect(mockRepo.updateUserProfile).toHaveBeenCalledWith("u1", {
			phone: "555",
		});
	});

	it("getStats delegates to the stats repository", async () => {
		const stats = { totalBookings: 5, completedBookings: 3 };
		mockStats.getUserStats.mockResolvedValue(stats);

		const result = await service.getStats("u1");

		expect(mockStats.getUserStats).toHaveBeenCalledWith("u1");
		expect(result).toBe(stats);
	});
});
