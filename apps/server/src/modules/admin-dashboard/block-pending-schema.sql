-- Phase 2 — order-aware deferred block.
-- Applied via Supabase migration `account_block_pending_and_finalize_trigger`.
-- Reference copy (matches the reschedule-schema.sql / technician-status-schema.sql convention).
--
-- `block_pending` is the "deferred block" flag: set when an admin blocks an
-- account that still has in-flight orders. The existing users.blocked /
-- technicians.status='blocked' remain the FULLY-blocked signal that mid-session
-- enforcement (auth middlewares + refresh re-gate) checks. A block_pending
-- account can still finish its current orders but cannot start new ones.

alter table users add column if not exists block_pending boolean not null default false;
alter table technicians add column if not exists block_pending boolean not null default false;

-- When an order reaches a terminal status, if either party is block_pending and
-- now has no remaining active (non-terminal) orders, flip them to fully blocked.
-- Atomic with the order transition; catches every terminal path.
create or replace function fn_finalize_block_on_order_terminal()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
declare
  terminal order_status[] := array[
    'completed','declined_by_technician','cancelled_no_fee','cancelled_with_fee',
    'rejected','cancelled','cancelled_by_user','cancelled_by_technician'
  ]::order_status[];
begin
  if not (NEW.status = any(terminal)) then
    return NEW;
  end if;
  if OLD.status = any(terminal) then
    return NEW;
  end if;

  if NEW.user_id is not null then
    update users u
       set blocked = true,
           block_pending = false,
           blocked_at = coalesce(u.blocked_at, now())
     where u.id = NEW.user_id
       and u.block_pending = true
       and not exists (
         select 1 from orders o
          where o.user_id = NEW.user_id
            and o.id <> NEW.id
            and not (o.status = any(terminal))
       );
  end if;

  if NEW.technician_id is not null then
    update technicians t
       set status = 'blocked',
           block_pending = false,
           blocked_at = coalesce(t.blocked_at, now())
     where t.id = NEW.technician_id
       and t.block_pending = true
       and not exists (
         select 1 from orders o
          where o.technician_id = NEW.technician_id
            and o.id <> NEW.id
            and not (o.status = any(terminal))
       );
  end if;

  return NEW;
end;
$$;

drop trigger if exists trg_finalize_block_on_order_terminal on orders;
create trigger trg_finalize_block_on_order_terminal
after update of status on orders
for each row
execute function fn_finalize_block_on_order_terminal();

-- admin_technician_stats also selects t.block_pending (appended last) so the
-- admin dashboard can show "block scheduled".
