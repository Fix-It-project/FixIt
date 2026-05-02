import { ordersRepository, type Order } from './orders.repository.js';
import { rescheduleRepository, type RescheduleRequest } from './reschedule.repository.js';
import { technicianCalendarService } from '../technician-calendar/technician-calendar.service.js';
import { AppError } from '../../shared/errors/index.js';
import {
  nowInCairo,
  cairoMidnightUtc,
  hoursBetween,
} from '../../shared/time/cairo-time.js';

export type Actor = 'user' | 'technician';

export interface CreateRequestInput {
  orderId: string;
  actor: Actor;
  actorId: string;
  proposedDate: string;       // YYYY-MM-DD
  reason: string;
}

export interface ApproveInput { orderId: string; actor: Actor; actorId: string; }
export interface RejectInput  { orderId: string; actor: Actor; actorId: string; reason: string; }
export interface WithdrawInput { orderId: string; actor: Actor; actorId: string; }

export interface ReconciledOrder {
  order: Order;
  request: RescheduleRequest | null;
}

const ISO_DATE = /^\d{4}-\d{2}-\d{2}$/;
const TERMINAL_STATUSES = new Set([
  'rejected', 'cancelled_by_user', 'cancelled_by_technician', 'completed',
]);

export class RescheduleService {
  // ─── Public API ───────────────────────────────────────────────────────────

  async createRequest(input: CreateRequestInput): Promise<RescheduleRequest> {
    const order = await this.loadOrderForActor(input.orderId, input.actor, input.actorId);
    await this.runValidationChain({
      order,
      proposedDate: input.proposedDate,
      reason: input.reason,
    });
    return rescheduleRepository.createRequest({
      orderId: input.orderId,
      actor: input.actor,
      actorId: input.actorId,
      proposedDate: input.proposedDate,
      reason: input.reason,
    });
  }

  async approve(input: ApproveInput): Promise<RescheduleRequest> {
    const { request } = await this.loadAndReconcile(input.orderId);
    if (!request) {
      throw AppError.notFound('reschedule_not_found');
    }
    this.assertCounterparty(input.actor, request);
    return rescheduleRepository.approve({
      orderId: input.orderId,
      actor: input.actor,
      actorId: input.actorId,
    });
  }

  async reject(input: RejectInput): Promise<RescheduleRequest> {
    if (!input.reason || input.reason.trim().length === 0) {
      throw AppError.badRequest('reason_required');
    }
    if (input.reason.length > 500) {
      throw AppError.badRequest('reason_too_long');
    }
    const { request } = await this.loadAndReconcile(input.orderId);
    if (!request) {
      throw AppError.notFound('reschedule_not_found');
    }
    this.assertCounterparty(input.actor, request);
    return rescheduleRepository.reject({
      orderId: input.orderId,
      actor: input.actor,
      actorId: input.actorId,
      reason: input.reason,
    });
  }

  async withdraw(input: WithdrawInput): Promise<RescheduleRequest> {
    const { request } = await this.loadAndReconcile(input.orderId);
    if (!request) {
      throw AppError.notFound('reschedule_not_found');
    }
    return rescheduleRepository.withdraw({
      orderId: input.orderId,
      actor: input.actor,
      actorId: input.actorId,
    });
  }

  /**
   * Read-and-reconcile the order + reschedule_request pair.
   * Triggers (in order):
   *   1. RPC auto_reject_if_expired — handles timeout + original-date-passed atomically.
   *   2. After re-read: if pending && availability has changed (template inactive or new
   *      calendar exception on proposed date) → cancel with 'auto_rejected_availability_changed'.
   *   3. After re-read: if pending && order is in a terminal state → cancel with
   *      'auto_rejected_order_cancelled'.
   * Returns the post-reconcile order + request snapshot.
   */
  async loadAndReconcile(orderId: string): Promise<ReconciledOrder> {
    await rescheduleRepository.autoRejectIfExpired(orderId);

    let order = await ordersRepository.getOrderById(orderId);
    if (!order) {
      throw AppError.notFound('order_not_found');
    }
    let request = await rescheduleRepository.getByOrderId(orderId);

    if (request && request.resolution === 'pending') {
      const availabilityOk = await this.isProposedDateStillAvailable(
        order.technician_id,
        request.proposed_scheduled_date,
      );
      if (!availabilityOk) {
        await rescheduleRepository.cancelPendingForOrder(
          orderId,
          'auto_rejected_availability_changed',
        );
        order = (await ordersRepository.getOrderById(orderId)) ?? order;
        request = await rescheduleRepository.getByOrderId(orderId);
      }
    }

    if (request && request.resolution === 'pending' && TERMINAL_STATUSES.has(order.status)) {
      await rescheduleRepository.cancelPendingForOrder(orderId, 'auto_rejected_order_cancelled');
      request = await rescheduleRepository.getByOrderId(orderId);
    }

    return { order, request };
  }

  /** SERVICE-06: pass-through used by external module callers. */
  async cancelPendingForOrder(orderId: string, reason: string): Promise<RescheduleRequest | null> {
    return rescheduleRepository.cancelPendingForOrder(orderId, reason);
  }

  // ─── Private helpers ──────────────────────────────────────────────────────

  /** SERVICE-08: counterparty check — raises 403 if actor is the same role that initiated. */
  private assertCounterparty(actor: Actor, request: RescheduleRequest): void {
    if (actor === request.requested_by) {
      throw AppError.forbidden('not_counterparty');
    }
  }

  /** Loads order and asserts that the (actor, actorId) pair owns it.
   *  Returns 404 (not 403) on mismatch to match Pitfall 12 mitigation. */
  private async loadOrderForActor(orderId: string, actor: Actor, actorId: string): Promise<Order> {
    const order = await ordersRepository.getOrderById(orderId);
    if (!order) {
      throw AppError.notFound('order_not_found');
    }
    if (actor === 'user' && order.user_id !== actorId) {
      throw AppError.notFound('order_not_found');
    }
    if (actor === 'technician' && order.technician_id !== actorId) {
      throw AppError.notFound('order_not_found');
    }
    return order;
  }

  /** SERVICE-07: 7-rule validation chain (excluding VALID-02 — DB partial unique enforces). */
  private async runValidationChain(args: {
    order: Order;
    proposedDate: string;
    reason: string;
  }): Promise<void> {
    const { order, proposedDate, reason } = args;

    if (!reason || reason.trim().length === 0) {
      throw AppError.badRequest('reason_required');
    }
    if (reason.length > 500) {
      throw AppError.badRequest('reason_too_long');
    }

    if (order.status !== 'accepted') {
      throw AppError.badRequest('order_not_in_accepted_state');
    }

    if (!ISO_DATE.test(proposedDate)) {
      throw AppError.badRequest('Invalid date format. Use YYYY-MM-DD.');
    }
    if (proposedDate <= order.scheduled_date) {
      throw AppError.badRequest('proposed_not_after_original');
    }

    const proposedUtc = cairoMidnightUtc(proposedDate);
    const now = nowInCairo();
    if (hoursBetween(now, proposedUtc) < 24) {
      throw AppError.badRequest('proposed_within_24h_buffer');
    }

    const originalUtc = cairoMidnightUtc(order.scheduled_date);
    if (hoursBetween(now, originalUtc) < 24) {
      throw AppError.badRequest('original_within_24h_buffer');
    }

    const availabilityOk = await this.isProposedDateStillAvailable(order.technician_id, proposedDate);
    if (!availabilityOk) {
      throw AppError.badRequest('tech_unavailable');
    }

    const count = await ordersRepository.getActiveOrdersCountForDate(order.technician_id, proposedDate);
    if (count >= 5) {
      throw AppError.conflict('cap_exhausted_for_date');
    }
  }

  /** Combined availability check: template active for getDay(date) AND no calendar exception. */
  private async isProposedDateStillAvailable(technicianId: string, dateYmd: string): Promise<boolean> {
    const dayOfWeek = new Date(dateYmd + 'T00:00:00Z').getUTCDay();
    const templateOk = await ordersRepository.checkTechnicianAvailability(technicianId, dayOfWeek);
    if (!templateOk) return false;
    const isHoliday = await technicianCalendarService.isDateHoliday(technicianId, dateYmd);
    return !isHoliday;
  }
}

export const rescheduleService = new RescheduleService();
