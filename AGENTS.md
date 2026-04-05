# AGENTS.md

## Cursor Cloud specific instructions

### Project Overview

VenShares is a React + TypeScript + Vite SPA that connects inventors with skilled professionals. The backend is Supabase (BaaS) — there is no custom backend server.

The application code lives in `old_website_code_for_reference/venshares-vite/`. All npm commands (install, dev, lint, build) must be run from that directory.

### Running the App

- **Dev server**: `npm run dev` (from `old_website_code_for_reference/venshares-vite/`)
- The Vite dev server serves the app at `http://localhost:5173/proposedSite/` (note the `/proposedSite/` base path configured in `vite.config.ts`).
- **Lint**: `npm run lint`
- **Build**: `npm run build` (runs `tsc -b && vite build`)

### Environment Variables

The app requires Supabase credentials via environment variables. Create a `.env.local` file in the `old_website_code_for_reference/venshares-vite/` directory:

- `VITE_SUPABASE_URL` — Supabase project URL (required for backend features)
- `VITE_SUPABASE_ANON_KEY` — Supabase anonymous API key (required for backend features)

Without real Supabase credentials, the frontend renders and navigates correctly, but auth/database operations will fail.

### Key Gotchas

- The Vite config sets `base: '/proposedSite/'`, so all routes are prefixed with `/proposedSite/`. Navigating to `http://localhost:5173/` alone will 404 — use `http://localhost:5173/proposedSite/` instead.
- There are pre-existing lint errors (unused variable in `ContactPage.tsx`, missing dependency in `RegisterPage.tsx` useEffect). These are in the existing codebase, not introduced by setup.
- The `supabase/` directory contains Edge Functions (`send-email`, `contact-email`) that run on Deno. These are optional and only needed for email functionality.
- No database migrations exist (`schema_paths` in `supabase/config.toml` is empty). Tables would need manual creation or Supabase dashboard setup.
