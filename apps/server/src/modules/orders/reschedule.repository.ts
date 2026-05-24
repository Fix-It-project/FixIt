import { supabaseAdmin } from '../../shared/db/supabase.js';
import { AppError } from '../../shared/errors/index.js';

const supabase = supabaseAdmin;

export type RescheduleResolution = 'pending' | 'approved' | 'rejected' | 'withdrawn';

export interface RescheduleRequest {
  id: string;
  order_id: string;
  requested_by: 'user' | 'technician';
  original_scheduled_date: string;
  original_scheduled_start_at?: string | null;
  proposed_scheduled_date: string;
  proposed_scheduled_start_at?: string | null;
  request_reason: string;
  reject_reason: string | null;
  resolution: RescheduleResolution;
  response_window_hours: number;
  created_at: string;
  resolved_at: string | null;
}

export interface CreateRequestParams {
  orderId: string;
  actor: 'user' | 'technician';
  actorId: string;
  proposedDate: string;
  proposedStartAt: string;
  reason: string;
}

export interface ApproveParams {
  orderId: string;
  actor: 'user' | 'technician';
  actorId: string;
}

export interface RejectParams {
  orderId: string;
  actor: 'user' | 'technician';
  actorId: string;
  reason: string;
}

export interface WithdrawParams {
  orderId: string;
  actor: 'user' | 'technician';
  actorId: string;
}

/**
 * Map a Supabase RPC error → AppError. Centralises the structured-error contract
 * documented in REQUIREMENTS.md API-13. The Postgres functions in reschedule-schema.sql
 * raise these as `RAISE EXCEPTION '<code>'` which Supabase surfaces in `error.message`.
 */
function mapRpcError(error: { code?: string; message?: string }): never {
  if (error.code === '23505') {
    throw AppError.conflict('reschedule_already_pending');
  }

  const msg = error.message ?? '';

  if (msg.includes('not_counterparty'))             throw AppError.forbidden('not_counterparty');
  if (msg.includes('not_initiator'))                throw AppError.forbidden('not_initiator');
  if (msg.includes('forbidden_not_order_owner'))    throw AppError.forbidden('forbidden_not_order_owner');
  if (msg.includes('invalid_actor'))                throw AppError.badRequest('invalid_actor');

  if (msg.includes('order_not_in_accepted_state')) throw AppError.badRequest('order_not_in_accepted_state');
  if (msg.includes('order_status_inconsistent'))   throw AppError.conflict('order_status_inconsistent');
  if (msg.includes('order_status_changed_concurrently'))      throw AppError.conflict('order_status_changed_concurrently');
  if (msg.includes('reschedule_resolution_changed_concurrently')) throw AppError.conflict('reschedule_resolution_changed_concurrently');
  if (msg.includes('reschedule_already_resolved')) throw AppError.conflict('reschedule_already_resolved');
  if (msg.includes('reschedule_not_found'))        throw AppError.notFound('reschedule_not_found');
  if (msg.includes('order_not_found'))             throw AppError.notFound('order_not_found');
  if (msg.includes('proposed_not_after_original')) throw AppError.badRequest('proposed_not_after_original');
  if (msg.includes('proposed_not_in_future'))      throw AppError.badRequest('proposed_not_in_future');
  if (msg.includes('proposed_scheduled_start_at_required')) throw AppError.badRequest('proposed_scheduled_start_at_required');
  if (msg.includes('invalid_proposed_scheduled_start_at'))  throw AppError.badRequest('invalid_proposed_scheduled_start_at');
  if (msg.includes('invalid_proposed_scheduled_slot'))      throw AppError.badRequest('invalid_proposed_scheduled_slot');
  if (msg.includes('proposed_scheduled_date_start_mismatch')) throw AppError.badRequest('proposed_scheduled_date_start_mismatch');
  if (msg.includes('tech_unavailable'))            throw AppError.badRequest('tech_unavailable');
  if (msg.includes('cap_exhausted_for_date'))      throw AppError.conflict('cap_exhausted_for_date');
  if (msg.includes('request_expired'))             throw AppError.conflict('request_expired');
  if (msg.includes('reason_required'))             throw AppError.badRequest('reason_required');
  if (msg.includes('reason_too_long'))             throw AppError.badRequest('reason_too_long');

  console.error('[reschedule_rpc_failed]', {
    code: error.code,
    message: error.message,
  });
  throw AppError.internal(`reschedule_rpc_failed: ${msg || 'unknown_rpc_error'}`);
}

export class RescheduleRepository {
  async createRequest(p: CreateRequestParams): Promise<RescheduleRequest> {
    const { data, error } = await supabase.rpc('reschedule_create', {
      p_order_id:      p.orderId,
      p_actor:         p.actor,
      p_actor_id:      p.actorId,
      p_proposed_date: p.proposedDate,
      p_proposed_start_at: p.proposedStartAt,
      p_reason:        p.reason,
    });
    if (error) mapRpcError(error as { code?: string; message?: string });
    return data as RescheduleRequest;
  }

  async approve(p: ApproveParams): Promise<RescheduleRequest> {
    const { data, error } = await supabase.rpc('reschedule_approve', {
      p_order_id: p.orderId,
      p_actor:    p.actor,
      p_actor_id: p.actorId,
    });
    if (error) mapRpcError(error as { code?: string; message?: string });
    return data as RescheduleRequest;
  }

  async reject(p: RejectParams): Promise<RescheduleRequest> {
    const { data, error } = await supabase.rpc('reschedule_reject', {
      p_order_id: p.orderId,
      p_actor:    p.actor,
      p_actor_id: p.actorId,
      p_reason:   p.reason,
    });
    if (error) mapRpcError(error as { code?: string; message?: string });
    return data as RescheduleRequest;
  }

  async withdraw(p: WithdrawParams): Promise<RescheduleRequest> {
    const { data, error } = await supabase.rpc('reschedule_withdraw', {
      p_order_id: p.orderId,
      p_actor:    p.actor,
      p_actor_id: p.actorId,
    });
    if (error) mapRpcError(error as { code?: string; message?: string });
    return data as RescheduleRequest;
  }

  async autoRejectIfExpired(orderId: string): Promise<RescheduleRequest | null> {
    const { data, error } = await supabase.rpc('auto_reject_if_expired', {
      p_order_id: orderId,
    });
    if (error) mapRpcError(error as { code?: string; message?: string });
    return (data ?? null) as RescheduleRequest | null;
  }

  /** Most-recent reschedule row for an order (any resolution), or null. */
  async getByOrderId(orderId: string): Promise<RescheduleRequest | null> {
    const { data, error } = await supabase
      .from('reschedule_requests')
      .select('*')
      .eq('order_id', orderId)
      .order('created_at', { ascending: false })
      .limit(1)
      .maybeSingle();
    if (error) throw error;
    return (data ?? null) as RescheduleRequest | null;
  }

  /** Active (pending) reschedule row for an order, or null. */
  async getPendingByOrderId(orderId: string): Promise<RescheduleRequest | null> {
    const { data, error } = await supabase
      .from('reschedule_requests')
      .select('*')
      .eq('order_id', orderId)
      .eq('resolution', 'pending')
      .maybeSingle();
    if (error) throw error;
    return (data ?? null) as RescheduleRequest | null;
  }

  /**
   * Called from OrdersService cancel paths. Routes through the reject RPC with
   * p_actor='system' to keep atomicity on the order/request flip.
   * Returns null when there was nothing to cancel.
   */
  async cancelPendingForOrder(orderId: string, reason: string): Promise<RescheduleRequest | null> {
    const pending = await this.getPendingByOrderId(orderId);
    if (!pending) return null;

    const { data, error } = await supabase.rpc('reschedule_reject', {
      p_order_id: orderId,
      p_actor:    'system',
      p_actor_id: null,
      p_reason:   reason,
    });
    if (error) mapRpcError(error as { code?: string; message?: string });
    return data as RescheduleRequest;
  }
}

export const rescheduleRepository = new RescheduleRepository();
