# VenShares — Phase 0: Legal / ICP outline

This is a working outline for counsel and product—not legal advice.

## Securities and “shares”

- [ ] Define what “shares” means in-product: contractual profit interest, cap table equity, options, or internal points only.
- [ ] If any fundraising or passive returns are implied, engage securities counsel (US: SEC / state; other jurisdictions as needed).
- [ ] “INVEST” navigation: decide MVP behavior—placeholder copy vs accredited-only flow vs removal until counsel approves.

## Data and privacy

- [ ] Data map: which PII is collected, where stored, retention, deletion process.
- [ ] MVP minimizes registration fields (no SSN/EIN/DOB unless required and approved).
- [ ] Privacy policy and terms of service drafts before public launch.

## ICP (beachhead) — to confirm

- **Placeholder hypothesis:** Physical-product inventors matched with technical professionals in a single region or vertical (adjust when confirmed).
- [ ] Primary customer: inventor-led vs professional-led acquisition.
- [ ] One channel test (e.g., community, paid ads, partnerships) for first 10 projects.

## Threat modeling (STRIDE) — starter prompts

- **Spoofing:** Supabase Auth session theft—use HTTPS, secure cookies, `@supabase/ssr` refresh.
- **Tampering:** RLS + signed URLs for storage; validate inputs server-side.
- **Repudiation:** Audit logs (Phase 2) for sensitive actions.
- **Information disclosure:** RLS on `projects` and `files`; no service role in client.
- **DoS:** Rate limits on auth-adjacent and contact endpoints; upload size limits.
- **Elevation:** Policies must not use tautologies (e.g., `org_id = org_id`); test negative cases.

## Deliverables checklist

- [ ] Counsel review scheduled or completed for invest/share copy.
- [ ] ICP paragraph finalized for marketing and onboarding.
- [ ] STRIDE notes updated after first production deploy.
