-- Flip-phone launcher unlock codes: devices seen + verify attempts.
-- Only the server functions (service role) touch these; no anon/authenticated access.

create table if not exists public.launcher_devices (
  device_id  text primary key,
  model      text,
  label      text,
  last_seen  timestamptz not null default now()
);

create table if not exists public.launcher_attempts (
  id          bigserial primary key,
  device_id   text not null,
  ok          boolean not null,
  ip          text,
  created_at  timestamptz not null default now()
);

create index if not exists launcher_attempts_device_time
  on public.launcher_attempts (device_id, created_at desc);

alter table public.launcher_devices  enable row level security;
alter table public.launcher_attempts enable row level security;
-- No policies on purpose: anon and authenticated roles get nothing.
revoke all on public.launcher_devices, public.launcher_attempts from anon, authenticated;
