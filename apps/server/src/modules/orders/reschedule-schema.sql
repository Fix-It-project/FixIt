-- ============================================================================
-- File: reschedule-schema.sql
-- Purpose: Source-of-truth DDL + RPC functions for the order reschedule
--          dual-approval feature. Apply once per environment via Supabase
--          Studio SQL editor. This file is documentation + checked-in artifact;
--          it is NOT executed by the Node process.
-- Phase:   1 (backend) — Plan 1.1
-- Owns:    SCHEMA-01..05, RPC-01..05
-- ============================================================================

BEGIN;

-- ----------------------------------------------------------------------------
-- 1. Extend orders.status CHECK constraint (SCHEMA-01)
-- ----------------------------------------------------------------------------
ALTER TABLE orders DROP CONSTRAINT IF EXISTS orders_status_check;
ALTER TABLE orders ADD CONSTRAINT orders_status_check CHECK (
  status IN (
    'pending',
    'accepted',
    'reschedule_requested_by_user',
    'reschedule_requested_by_technician',
    'rejected',
    'cancelled',                        -- legacy value (153 rows pre-split)
    'cancelled_by_user',
    'cancelled_by_technician',
    'completed'
  )
);

-- ----------------------------------------------------------------------------
-- 2. reschedule_requests table (SCHEMA-02, SCHEMA-04)
-- ----------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS reschedule_requests (
  id                       uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  order_id                 uuid NOT NULL REFERENCES orders(id) ON DELETE CASCADE,
  requested_by             text NOT NULL CHECK (requested_by IN ('user','technician')),
  original_scheduled_date  date NOT NULL,
  proposed_scheduled_date  date NOT NULL,
  request_reason           text NOT NULL CHECK (length(trim(request_reason)) > 0 AND length(request_reason) <= 500),
  reject_reason            text CHECK (reject_reason IS NULL OR (length(trim(reject_reason)) > 0 AND length(reject_reason) <= 500)),
  resolution               text NOT NULL DEFAULT 'pending'
                                CHECK (resolution IN ('pending','approved','rejected','withdrawn')),
  response_window_hours    integer NOT NULL DEFAULT 24 CHECK (response_window_hours > 0),
  created_at               timestamptz NOT NULL DEFAULT now(),
  resolved_at              timestamptz,
  CHECK (proposed_scheduled_date > original_scheduled_date),
  CHECK ((resolution = 'pending') = (resolved_at IS NULL))
);

-- ----------------------------------------------------------------------------
-- 3. Partial unique index — single in-flight per order (SCHEMA-03)
-- ----------------------------------------------------------------------------
CREATE UNIQUE INDEX IF NOT EXISTS reschedule_requests_one_pending_per_order
  ON reschedule_requests (order_id)
  WHERE resolution = 'pending';

-- Supporting non-unique index for the lazy auto-reject sweep
CREATE INDEX IF NOT EXISTS reschedule_requests_pending_created_at_idx
  ON reschedule_requests (created_at)
  WHERE resolution = 'pending';

-- ----------------------------------------------------------------------------
-- 4. RPC: reschedule_create (RPC-01)
--    Validates, inserts request, transitions orders.status.
--    Lock: SELECT ... FOR UPDATE on orders row.
-- ----------------------------------------------------------------------------
CREATE OR REPLACE FUNCTION reschedule_create(
  p_order_id      uuid,
  p_actor         text,           -- 'user' | 'technician'
  p_actor_id      uuid,           -- user_id or technician_id matching p_actor
  p_proposed_date date,
  p_reason        text
) RETURNS reschedule_requests
LANGUAGE plpgsql SECURITY DEFINER AS $$
DECLARE
  v_order        orders%ROWTYPE;
  v_new_status   text;
  v_active_count int;
  v_avail        boolean;
  v_holiday      int;
  v_request      reschedule_requests%ROWTYPE;
BEGIN
  -- Lock the order row
  SELECT * INTO v_order FROM orders WHERE id = p_order_id FOR UPDATE;
  IF NOT FOUND THEN
    RAISE EXCEPTION 'order_not_found' USING ERRCODE = 'P0002';
  END IF;

  -- VALID-01: order must be 'accepted'
  IF v_order.status <> 'accepted' THEN
    RAISE EXCEPTION 'order_not_in_accepted_state' USING ERRCODE = 'P0001';
  END IF;

  -- Authorization: actor must be the user_id or technician_id on this order
  IF p_actor = 'user' AND v_order.user_id <> p_actor_id THEN
    RAISE EXCEPTION 'forbidden_not_order_owner' USING ERRCODE = 'P0001';
  END IF;
  IF p_actor = 'technician' AND v_order.technician_id <> p_actor_id THEN
    RAISE EXCEPTION 'forbidden_not_order_owner' USING ERRCODE = 'P0001';
  END IF;
  IF p_actor NOT IN ('user','technician') THEN
    RAISE EXCEPTION 'invalid_actor' USING ERRCODE = 'P0001';
  END IF;

  -- VALID-03: proposed > original
  IF p_proposed_date <= v_order.scheduled_date THEN
    RAISE EXCEPTION 'proposed_not_after_original' USING ERRCODE = 'P0001';
  END IF;

  -- VALID-04 / VALID-05: 24h Cairo windows are checked in TS (cairo-time.ts) before calling this RPC.
  -- The RPC re-asserts proposed > today (UTC date) as a defensive last-line check.
  IF p_proposed_date <= CURRENT_DATE THEN
    RAISE EXCEPTION 'proposed_not_in_future' USING ERRCODE = 'P0001';
  END IF;

  -- VALID-06: Tech availability template for getDay(proposed) AND no calendar exception
  SELECT active INTO v_avail
    FROM availability_templates
    WHERE technician_id = v_order.technician_id
      AND day_of_week   = EXTRACT(DOW FROM p_proposed_date)::int
    LIMIT 1;
  IF v_avail IS DISTINCT FROM TRUE THEN
    RAISE EXCEPTION 'tech_unavailable' USING ERRCODE = 'P0001';
  END IF;

  SELECT COUNT(*) INTO v_holiday
    FROM calendar_exceptions
    WHERE technician_id = v_order.technician_id
      AND date          = p_proposed_date;
  IF v_holiday > 0 THEN
    RAISE EXCEPTION 'tech_unavailable' USING ERRCODE = 'P0001';
  END IF;

  -- VALID-07: <5 accepted orders on proposed date (advisory lock for race-safety)
  PERFORM pg_advisory_xact_lock(hashtext(v_order.technician_id::text || p_proposed_date::text));

  SELECT COUNT(*) INTO v_active_count
    FROM orders
    WHERE technician_id  = v_order.technician_id
      AND scheduled_date = p_proposed_date
      AND status         = 'accepted'
      AND active         = TRUE;
  IF v_active_count >= 5 THEN
    RAISE EXCEPTION 'cap_exhausted_for_date' USING ERRCODE = 'P0001';
  END IF;

  -- VALID-08: reason required, length-bounded (CHECK on column also enforces this)
  IF p_reason IS NULL OR length(trim(p_reason)) = 0 THEN
    RAISE EXCEPTION 'reason_required' USING ERRCODE = 'P0001';
  END IF;
  IF length(p_reason) > 500 THEN
    RAISE EXCEPTION 'reason_too_long' USING ERRCODE = 'P0001';
  END IF;

  -- Determine the new order status
  v_new_status := CASE
    WHEN p_actor = 'user'       THEN 'reschedule_requested_by_user'
    WHEN p_actor = 'technician' THEN 'reschedule_requested_by_technician'
  END;

  -- Atomic write: insert request + flip order status
  -- Conditional UPDATE guarantees no concurrent transition slipped through
  INSERT INTO reschedule_requests (
    order_id, requested_by, original_scheduled_date, proposed_scheduled_date,
    request_reason, resolution, response_window_hours
  ) VALUES (
    p_order_id, p_actor, v_order.scheduled_date, p_proposed_date,
    p_reason, 'pending', 24
  )
  RETURNING * INTO v_request;
  -- Note: partial unique index will raise SQLSTATE 23505 here if a pending row already exists.

  UPDATE orders
    SET status = v_new_status
    WHERE id = p_order_id AND status = 'accepted'
    RETURNING * INTO v_order;
  IF NOT FOUND THEN
    RAISE EXCEPTION 'order_status_changed_concurrently' USING ERRCODE = 'P0001';
  END IF;

  RETURN v_request;
END;
$$;

-- ----------------------------------------------------------------------------
-- 5. RPC: reschedule_approve (RPC-02)
--    Counterparty approves; re-runs full validation chain (TOCTOU correctness);
--    advisory lock on (tech_id, proposed_date); updates orders.scheduled_date;
--    sets request resolution='approved'; restores orders.status='accepted'.
--    Idempotent: if already approved, returns the existing row.
-- ----------------------------------------------------------------------------
CREATE OR REPLACE FUNCTION reschedule_approve(
  p_order_id uuid,
  p_actor    text,
  p_actor_id uuid
) RETURNS reschedule_requests
LANGUAGE plpgsql SECURITY DEFINER AS $$
DECLARE
  v_order        orders%ROWTYPE;
  v_request      reschedule_requests%ROWTYPE;
  v_active_count int;
  v_avail        boolean;
  v_holiday      int;
  v_expected     text;
BEGIN
  -- Lock the order row
  SELECT * INTO v_order FROM orders WHERE id = p_order_id FOR UPDATE;
  IF NOT FOUND THEN
    RAISE EXCEPTION 'order_not_found' USING ERRCODE = 'P0002';
  END IF;

  -- Lock the request row (most recent — partial unique guarantees at most one pending)
  SELECT * INTO v_request
    FROM reschedule_requests
    WHERE order_id = p_order_id
    ORDER BY created_at DESC
    LIMIT 1
    FOR UPDATE;
  IF NOT FOUND THEN
    RAISE EXCEPTION 'reschedule_not_found' USING ERRCODE = 'P0002';
  END IF;

  -- Idempotency (SERVICE-09): already approved → return existing row
  IF v_request.resolution = 'approved' THEN
    RETURN v_request;
  END IF;

  -- Cannot transition from already-resolved (rejected/withdrawn) into approved
  IF v_request.resolution IN ('rejected','withdrawn') THEN
    RAISE EXCEPTION 'reschedule_already_resolved' USING ERRCODE = 'P0001';
  END IF;

  -- Counterparty rule (SERVICE-08, Pitfall 4)
  IF p_actor = v_request.requested_by THEN
    RAISE EXCEPTION 'not_counterparty' USING ERRCODE = 'P0001';
  END IF;

  -- Authorization: actor must be the user_id or technician_id on the order
  IF p_actor = 'user' AND v_order.user_id <> p_actor_id THEN
    RAISE EXCEPTION 'forbidden_not_order_owner' USING ERRCODE = 'P0001';
  END IF;
  IF p_actor = 'technician' AND v_order.technician_id <> p_actor_id THEN
    RAISE EXCEPTION 'forbidden_not_order_owner' USING ERRCODE = 'P0001';
  END IF;

  -- Expected source status check (defense alongside conditional UPDATE)
  v_expected := CASE
    WHEN v_request.requested_by = 'user'       THEN 'reschedule_requested_by_user'
    WHEN v_request.requested_by = 'technician' THEN 'reschedule_requested_by_technician'
  END;
  IF v_order.status <> v_expected THEN
    RAISE EXCEPTION 'order_status_inconsistent' USING ERRCODE = 'P0001';
  END IF;

  -- Re-run full validation chain (VALID-09, Pitfall 5)
  IF v_request.proposed_scheduled_date <= CURRENT_DATE THEN
    RAISE EXCEPTION 'request_expired' USING ERRCODE = 'P0001';
  END IF;
  IF v_request.original_scheduled_date < CURRENT_DATE THEN
    RAISE EXCEPTION 'request_expired' USING ERRCODE = 'P0001';
  END IF;

  PERFORM pg_advisory_xact_lock(hashtext(v_order.technician_id::text || v_request.proposed_scheduled_date::text));

  SELECT active INTO v_avail
    FROM availability_templates
    WHERE technician_id = v_order.technician_id
      AND day_of_week   = EXTRACT(DOW FROM v_request.proposed_scheduled_date)::int
    LIMIT 1;
  IF v_avail IS DISTINCT FROM TRUE THEN
    RAISE EXCEPTION 'tech_unavailable' USING ERRCODE = 'P0001';
  END IF;

  SELECT COUNT(*) INTO v_holiday
    FROM calendar_exceptions
    WHERE technician_id = v_order.technician_id
      AND date          = v_request.proposed_scheduled_date;
  IF v_holiday > 0 THEN
    RAISE EXCEPTION 'tech_unavailable' USING ERRCODE = 'P0001';
  END IF;

  SELECT COUNT(*) INTO v_active_count
    FROM orders
    WHERE technician_id  = v_order.technician_id
      AND scheduled_date = v_request.proposed_scheduled_date
      AND status         = 'accepted'
      AND active         = TRUE;
  IF v_active_count >= 5 THEN
    RAISE EXCEPTION 'cap_exhausted_for_date' USING ERRCODE = 'P0001';
  END IF;

  -- Atomic write: order date+status flip, request resolution flip
  UPDATE orders
    SET status         = 'accepted',
        scheduled_date = v_request.proposed_scheduled_date
    WHERE id = p_order_id AND status = v_expected
    RETURNING * INTO v_order;
  IF NOT FOUND THEN
    RAISE EXCEPTION 'order_status_changed_concurrently' USING ERRCODE = 'P0001';
  END IF;

  UPDATE reschedule_requests
    SET resolution  = 'approved',
        resolved_at = now()
    WHERE id = v_request.id AND resolution = 'pending'
    RETURNING * INTO v_request;
  IF NOT FOUND THEN
    RAISE EXCEPTION 'reschedule_resolution_changed_concurrently' USING ERRCODE = 'P0001';
  END IF;

  RETURN v_request;
END;
$$;

-- ----------------------------------------------------------------------------
-- 6. RPC: reschedule_reject (RPC-03)
--    Counterparty rejects (or system rejects via reason code).
--    Sets request resolution='rejected' with reject_reason; orders.status='accepted'.
--    Idempotent: if already rejected, returns existing row.
-- ----------------------------------------------------------------------------
CREATE OR REPLACE FUNCTION reschedule_reject(
  p_order_id uuid,
  p_actor    text,    -- 'user' | 'technician' | 'system'
  p_actor_id uuid,    -- nullable when p_actor='system'
  p_reason   text
) RETURNS reschedule_requests
LANGUAGE plpgsql SECURITY DEFINER AS $$
DECLARE
  v_order   orders%ROWTYPE;
  v_request reschedule_requests%ROWTYPE;
  v_expected text;
BEGIN
  SELECT * INTO v_order FROM orders WHERE id = p_order_id FOR UPDATE;
  IF NOT FOUND THEN
    RAISE EXCEPTION 'order_not_found' USING ERRCODE = 'P0002';
  END IF;

  SELECT * INTO v_request
    FROM reschedule_requests
    WHERE order_id = p_order_id
    ORDER BY created_at DESC
    LIMIT 1
    FOR UPDATE;
  IF NOT FOUND THEN
    RAISE EXCEPTION 'reschedule_not_found' USING ERRCODE = 'P0002';
  END IF;

  IF v_request.resolution = 'rejected' THEN
    RETURN v_request;
  END IF;

  IF v_request.resolution IN ('approved','withdrawn') THEN
    RAISE EXCEPTION 'reschedule_already_resolved' USING ERRCODE = 'P0001';
  END IF;

  -- Counterparty rule (system bypasses)
  IF p_actor IN ('user','technician') THEN
    IF p_actor = v_request.requested_by THEN
      RAISE EXCEPTION 'not_counterparty' USING ERRCODE = 'P0001';
    END IF;
    IF p_actor = 'user' AND v_order.user_id <> p_actor_id THEN
      RAISE EXCEPTION 'forbidden_not_order_owner' USING ERRCODE = 'P0001';
    END IF;
    IF p_actor = 'technician' AND v_order.technician_id <> p_actor_id THEN
      RAISE EXCEPTION 'forbidden_not_order_owner' USING ERRCODE = 'P0001';
    END IF;
  ELSIF p_actor <> 'system' THEN
    RAISE EXCEPTION 'invalid_actor' USING ERRCODE = 'P0001';
  END IF;

  -- VALID-08 reject reason: required, ≤500
  IF p_reason IS NULL OR length(trim(p_reason)) = 0 THEN
    RAISE EXCEPTION 'reason_required' USING ERRCODE = 'P0001';
  END IF;
  IF length(p_reason) > 500 THEN
    RAISE EXCEPTION 'reason_too_long' USING ERRCODE = 'P0001';
  END IF;

  v_expected := CASE
    WHEN v_request.requested_by = 'user'       THEN 'reschedule_requested_by_user'
    WHEN v_request.requested_by = 'technician' THEN 'reschedule_requested_by_technician'
  END;

  -- Restore order status (preserve scheduled_date — original retained)
  UPDATE orders
    SET status = 'accepted'
    WHERE id = p_order_id AND status = v_expected
    RETURNING * INTO v_order;
  IF NOT FOUND THEN
    RAISE EXCEPTION 'order_status_changed_concurrently' USING ERRCODE = 'P0001';
  END IF;

  UPDATE reschedule_requests
    SET resolution    = 'rejected',
        reject_reason = p_reason,
        resolved_at   = now()
    WHERE id = v_request.id AND resolution = 'pending'
    RETURNING * INTO v_request;
  IF NOT FOUND THEN
    RAISE EXCEPTION 'reschedule_resolution_changed_concurrently' USING ERRCODE = 'P0001';
  END IF;

  RETURN v_request;
END;
$$;

-- ----------------------------------------------------------------------------
-- 7. RPC: reschedule_withdraw (RPC-04)
--    Initiator only; sets resolution='withdrawn', restores orders.status='accepted'.
--    Idempotent: if already withdrawn, returns existing row.
-- ----------------------------------------------------------------------------
CREATE OR REPLACE FUNCTION reschedule_withdraw(
  p_order_id uuid,
  p_actor    text,
  p_actor_id uuid
) RETURNS reschedule_requests
LANGUAGE plpgsql SECURITY DEFINER AS $$
DECLARE
  v_order   orders%ROWTYPE;
  v_request reschedule_requests%ROWTYPE;
  v_expected text;
BEGIN
  SELECT * INTO v_order FROM orders WHERE id = p_order_id FOR UPDATE;
  IF NOT FOUND THEN
    RAISE EXCEPTION 'order_not_found' USING ERRCODE = 'P0002';
  END IF;

  SELECT * INTO v_request
    FROM reschedule_requests
    WHERE order_id = p_order_id
    ORDER BY created_at DESC
    LIMIT 1
    FOR UPDATE;
  IF NOT FOUND THEN
    RAISE EXCEPTION 'reschedule_not_found' USING ERRCODE = 'P0002';
  END IF;

  IF v_request.resolution = 'withdrawn' THEN
    RETURN v_request;
  END IF;

  IF v_request.resolution IN ('approved','rejected') THEN
    RAISE EXCEPTION 'reschedule_already_resolved' USING ERRCODE = 'P0001';
  END IF;

  -- Initiator-only
  IF p_actor <> v_request.requested_by THEN
    RAISE EXCEPTION 'not_initiator' USING ERRCODE = 'P0001';
  END IF;
  IF p_actor = 'user' AND v_order.user_id <> p_actor_id THEN
    RAISE EXCEPTION 'forbidden_not_order_owner' USING ERRCODE = 'P0001';
  END IF;
  IF p_actor = 'technician' AND v_order.technician_id <> p_actor_id THEN
    RAISE EXCEPTION 'forbidden_not_order_owner' USING ERRCODE = 'P0001';
  END IF;

  v_expected := CASE
    WHEN v_request.requested_by = 'user'       THEN 'reschedule_requested_by_user'
    WHEN v_request.requested_by = 'technician' THEN 'reschedule_requested_by_technician'
  END;

  UPDATE orders
    SET status = 'accepted'
    WHERE id = p_order_id AND status = v_expected
    RETURNING * INTO v_order;
  IF NOT FOUND THEN
    RAISE EXCEPTION 'order_status_changed_concurrently' USING ERRCODE = 'P0001';
  END IF;

  UPDATE reschedule_requests
    SET resolution  = 'withdrawn',
        resolved_at = now()
    WHERE id = v_request.id AND resolution = 'pending'
    RETURNING * INTO v_request;
  IF NOT FOUND THEN
    RAISE EXCEPTION 'reschedule_resolution_changed_concurrently' USING ERRCODE = 'P0001';
  END IF;

  RETURN v_request;
END;
$$;

-- ----------------------------------------------------------------------------
-- 8. RPC: auto_reject_if_expired (RPC-05)
--    Idempotent helper; safe to call on every read/write entry point.
--    Rejects pending request when:
--      a) now > created_at + response_window_hours        → 'auto_rejected_timeout'
--      b) original_scheduled_date < CURRENT_DATE          → 'auto_rejected_original_date_passed'
--    NOTE: Availability-changed auto-reject runs in TS (loadAndReconcile) because it
--          requires cross-table reads not relevant to a strict timeout sweep; this RPC
--          handles the two pure-time conditions atomically.
--    Returns NULL when no action is taken; otherwise the rejected row.
-- ----------------------------------------------------------------------------
CREATE OR REPLACE FUNCTION auto_reject_if_expired(
  p_order_id uuid
) RETURNS reschedule_requests
LANGUAGE plpgsql SECURITY DEFINER AS $$
DECLARE
  v_order   orders%ROWTYPE;
  v_request reschedule_requests%ROWTYPE;
  v_reason  text;
  v_expected text;
BEGIN
  SELECT * INTO v_order FROM orders WHERE id = p_order_id FOR UPDATE;
  IF NOT FOUND THEN
    RETURN NULL;
  END IF;

  SELECT * INTO v_request
    FROM reschedule_requests
    WHERE order_id = p_order_id AND resolution = 'pending'
    LIMIT 1
    FOR UPDATE;
  IF NOT FOUND THEN
    RETURN NULL;
  END IF;

  -- Determine reason
  IF now() > v_request.created_at + (v_request.response_window_hours || ' hours')::interval THEN
    v_reason := 'auto_rejected_timeout';
  ELSIF v_request.original_scheduled_date < CURRENT_DATE THEN
    v_reason := 'auto_rejected_original_date_passed';
  ELSE
    RETURN NULL;
  END IF;

  v_expected := CASE
    WHEN v_request.requested_by = 'user'       THEN 'reschedule_requested_by_user'
    WHEN v_request.requested_by = 'technician' THEN 'reschedule_requested_by_technician'
  END;

  -- Conditional update: only flip the order status if it is in the expected reschedule state
  IF v_order.status = v_expected THEN
    UPDATE orders
      SET status = 'accepted'
      WHERE id = p_order_id AND status = v_expected;
  END IF;

  UPDATE reschedule_requests
    SET resolution    = 'rejected',
        reject_reason = v_reason,
        resolved_at   = now()
    WHERE id = v_request.id AND resolution = 'pending'
    RETURNING * INTO v_request;

  RETURN v_request;
END;
$$;

-- ----------------------------------------------------------------------------
-- 9. Grants — make RPCs callable via the supabase service role
-- ----------------------------------------------------------------------------
GRANT EXECUTE ON FUNCTION reschedule_create(uuid, text, uuid, date, text)             TO service_role;
GRANT EXECUTE ON FUNCTION reschedule_approve(uuid, text, uuid)                        TO service_role;
GRANT EXECUTE ON FUNCTION reschedule_reject(uuid, text, uuid, text)                   TO service_role;
GRANT EXECUTE ON FUNCTION reschedule_withdraw(uuid, text, uuid)                       TO service_role;
GRANT EXECUTE ON FUNCTION auto_reject_if_expired(uuid)                                TO service_role;

COMMIT;
