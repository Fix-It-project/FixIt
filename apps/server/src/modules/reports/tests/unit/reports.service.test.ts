import { beforeEach, describe, expect, it, vi } from "vitest";

const { mockNotifications } = vi.hoisted(() => ({
	mockNotifications: { sendPushToRecipient: vi.fn() },
}));

vi.mock("../../../notifications/notifications.service.js", () => ({
	notificationsService: mockNotifications,
}));

const { ReportsService } = await import("../../reports.service.js");

function makeRepo() {
	return {
		submitReport: vi.fn(),
		listForAdmin: vi.fn(),
		countReports: vi.fn(),
		setStatus: vi.fn(),
		markWarned: vi.fn(),
	};
}

const adminRow = {
	id: "rep-1",
	reporter_id: "user-1",
	reporter_role: "user" as const,
	reported_id: "tech-1",
	reported_role: "technician" as const,
	order_id: "order-1",
	label: "no_show" as const,
	summary: "Technician never arrived.",
	status: "open" as const,
	resolution: null,
	resolved_by: null,
	resolved_at: null,
	warned_at: null,
	created_at: "2026-06-13T00:00:00.000Z",
	reporter_name: "Sara Adam",
	reported_name: "Ali Hassan",
	order_service_name: "Drain unblocking",
	order_category_id: "cat-1",
	order_category_name: "Plumbing",
	order_created_at: "2026-06-10T00:00:00.000Z",
};

describe("ReportsService", () => {
	let repo: ReturnType<typeof makeRepo>;
	let service: InstanceType<typeof ReportsService>;

	beforeEach(() => {
		repo = makeRepo();
		service = new ReportsService(repo as never);
		mockNotifications.sendPushToRecipient.mockReset();
		mockNotifications.sendPushToRecipient.mockResolvedValue(undefined);
	});

	it("submits a report, mapping body + caller fields to the repo input", async () => {
		repo.submitReport.mockResolvedValue({ id: "rep-1", status: "open" });

		await service.submit("user-1", "user", {
			orderId: "order-1",
			label: "no_show",
			summary: "Never arrived",
		});

		expect(repo.submitReport).toHaveBeenCalledWith({
			reporterId: "user-1",
			reporterRole: "user",
			orderId: "order-1",
			label: "no_show",
			summary: "Never arrived",
		});
	});

	it("maps the not_order_party guard to a 403", async () => {
		repo.submitReport.mockRejectedValue(new Error("not_order_party"));

		await expect(
			service.submit("user-1", "user", {
				orderId: "order-x",
				label: "no_show",
				summary: "x",
			}),
		).rejects.toMatchObject({ status: 403 });
	});

	it("maps the invalid_label guard to a 400", async () => {
		repo.submitReport.mockRejectedValue(new Error("invalid_label"));

		await expect(
			service.submit("tech-1", "technician", {
				orderId: "order-1",
				label: "overcharged",
				summary: "x",
			}),
		).rejects.toMatchObject({ status: 400 });
	});

	it("maps admin rows to DTOs with both parties' display fields + label text", async () => {
		repo.listForAdmin.mockResolvedValue({ rows: [adminRow], total: 1 });
		repo.countReports.mockResolvedValue({
			open: 1,
			closed: 0,
			all: 1,
			user: 1,
			technician: 0,
		});

		const params = {
			page: 1,
			pageSize: 20,
			status: "open" as const,
			source: "all" as const,
		};
		const result = await service.listReports(params);
		const dto = result.data[0]!;

		expect(result.total).toBe(1);
		expect(result.counts.open).toBe(1);
		expect(dto).toMatchObject({
			id: "rep-1",
			reporterName: "Sara Adam",
			reporterInitials: "SA",
			reportedName: "Ali Hassan",
			reportedInitials: "AH",
			label: "no_show",
			labelText: "No-show",
			orderCategoryName: "Plumbing",
			status: "open",
		});
		expect(dto.reporterColor).toMatch(/^#/);
		expect(dto.reportedColor).toMatch(/^#/);
		expect(repo.listForAdmin).toHaveBeenCalledWith(params);
		expect(repo.countReports).toHaveBeenCalledWith("open");
	});

	it("resolves a report, closing it and pushing the reporter", async () => {
		repo.setStatus.mockResolvedValue({
			id: "rep-1",
			reporter_id: "user-1",
			reporter_role: "user",
		});

		await service.resolve("rep-1");

		expect(repo.setStatus).toHaveBeenCalledWith("rep-1", {
			status: "closed",
			resolution: "resolved",
			resolvedBy: expect.any(String),
		});
		expect(mockNotifications.sendPushToRecipient).toHaveBeenCalledWith(
			expect.objectContaining({
				recipientRole: "user",
				recipientId: "user-1",
				type: "report_reviewed",
			}),
		);
	});

	it("throws 404 when resolving an unknown report", async () => {
		repo.setStatus.mockResolvedValue(null);
		await expect(service.resolve("nope")).rejects.toMatchObject({
			status: 404,
		});
	});

	it("dismisses a report, closing it with the dismissed resolution", async () => {
		repo.setStatus.mockResolvedValue({
			id: "rep-1",
			reporter_id: "user-1",
			reporter_role: "user",
		});

		await service.dismiss("rep-1");

		expect(repo.setStatus).toHaveBeenCalledWith("rep-1", {
			status: "closed",
			resolution: "dismissed",
			resolvedBy: expect.any(String),
		});
	});

	it("reopens a closed report, clearing the resolution", async () => {
		repo.setStatus.mockResolvedValue({ id: "rep-1", status: "open" });

		await service.reopen("rep-1");

		expect(repo.setStatus).toHaveBeenCalledWith("rep-1", {
			status: "open",
			resolution: null,
			resolvedBy: null,
		});
	});

	it("throws 404 when reopening an unknown report", async () => {
		repo.setStatus.mockResolvedValue(null);
		await expect(service.reopen("nope")).rejects.toMatchObject({
			status: 404,
		});
	});

	it("warns the reported party, stamping warned_at and pushing them", async () => {
		repo.markWarned.mockResolvedValue({
			id: "rep-1",
			reported_id: "tech-1",
			reported_role: "technician",
		});

		await service.warn("rep-1");

		expect(repo.markWarned).toHaveBeenCalledWith("rep-1");
		expect(mockNotifications.sendPushToRecipient).toHaveBeenCalledWith(
			expect.objectContaining({
				recipientRole: "technician",
				recipientId: "tech-1",
				type: "report_warning",
			}),
		);
	});
});
