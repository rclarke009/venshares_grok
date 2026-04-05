# VenShares web (Next.js)

Production app for VenShares: marketing site, Supabase Auth, projects, file uploads to Supabase Storage.

## Setup

1. Copy [`.env.example`](./.env.example) to `.env.local` and set:

   - `NEXT_PUBLIC_SUPABASE_URL`, `NEXT_PUBLIC_SUPABASE_ANON_KEY`
   - `CONTACT_FUNCTION_URL`, `CONTACT_FORM_KEY` (must match your Edge Function `CONTACT_FORM_KEY` and header `X-Contact-Form-Key`)
   - Optional: `SENTRY_DSN`, `NEXT_PUBLIC_SENTRY_DSN`

2. In the Supabase SQL editor (or CLI), run the migration:

   - [`supabase/migrations/001_initial_schema.sql`](./supabase/migrations/001_initial_schema.sql)

3. Confirm a **private** Storage bucket `project-files` exists (the migration inserts it).

4. Install and run: (from web directory)

   ```bash
   npm install
   npm run dev
   ```

   Open [http://localhost:3000](http://localhost:3000).

## Security notes

- RLS enforces project and file access by `auth.uid()`; never put the **service role** key in the browser.
- Contact submissions go through [`src/app/api/contact/route.ts`](./src/app/api/contact/route.ts) so the form secret stays server-side.
- CSP and security headers are set in [`next.config.ts`](./next.config.ts).
- Registration collects **minimal** profile fields (no SSN/EIN/DOB in MVP).

## Reference

- Design tokens: [`../docs/DESIGN_TOKENS.md`](../docs/DESIGN_TOKENS.md)
- Legal / ICP outline: [`../docs/LEGAL_AND_ICP_OUTLINE.md`](../docs/LEGAL_AND_ICP_OUTLINE.md)
- Legacy Vite app: [`../old_website_code_for_reference/venshares-vite`](../old_website_code_for_reference/venshares-vite)
