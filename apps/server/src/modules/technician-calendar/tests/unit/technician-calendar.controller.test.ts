import { beforeEach, describe, expect, it, vi } from "vitest";
import {
	createMockReq,
	createMockRes,
	type MockResponse,
} from "../../../../../tests/mocks/express.mock.js";

const { mockService } = vi.hoisted(() => ({
	mockService: {
		getCalendar: vi.fn(),
		getEntry: vi.fn(),
		createEntry: vi.fn(),
		updateEntry: vi.fn(),
		deleteEntry: vi.fn(),
		getTemplates: vi.fn(),
		getBookedSlots: vi.fn(),
	},
}));

vi.mock("../../technician-calendar.service.js", () => ({
	technicianCalendarService: mockService,
}));

const { technicianCalendarController } = await import(
	"../../technician-calendar.controller.js"
);

function mockReq(overrides: Record<string, unknown> = {}) {
	return createMockReq(overrides as never) as any;
}

// createMockRes lacks .send() — controller uses it for 204 responses.
function mockRes(): MockResponse & { send: ReturnType<typeof vi.fn> } {
	const res = createMockRes() as any;
	res.send = vi.fn(() => res);
	return res;
}

describe("TechnicianCalendarController", () => {
	beforeEach(() => {
		for (const m of Object.values(mockService)) m.mockReset();
	});

	it("rejects with 403 when the caller does not own the calendar", async () => {
		const req = mockReq({
			technician: { id: "tech-1" },
			params: { technicianId: "tech-2" },
		});
		const res = mockRes();
		await technicianCalendarController.getCalendar(req, res);

		expect(res.statusCode).toBe(403);
		expect(res.body).toEqual({
			error: "You can only manage your own calendar.",
		});
		expect(mockService.getCalendar).not.toHaveBeenCalled();
	});

	it("getCalendar returns 200 { data } for the owner", async () => {
		const entries = [{ id: "e1" }];
		mockService.getCalendar.mockResolvedValue(entries);

		const req = mockReq({
			technician: { id: "tech-1" },
			params: { technicianId: "tech-1" },
			query: { from: "2099-01-01", to: "2099-02-01" },
		});
		const res = mockRes();
		await technicianCalendarController.getCalendar(req, res);

		expect(mockService.getCalendar).toHaveBeenCalledWith("tech-1", {
			from: "2099-01-01",
			to: "2099-02-01",
		});
		expect(res.statusCode).toBe(200);
		expect(res.body).toEqual({ data: entries });
	});

	it("createEntry returns 201 { data }", async () => {
		const entry = { id: "e1", date: "2099-01-01" };
		mockService.createEntry.mockResolvedValue(entry);

		const req = mockReq({
			technician: { id: "tech-1" },
			params: { technicianId: "tech-1" },
			body: { date: "2099-01-01" },
		});
		const res = mockRes();
		await technicianCalendarController.createEntry(req, res);

		expect(mockService.createEntry).toHaveBeenCalledWith({
			technician_id: "tech-1",
			date: "2099-01-01",
		});
		expect(res.statusCode).toBe(201);
		expect(res.body).toEqual({ data: entry });
	});

	it("deleteEntry returns 204 with no body", async () => {
		mockService.deleteEntry.mockResolvedValue(undefined);

		const req = mockReq({
			technician: { id: "tech-1" },
			params: { technicianId: "tech-1", id: "e1" },
		});
		const res = mockRes();
		await technicianCalendarController.deleteEntry(req, res);

		expect(mockService.deleteEntry).toHaveBeenCalledWith("e1");
		expect(res.statusCode).toBe(204);
		expect(res.send).toHaveBeenCalled();
		expect(res.json).not.toHaveBeenCalled();
	});

	it("normalizes a service error into status + { error }", async () => {
		mockService.getEntry.mockRejectedValue({
			status: 404,
			message: "Calendar entry not found.",
		});

		const req = mockReq({
			technician: { id: "tech-1" },
			params: { technicianId: "tech-1", id: "nope" },
		});
		const res = mockRes();
		await technicianCalendarController.getEntry(req, res);

		expect(res.statusCode).toBe(404);
		expect(res.body).toEqual({ error: "Calendar entry not found." });
	});

	it("getBookedSlots is public and returns 200 { data: { slots } }", async () => {
		const slots = [{ date: "2099-01-01", slot_hour: 8 }];
		mockService.getBookedSlots.mockResolvedValue(slots);

		// No req.technician — public route skips ownership.
		const req = mockReq({ params: { technicianId: "tech-9" }, query: {} });
		const res = mockRes();
		await technicianCalendarController.getBookedSlots(req, res);

		expect(mockService.getBookedSlots).toHaveBeenCalledWith("tech-9", {
			from: undefined,
			to: undefined,
		});
		expect(res.statusCode).toBe(200);
		expect(res.body).toEqual({ data: { slots } });
	});
});
