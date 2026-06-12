-- Reference copy of the migration applied to Supabase (project duzxglzhzhtpulhtlcpg)
-- via apply_migration "technician_status_and_admin_stats_view".
-- Adds the technician verification/block state and the admin aggregation view.

-- 1. status + block metadata on technicians.
--    status: pending  -> just signed up, awaiting admin verification (cannot log in)
--            verified -> active working technician (only state that may log in)
--            blocked  -> admin-blocked for misconduct (cannot log in)
--            rejected -> application turned down (cannot log in)
alter table technicians
  add column status text not null default 'pending'
    check (status in ('pending','verified','blocked','rejected')),
  add column blocked_reason text,
  add column blocked_at timestamptz,
  add column blocked_by text;

create index idx_technicians_status on technicians(status);

-- existing technicians are pre-verified (verify/reject applies to new signups only)
update technicians set status = 'verified';

-- 2. aggregation view: one row per technician, counts/sum computed in Postgres
--    (the admin list selects from this instead of shipping every order to Node).
--    The cancelled-status bucket is defined here.
create or replace view admin_technician_stats as
select
  t.id, t.created_at, t.first_name, t.last_name, t.email, t.phone,
  t.is_available, t.status, t.blocked_reason, t.blocked_at, t.blocked_by,
  t.category_id, t.years_experience,
  t.criminal_record, t.birth_certificate, t.national_id,
  c.name as category_name,
  (select a.city from addresses a
     where a.technician_id = t.id
     order by a.is_active desc nulls last, a.id limit 1) as city,
  trs.rating, trs.review_count,
  count(o.id)                                              as total_orders,
  count(*) filter (where o.status = 'completed')           as completed,
  count(*) filter (where o.status in
    ('cancelled','cancelled_by_user','cancelled_by_technician',
     'cancelled_no_fee','cancelled_with_fee','rejected',
     'declined_by_technician'))                            as cancelled,
  coalesce(sum(o.final_price)
    filter (where o.status = 'completed'), 0)              as revenue
from technicians t
left join categories c on c.id = t.category_id
left join technician_rating_stats trs on trs.technician_id = t.id
left join orders o on o.technician_id = t.id
group by t.id, c.name, trs.rating, trs.review_count;
