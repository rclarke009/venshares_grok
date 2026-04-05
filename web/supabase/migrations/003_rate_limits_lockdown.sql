-- rate_limits: no browser/anon access. Edge Function send-email uses service role (bypasses RLS).
-- Deploy the updated send-email function with SUPABASE_SERVICE_ROLE_KEY before applying this migration.

drop policy if exists "rate_limits_anon_insert" on public.rate_limits;
drop policy if exists "rate_limits_anon_select" on public.rate_limits;
drop policy if exists "rate_limits_anon_delete" on public.rate_limits;
