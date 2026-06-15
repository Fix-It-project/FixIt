/**
 * How long a pending order lives before the database sweeper rejects it.
 *
 * MUST stay in sync with `auto_reject_stale_pending_orders()` in
 * `supabase/migrations/order status/schema.sql` (currently
 * `interval '6 hours' -- TEST ONLY`). If the SQL interval changes, change
 * this constant in the same commit — the technician dashboard countdown is
 * driven by this value via GET /api/technicians/me/stats.
 */
export const PENDING_ORDER_EXPIRY_HOURS = 6;
