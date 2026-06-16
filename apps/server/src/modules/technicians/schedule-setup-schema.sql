-- Reference copy of the migration applied to Supabase (project duzxglzhzhtpulhtlcpg)
-- via apply_migration "add_schedule_setup_completed_at_to_technicians".
-- Backs the first-run schedule onboarding gate: a technician sees the Lottie
-- onboarding only while this timestamp is null. getTechnicianSelf reads it and
-- completeScheduleSetup stamps it (idempotently — only when still null).

alter table public.technicians
  add column if not exists schedule_setup_completed_at timestamptz;

-- Backfill: existing technicians who have ever saved any availability template
-- rows are treated as having completed setup, so they skip first-run onboarding.
-- Completion = "has saved ANY template rows" (not "has active days"): the setup
-- flow is valid even with zero working days, and saves persist active=false rows,
-- so an `active = true` filter would wrongly re-onboard a tech who turned every
-- day off. Technicians with no template rows at all stay null and see onboarding.
update public.technicians t
set schedule_setup_completed_at = now()
where schedule_setup_completed_at is null
  and exists (
    select 1 from public.availability_templates a
    where a.technician_id = t.id
  );
