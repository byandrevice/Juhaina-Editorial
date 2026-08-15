# Lists release-readiness audit — 2026-08-13

## Outcome

The Lists subsite is ready for a milestone staging deployment and the project
can move on to Moodboards after one authenticated staging smoke test. The public
carousel, Poster View, responsive scaling, local administration route,
TypeScript checks, and production build all passed.

## Evidence

- [Public carousel — desktop](public-desktop.jpg)
- [Poster View — tablet](poster-view-tablet.jpg)
- [Public carousel — mobile](public-mobile.jpg)
- [Improved mobile carousel](mobile-carousel-final.jpg)
- [Final dense mobile carousel](mobile-carousel-dense-final.jpg)
- [Improved mobile list view](mobile-list-final.jpg)
- [Improved mobile Poster View](mobile-poster-view-final.jpg)

## Verified in this pass

- The public `/lists/films/2024` route returns successfully and exposes all ten
  carousel items, both filters, the list title, and the alternate list view.
- Poster View opens from the carousel and presents the selected artwork, list
  context, title, creator, and year without clipping at a 1024 × 768 viewport.
- A 390 × 844 audit exposed excessive desktop-canvas downscaling. The carousel
  now preserves a larger, intentionally cropped halo; the list view occupies the
  full viewport with readable rows; and Poster View stacks its selected artwork
  and editorial details vertically.
- `/admin/lists/new` returns successfully in the local administration demo and
  renders the completed List Settings workflow.
- `npm run typecheck`, `npm run build`, and `git diff --check` pass.

## Staging gate

The local Supabase project is linked, but remote migration status could not be
read because the CLI does not currently have a Supabase access token. Confirm
that `202608130001_lists_admin.sql` has been pushed before deploying the matching
Vercel code. Then run one authenticated staging smoke test: create/recover a
draft, add and reorder items, publish, verify the public filter and Poster View,
edit and republish, and unpublish.

## Deferred, non-blocking work

- The public data layer intentionally falls back to prototype collections when
  Supabase is unavailable or contains no published Lists. Replace this with the
  approved production behavior before the final public launch.
- Design the shared top-left Second Viewing logo and home link during the later
  brand pass.
- The project-wide pause-tolerant public snapshot strategy remains a final
  production launch gate, not a blocker for this staging milestone.
- Multiple live titles for the same Type + Period remain a documented v2 idea.
