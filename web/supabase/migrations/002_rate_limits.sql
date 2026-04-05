-- Used by Edge Function send-email for per-IP rate limiting (anon key from the function).
create table if not exists public.rate_limits (
  id uuid primary key default gen_random_uuid(),
  ip_address text not null,
  timestamp timestamptz not null default now()
);

create index if not exists rate_limits_ip_timestamp_idx
  on public.rate_limits (ip_address, timestamp);

alter table public.rate_limits enable row level security;

-- Edge Function authenticates via CONTACT_FORM_KEY before touching this table; the Supabase
-- client uses the project anon key (same as NEXT_PUBLIC_SUPABASE_ANON_KEY).
create policy "rate_limits_anon_insert"
  on public.rate_limits for insert
  with check (true);

create policy "rate_limits_anon_select"
  on public.rate_limits for select
  using (true);

create policy "rate_limits_anon_delete"
  on public.rate_limits for delete
  using (true);
