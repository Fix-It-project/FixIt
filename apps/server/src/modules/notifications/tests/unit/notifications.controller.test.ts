import { beforeEach, describe, expect, it, vi } from "vitest";
import {
	createMockReq,
	createMockRes,
} from "../../../../../tests/mocks/express.mock.js";

const { mockService } = vi.hoisted(() => ({
	mockService: {
		listNotificationLogs: vi.fn(),
		getUnreadCount: vi.fn(),
		markAllRead: vi.fn(),
		getPreferences: vi.fn(),
		updatePreferences: vi.fn(),
		registerDevice: vi.fn(),
		unregisterDevice: vi.fn(),
	},
}));

vi.mock("../../notifications.service.js", () => ({
	notificationsService: mockService,
}));

const { notificationsController } = await import(
	"../../notifications.controller.js"
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

describe("NotificationsController", () => {
	beforeEach(() => {
		for (const m of Object.values(mockService)) m.mockReset();
	});

	it("listLogs(user) coerces query and returns 200 { data }", async () => {
		const logs = [{ id: "log-1" }];
		mockService.listNotificationLogs.mockResolvedValue(logs);

		const req = mockReq({
			user: { id: "user-1" },
			query: { limit: "5", offset: "10" },
		});
		const res = createMockRes();
		await runHandler(notificationsController.listLogs("user"), req, res);

		expect(mockService.listNotificationLogs).toHaveBeenCalledWith({
			recipientRole: "user",
			recipientId: "user-1",
			limit: 5,
			offset: 10,
		});
		expect(res.statusCode).toBe(200);
		expect(res.body).toEqual({ data: logs });
	});

	it("getUnreadCount(technician) returns 200 { data: { unread_count } }", async () => {
		mockService.getUnreadCount.mockResolvedValue(3);

		const req = mockReq({ technician: { id: "tech-1" } });
		const res = createMockRes();
		await runHandler(
			notificationsController.getUnreadCount("technician"),
			req,
			res,
		);

		expect(mockService.getUnreadCount).toHaveBeenCalledWith(
			"technician",
			"tech-1",
		);
		expect(res.statusCode).toBe(200);
		expect(res.body).toEqual({ data: { unread_count: 3 } });
	});

	it("markAllRead(user) returns 200 { success: true } and logs", async () => {
		mockService.markAllRead.mockResolvedValue(undefined);

		const req = mockReq({ user: { id: "user-1" } });
		const res = createMockRes();
		await runHandler(notificationsController.markAllRead("user"), req, res);

		expect(mockService.markAllRead).toHaveBeenCalledWith("user", "user-1");
		expect(req.log.info).toHaveBeenCalledWith(
			expect.objectContaining({ action: "notification_logs_marked_read" }),
		);
		expect(res.statusCode).toBe(200);
		expect(res.body).toEqual({ success: true });
	});

	it("register(user) forwards the expo token and returns 200 { data: device }", async () => {
		const device = { id: "dev-1" };
		mockService.registerDevice.mockResolvedValue(device);

		const req = mockReq({
			user: { id: "user-1" },
			body: { expo_push_token: "ExponentPushToken[abc]" },
		});
		const res = createMockRes();
		await runHandler(notificationsController.register("user"), req, res);

		expect(mockService.registerDevice).toHaveBeenCalledWith({
			recipientRole: "user",
			recipientId: "user-1",
			expoPushToken: "ExponentPushToken[abc]",
		});
		expect(req.log.info).toHaveBeenCalledWith(
			expect.objectContaining({ action: "push_device_registered" }),
		);
		expect(res.statusCode).toBe(200);
		expect(res.body).toEqual({ data: device });
	});

	it("forwards a 401 via next() when the actor is not authenticated", async () => {
		const req = mockReq({ query: {} }); // no req.user
		const res = createMockRes();
		const { next } = await runHandler(
			notificationsController.listLogs("user"),
			req,
			res,
		);

		expect(next).toHaveBeenCalledTimes(1);
		expect(next.mock.calls[0]?.[0]).toMatchObject({ status: 401 });
		expect(mockService.listNotificationLogs).not.toHaveBeenCalled();
	});
});
