# VenShares — Design tokens (reference)

Source: [documents_for_reference/](../documents_for_reference/) PDFs/PNGs + legacy [venshares-vite](../old_website_code_for_reference/venshares-vite/) styles. Refine against `LandingPage.pdf` and role landings when extracting pixels.

## Brand colors (Tailwind theme names)

| Token | Hex | Usage |
|--------|-----|--------|
| `ven-green` | `#22c55e` | Primary actions, “Shares” accent, success |
| `ven-green-dark` | `#16a34a` | Hover states |
| `ven-blue` | `#3b82f6` | Links, secondary accents, gradients |
| `ven-blue-sky` | `#0ea5e9` | Hero gradients |
| `ven-dark` | `#111827` | Headings, footer |
| `ven-slate` | `#35424a` | Legacy header/footer (optional) |
| `ven-lime-ui` | `#a6e22e` | Legacy nav buttons (optional bridge from old site) |
| `ven-coral` | `#f25c2b` | Legacy login CTA (optional) |

## Typography

- **UI:** system-ui / `Inter` or `Segoe UI` stack; bold marketing headings; comfortable body line-height.
- **Logo wordmark:** “Ven” dark + “Shares” green (see design PDFs).

## Layout

- Marketing: full-width hero with blue–green gradient; white cards; generous whitespace.
- Auth: centered card, max-width ~400px, rounded-2xl shadow.
- Dashboard: grid of project cards; lime/green primary buttons aligned with brand.

## PDF → route map (implementation guide)

| Asset | Suggested route |
|--------|-----------------|
| `LandingPage.pdf` | `/` |
| `2 InventorsLanding.pdf` | `/invent` |
| `2b ProfessionalsLanding.pdf` | `/earn` |
| `Login.pdf` | `/login` |
| `CreateAccount*.pdf` | `/register` (+ role variants later) |
| Idea Arena / Project workspace PDFs | post-MVP routes |

## Assets

- Place logo SVG at `web/public/logo.svg` when available; until then use text wordmark component.
