import { beforeEach, describe, expect, it, vi } from "vitest";

const { mockNotifications } = vi.hoisted(() => ({
	mockNotifications: { sendPushToRecipient: vi.fn() },
}));

vi.mock("../../../notifications/notifications.service.js", () => ({
	notificationsService: mockNotifications,
}));

const { CustomServicesService } = await import(
	"../../custom-services.service.js"
);

function makeRepo() {
	return {
		submitRequest: vi.fn(),
		listByTechnician: vi.fn(),
		listForAdmin: vi.fn(),
		setStatus: vi.fn(),
		approveAndPublish: vi.fn(),
	};
}

const adminRow = {
	id: "req-1",
	technician_id: "tech-1",
	category_id: "cat-1",
	name: "Drain camera inspection",
	description: "Borescope inspection of blocked drain lines",
	min_price: 100,
	max_price: 300,
	status: "pending" as const,
	reject_reason: null,
	reviewed_by: null,
	reviewed_at: null,
	created_at: "2026-06-13T00:00:00.000Z",
	first_name: "Ali",
	last_name: "Hassan",
	category_name: "Plumbing",
	category_catalog_min: 80,
	category_catalog_max: 500,
};

describe("CustomServicesService", () => {
	let repo: ReturnType<typeof makeRepo>;
	let service: InstanceType<typeof CustomServicesService>;

	beforeEach(() => {
		repo = makeRepo();
		service = new CustomServicesService(repo as never);
		mockNotifications.sendPushToRecipient.mockReset();
		mockNotifications.sendPushToRecipient.mockResolvedValue(undefined);
	});

	it("submits a request, mapping body fields to the repo input", async () => {
		repo.submitRequest.mockResolvedValue({ id: "req-1", status: "pending" });

		await service.submitRequest("tech-1", {
			name: "Drain camera",
			description: "desc",
			min_price: 100,
			max_price: 300,
		});

		expect(repo.submitRequest).toHaveBeenCalledWith({
			technicianId: "tech-1",
			name: "Drain camera",
			description: "desc",
			minPrice: 100,
			maxPrice: 300,
		});
	});

	it("maps the technician_not_verified guard to a 403", async () => {
		repo.submitRequest.mockRejectedValue(new Error("technician_not_verified"));

		await expect(
			service.submitRequest("tech-1", {
				name: "x",
				min_price: 10,
				max_price: 20,
			}),
		).rejects.toMatchObject({ status: 403 });
	});

	it("maps admin rows to DTOs with technician display fields + catalog range", async () => {
		repo.listForAdmin.mockResolvedValue([adminRow]);

		const dtos = await service.listRequests("pending");
		const dto = dtos[0]!;

		expect(dto).toMatchObject({
			id: "req-1",
			technicianName: "Ali Hassan",
			technicianInitials: "AH",
			categoryName: "Plumbing",
			minPrice: 100,
			maxPrice: 300,
			categoryCatalogMin: 80,
			categoryCatalogMax: 500,
			status: "pending",
		});
		expect(dto.color).toMatch(/^#/);
		expect(repo.listForAdmin).toHaveBeenCalledWith("pending");
	});

	it("approves a request via publish, sets reviewer, and fires the approved push", async () => {
		repo.approveAndPublish.mockResolvedValue({
			id: "req-1",
			technician_id: "tech-1",
			status: "approved",
			published_service_id: "svc-1",
		});

		await service.approve("req-1");

		expect(repo.approveAndPublish).toHaveBeenCalledWith(
			"req-1",
			expect.any(String),
		);
		expect(repo.setStatus).not.toHaveBeenCalled();
		expect(mockNotifications.sendPushToRecipient).toHaveBeenCalledWith(
			expect.objectContaining({
				recipientRole: "technician",
				recipientId: "tech-1",
				type: "custom_service_approved",
			}),
		);
	});

	it("throws 404 when approving an unknown request", async () => {
		repo.approveAndPublish.mockRejectedValue(new Error("request_not_found"));
		await expect(service.approve("nope")).rejects.toMatchObject({
			status: 404,
		});
	});

	it("rejects a request, storing the reason and firing the rejected push", async () => {
		repo.setStatus.mockResolvedValue({ id: "req-1", technician_id: "tech-1" });

		await service.reject("req-1", "Out of catalog range");

		expect(repo.setStatus).toHaveBeenCalledWith("req-1", {
			status: "rejected",
			rejectReason: "Out of catalog range",
			reviewedBy: expect.any(String),
		});
		expect(mockNotifications.sendPushToRecipient).toHaveBeenCalledWith(
			expect.objectContaining({ type: "custom_service_rejected" }),
		);
	});
});
