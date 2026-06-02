import { beforeEach, describe, expect, it, vi } from "vitest";

const { mockOrdersRepo, mockRescheduleRepo, mockCalendarService, mockNotifications } =
  vi.hoisted(() => ({
    mockOrdersRepo: {
      getOrderById: vi.fn(),
      checkTechnicianAvailability: vi.fn(),
      getActiveOrdersCountForDate: vi.fn(),
    },
    mockRescheduleRepo: {
      createRequest: vi.fn(),
      approve: vi.fn(),
      reject: vi.fn(),
      getByOrderId: vi.fn(),
      autoRejectIfExpired: vi.fn(),
      cancelPendingForOrder: vi.fn(),
    },
    mockCalendarService: {
      isDateHoliday: vi.fn(),
    },
    mockNotifications: {
      sendPushToRecipient: vi.fn(),
    },
  }));

vi.mock("../../orders.repository.js", () => ({
  ordersRepository: mockOrdersRepo,
}));

vi.mock("../../reschedule.repository.js", () => ({
  rescheduleRepository: mockRescheduleRepo,
}));

vi.mock("../../../technician-calendar/technician-calendar.service.js", () => ({
  technicianCalendarService: mockCalendarService,
}));

vi.mock("../../../notifications/notifications.service.js", () => ({
  notificationsService: mockNotifications,
}));

const { RescheduleService } = await import("../../reschedule.service.js");

describe("RescheduleService notifications", () => {
  let service: InstanceType<typeof RescheduleService>;

  beforeEach(() => {
    service = new RescheduleService();
    for (const fn of Object.values(mockOrdersRepo)) fn.mockReset();
    for (const fn of Object.values(mockRescheduleRepo)) fn.mockReset();
    for (const fn of Object.values(mockCalendarService)) fn.mockReset();
    for (const fn of Object.values(mockNotifications)) fn.mockReset();

    mockOrdersRepo.checkTechnicianAvailability.mockResolvedValue(true);
    mockOrdersRepo.getActiveOrdersCountForDate.mockResolvedValue(0);
    mockCalendarService.isDateHoliday.mockResolvedValue(false);
    mockRescheduleRepo.autoRejectIfExpired.mockResolvedValue(null);
  });

  it("notifies the technician when a user creates a reschedule request", async () => {
    mockOrdersRepo.getOrderById.mockResolvedValue({
      id: "order-1",
      user_id: "user-1",
      technician_id: "tech-1",
      user_name: "Sarah Ali",
      technician_name: "Omar Hassan",
      scheduled_date: "2099-06-01",
      status: "accepted",
    });
    mockRescheduleRepo.createRequest.mockResolvedValue({ id: "req-1" });

    await service.createRequest({
      orderId: "order-1",
      actor: "user",
      actorId: "user-1",
      proposedDate: "2099-06-03",
      proposedStartAt: "2099-06-03T08:00:00+03:00",
      reason: "Need another day",
    });

    expect(mockNotifications.sendPushToRecipient).toHaveBeenCalledWith({
      recipientRole: "technician",
      recipientId: "tech-1",
      type: "reschedule_requested",
      title: "Reschedule requested",
      body: "Sarah Ali requested a reschedule.",
      senderName: "Sarah Ali",
      orderId: "order-1",
      viewerRole: "technician",
    });
  });

  it("notifies the request initiator when a reschedule is approved", async () => {
    const order = {
      id: "order-2",
      user_id: "user-2",
      technician_id: "tech-2",
      user_name: "Sarah Ali",
      technician_name: "Omar Hassan",
      scheduled_date: "2099-06-01",
      status: "reschedule_requested_by_user",
    };
    mockOrdersRepo.getOrderById.mockResolvedValue(order);
    mockRescheduleRepo.getByOrderId.mockResolvedValue({
      id: "req-2",
      requested_by: "user",
      resolution: "pending",
      proposed_scheduled_date: "2099-06-05",
      proposed_scheduled_start_at: "2099-06-05T08:00:00+03:00",
      original_scheduled_date: "2099-06-01",
    });
    mockRescheduleRepo.approve.mockResolvedValue({ id: "req-2", resolution: "approved" });

    await service.approve({
      orderId: "order-2",
      actor: "technician",
      actorId: "tech-2",
    });

    expect(mockNotifications.sendPushToRecipient).toHaveBeenCalledWith({
      recipientRole: "user",
      recipientId: "user-2",
      type: "reschedule_approved",
      title: "Reschedule approved",
      body: "Omar Hassan approved your reschedule request.",
      senderName: "Omar Hassan",
      senderImageUrl: undefined,
      orderId: "order-2",
      viewerRole: "user",
    });
  });
});
