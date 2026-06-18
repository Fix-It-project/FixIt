import { beforeEach, describe, expect, it, vi } from "vitest";

const { mockRepo, mockOrders } = vi.hoisted(() => ({
	mockRepo: {
		getEntriesByTechnicianId: vi.fn(),
		getBookedSlots: vi.fn(),
		getEntryById: vi.fn(),
		createEntry: vi.fn(),
		updateEntry: vi.fn(),
		deleteEntry: vi.fn(),
		getTemplatesByTechnicianId: vi.fn(),
		getTemplateById: vi.fn(),
		upsertTemplate: vi.fn(),
		updateTemplate: vi.fn(),
		deleteTemplate: vi.fn(),
	},
	mockOrders: { getActiveOrdersCountForDate: vi.fn() },
}));

vi.mock("../../technician-calendar.repository.js", () => ({
	technicianCalendarRepository: mockRepo,
}));
vi.mock("../../../orders/orders.repository.js", () => ({
	ordersRepository: mockOrders,
}));

const { TechnicianCalendarService } = await import(
	"../../technician-calendar.service.js"
);

const FUTURE = "2099-01-01";
const PAST = "2000-01-01";

describe("TechnicianCalendarService", () => {
	let service: InstanceType<typeof TechnicianCalendarService>;

	beforeEach(() => {
		service = new TechnicianCalendarService();
		for (const fn of Object.values(mockRepo)) fn.mockReset();
		mockOrders.getActiveOrdersCountForDate.mockReset();
	});

	describe("getCalendar", () => {
		it("normalizes the range and delegates to the repository", async () => {
			const rows = [{ id: "e1", technician_id: "t1", date: "2099-01-01" }];
			mockRepo.getEntriesByTechnicianId.mockResolvedValue(rows);

			const result = await service.getCalendar("t1", {
				from: FUTURE,
				to: FUTURE,
			});

			expect(mockRepo.getEntriesByTechnicianId).toHaveBeenCalledWith("t1", {
				from: FUTURE,
				to: FUTURE,
			});
			expect(result).toBe(rows);
		});
	});

	describe("getEntry", () => {
		it("returns the entry when found", async () => {
			const entry = { id: "e1" };
			mockRepo.getEntryById.mockResolvedValue(entry);

			expect(await service.getEntry("e1")).toBe(entry);
		});

		it("throws 404 when the entry is missing", async () => {
			mockRepo.getEntryById.mockResolvedValue(null);
			await expect(service.getEntry("nope")).rejects.toMatchObject({
				status: 404,
			});
		});
	});

	describe("createEntry", () => {
		it("creates a holiday when the date is free of conflicts", async () => {
			mockRepo.getEntriesByTechnicianId.mockResolvedValue([]);
			mockOrders.getActiveOrdersCountForDate.mockResolvedValue(0);
			mockRepo.createEntry.mockResolvedValue({ id: "e1", date: FUTURE });

			await service.createEntry({ technician_id: "t1", date: FUTURE });

			expect(mockRepo.createEntry).toHaveBeenCalledWith({
				technician_id: "t1",
				date: FUTURE,
			});
		});

		it("rejects a past date with 400 and never touches the repo", async () => {
			await expect(
				service.createEntry({ technician_id: "t1", date: PAST }),
			).rejects.toMatchObject({ status: 400 });
			expect(mockRepo.createEntry).not.toHaveBeenCalled();
		});

		it("rejects with 409 when an exception already exists for the day", async () => {
			mockRepo.getEntriesByTechnicianId.mockResolvedValue([{ id: "other" }]);

			await expect(
				service.createEntry({ technician_id: "t1", date: FUTURE }),
			).rejects.toMatchObject({ status: 409 });
			expect(mockRepo.createEntry).not.toHaveBeenCalled();
		});

		it("rejects with 409 when there are active bookings on the day", async () => {
			mockRepo.getEntriesByTechnicianId.mockResolvedValue([]);
			mockOrders.getActiveOrdersCountForDate.mockResolvedValue(2);

			await expect(
				service.createEntry({ technician_id: "t1", date: FUTURE }),
			).rejects.toMatchObject({ status: 409 });
			expect(mockRepo.createEntry).not.toHaveBeenCalled();
		});
	});

	describe("createTemplate", () => {
		it("rejects an invalid slot_hour with 400", async () => {
			await expect(
				service.createTemplate({
					technician_id: "t1",
					day_of_week: 1,
					slot_hour: 9,
				}),
			).rejects.toMatchObject({ status: 400 });
			expect(mockRepo.upsertTemplate).not.toHaveBeenCalled();
		});

		it("defaults slot_hour to 8 and upserts the template", async () => {
			mockRepo.upsertTemplate.mockResolvedValue({ id: "tpl-1" });

			await service.createTemplate({ technician_id: "t1", day_of_week: 1 });

			expect(mockRepo.upsertTemplate).toHaveBeenCalledWith({
				technician_id: "t1",
				day_of_week: 1,
				slot_hour: 8,
				active: undefined,
			});
		});
	});

	describe("deleteTemplate", () => {
		it("throws 404 when the template is missing", async () => {
			mockRepo.getTemplateById.mockResolvedValue(null);
			await expect(service.deleteTemplate("nope")).rejects.toMatchObject({
				status: 404,
			});
			expect(mockRepo.deleteTemplate).not.toHaveBeenCalled();
		});
	});
});
