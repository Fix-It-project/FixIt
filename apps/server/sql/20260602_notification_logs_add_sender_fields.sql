alter table if exists public.notification_logs
  add column if not exists sender_name text,
  add column if not exists sender_image_url text;
