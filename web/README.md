# VenShares web (Next.js)

Production app for VenShares: marketing site, Supabase Auth, projects, file uploads to Supabase Storage.

## Supabase CLI (link this folder to your cloud project)

From the **`web`** directory (where `supabase/config.toml` lives):

1. **Log in** (if needed): `supabase login`
2. **Link** to the project you use in the dashboard:  
   `supabase link --project-ref <YOUR_PROJECT_REF>`  
   Find **Reference ID** under **Project Settings → General** (also the subdomain of `https://<ref>.supabase.co`).
3. Optional: `supabase projects list` — confirm the ref you expect.
4. **Deploy Edge Functions:** `supabase functions deploy send-email`
5. **Push migrations** to the linked remote: `supabase db push`  
   (Uses the cloud database; you do **not** need Docker running for `link`, `db push`, or `functions deploy`. Docker is only for **local** `supabase start` / `supabase status`.)

After linking, the CLI targets this project for deploy/push until you `supabase unlink` or link another ref.

## Setup

1. Copy [`.env.example`](./.env.example) to `.env.local` and set:

   - `NEXT_PUBLIC_SUPABASE_URL`, `NEXT_PUBLIC_SUPABASE_ANON_KEY`
   - `CONTACT_FUNCTION_URL`, `CONTACT_FORM_KEY` (must match your Edge Function `CONTACT_FORM_KEY` and header `X-Contact-Form-Key`)
   - Optional: `SENTRY_DSN`, `NEXT_PUBLIC_SENTRY_DSN`

2. Apply database migrations (Supabase SQL editor, or `supabase db push` from this repo):

   - [`supabase/migrations/001_initial_schema.sql`](./supabase/migrations/001_initial_schema.sql)
   - [`supabase/migrations/002_rate_limits.sql`](./supabase/migrations/002_rate_limits.sql)
   - [`supabase/migrations/003_rate_limits_lockdown.sql`](./supabase/migrations/003_rate_limits_lockdown.sql) — apply **after** deploying `send-email` with `SUPABASE_SERVICE_ROLE_KEY` set (see Security notes).

3. Confirm a **private** Storage bucket `project-files` exists (the migration inserts it).

4. Install and run: (from web directory)

   ```bash
   npm install
   npm run dev
   ```

   Open [http://localhost:3000](http://localhost:3000).

## Testing

- **Unit / API tests (no Supabase):** from the `web` directory run `npm test` (Vitest: contact route with mocked `fetch`, in-memory rate limiter).
- **RLS smoke test (real project):** with `.env.local` containing `NEXT_PUBLIC_SUPABASE_URL` and `NEXT_PUBLIC_SUPABASE_ANON_KEY`, run `npm run verify:rate-limits-rls`. Expect exit code 0 and a message that anon insert was blocked — if anon can insert, migration `003_rate_limits_lockdown` may not be applied.

## Security notes

- RLS enforces project and file access by `auth.uid()`; never put the **service role** key in the browser.
- Edge Function `send-email` uses **SUPABASE_SERVICE_ROLE_KEY** (Dashboard → Edge Functions → Secrets) only to read/write `rate_limits`; the anon key cannot access that table after migration `003`. Deploy the function with the secret **before** running `003_rate_limits_lockdown.sql`.
- Contact submissions go through [`src/app/api/contact/route.ts`](./src/app/api/contact/route.ts) so the form secret stays server-side.
- CSP and security headers are set in [`next.config.ts`](./next.config.ts).
- Registration collects **minimal** profile fields (no SSN/EIN/DOB in MVP).

## Reference

- Design tokens: [`../docs/DESIGN_TOKENS.md`](../docs/DESIGN_TOKENS.md)
- Legal / ICP outline: [`../docs/LEGAL_AND_ICP_OUTLINE.md`](../docs/LEGAL_AND_ICP_OUTLINE.md)
- Legacy Vite app: [`../old_website_code_for_reference/venshares-vite`](../old_website_code_for_reference/venshares-vite)
