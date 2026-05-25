import { z } from 'zod';

/**
 * POST /reschedule body — initiator submits a date change request.
 * - proposed_scheduled_date: YYYY-MM-DD (string-only; Zod cannot validate Cairo-time
 *   semantics, those run in the service layer)
 * - proposed_scheduled_start_at: ISO datetime of the requested fixed slot
 * - reason: required, length-bounded per VALID-08 and the DB CHECK constraint
 */
export const RescheduleRequestBodySchema = z.object({
  proposed_scheduled_date: z
    .string()
    .regex(/^\d{4}-\d{2}-\d{2}$/, 'proposed_scheduled_date must be in YYYY-MM-DD format'),
  proposed_scheduled_start_at: z
    .iso
    .datetime({ offset: true }),
  reason: z
    .string()
    .min(1, 'reason is required')
    .max(500, 'reason must be 500 characters or fewer'),
});

/**
 * POST /reschedule/reject body — counterparty rejects with a reason.
 */
export const RescheduleRejectBodySchema = z.object({
  reason: z
    .string()
    .min(1, 'reason is required')
    .max(500, 'reason must be 500 characters or fewer'),
});

export type RescheduleRequestBody = z.infer<typeof RescheduleRequestBodySchema>;
export type RescheduleRejectBody = z.infer<typeof RescheduleRejectBodySchema>;
