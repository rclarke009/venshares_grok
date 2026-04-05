---
name: Files area preview
overview: Add a **Preview** control next to **Open** on the project Files list, opening an accessible modal that shows inline previews for common types (images, PDF) and a clear fallback with **Open** for everything else—all in [`project-detail-client.tsx`](web/src/components/app/project-detail-client.tsx) using the existing Base UI dependency.
todos:
  - id: preview-helper
    content: Add getPreviewKind(fileName) and preview content branches (image / pdf / fallback)
    status: in_progress
  - id: base-ui-dialog
    content: Wire controlled @base-ui/react/dialog with backdrop, title, close, and scroll-safe body
    status: pending
  - id: preview-button
    content: Add Preview Button beside Open; guard empty signedUrl
    status: pending
isProject: false
---

# Files area: Preview + Open

## Current behavior

The Files section lives in [`web/src/components/app/project-detail-client.tsx`](web/src/components/app/project-detail-client.tsx). Each row renders only an **Open** anchor that uses the Supabase signed URL in a new tab (`target="_blank"`). Rows already have `file_name` and `signedUrl`; the [`files`](web/supabase/migrations/001_initial_schema.sql) table has **no** `content_type` column, so preview type must be inferred from the filename extension.

## Proposed UX

- **Open** — unchanged: opens the signed URL in a new tab (download / system handler).
- **Preview** — opens a **modal** on the same page with:
  - **Images** (e.g. `.jpg`, `.jpeg`, `.png`, `.gif`, `.webp`, `.svg`, `.bmp`): centered `<img src={signedUrl} alt={file_name} />` with `max-h` / `max-w` so it fits the viewport.
  - **PDF** (`.pdf`): `<iframe title={file_name} src={signedUrl} />` with a fixed tall height (e.g. `70vh`) and full width inside the modal body.
  - **Other types**: Short message (“No inline preview for this file type”) plus an **Open in new tab** control (same URL as Open).

If `signedUrl` is missing, disable or omit Preview (same practical constraint as a broken Open link).

## Implementation

1. **State** — `previewFile: Row | null` (or `{ file_name, signedUrl }`) toggled by Preview; closing the modal clears it.

2. **Modal** — Use [`@base-ui/react/dialog`](web/node_modules/@base-ui/react/package.json) (already in [`web/package.json`](web/package.json)): one controlled `Dialog.Root` at the end of the component with `open={!!previewFile}`, `onOpenChange` to clear state, `Dialog.Backdrop`, `Dialog.Popup` styled consistently with existing cards (`rounded-xl border bg-card`, padding, `max-w-*` / `max-h-*`, scroll if needed). Include a visible **Close** control (`Dialog.Close` + `Button`) per Base UI guidance for modal dialogs.

3. **Helpers** — Small pure functions in the same file (or `lib/file-preview.ts` if you prefer separation): `getPreviewKind(fileName)` → `'image' | 'pdf' | 'none'`; normalize extension with `toLowerCase()`.

4. **Row actions** — Next to the existing Open `<a>`, add a `Button` **Preview** that sets `previewFile` to that row (only when `signedUrl` is non-empty).

5. **Tests (optional)** — If you want coverage, add a tiny Vitest test for `getPreviewKind` only (fast, no Supabase). UI tests are optional given scope.

## Out of scope (unless you want them later)

- Storing `content_type` in Postgres on upload (more accurate than extension-only).
- Inline preview for Office docs, archives, or generic binary files (browser cannot reliably render these without a viewer service).
- **Video** (e.g. `.mp4` via `<video controls>`) — easy follow-up using the same modal pattern.

## Files to touch

| File | Change |
|------|--------|
| [`web/src/components/app/project-detail-client.tsx`](web/src/components/app/project-detail-client.tsx) | Preview button, dialog, kind helper, conditional `img` / `iframe` / fallback |

No migration or env changes required.
