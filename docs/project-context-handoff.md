# Second Viewing — Project Context Handoff

Last updated: August 16, 2026

This file is the durable source of truth for continuing the project after a context reset. Read it together with `AGENTS.md` before making changes.

## Project and architecture

- Workspace: `/Users/AndreVice/Desktop/Juhaina Editorial`
- Stack: Next.js 16.3, React 19, Supabase, and a custom central administration interface.
- Local development URL: `http://localhost:3000`
- Staging URL: `https://second-viewing-staging.vercel.app`
- Supabase project is linked and `.env.local` is configured. Do not add credentials or client login details to documentation or source control.
- The client uses one central backend to manage all four editorial subsites.
- Supabase Free is the accepted production starting point. Its possible inactivity pause is acceptable for the expected low traffic.
- Draft recovery, editing after publication, deletion, and publication flows are expected throughout the administration interface.

## Required working conventions

- Read `AGENTS.md` before coding.
- For Next.js work, read the relevant local documentation in `node_modules/next/dist/docs` before changing application code.
- Preserve unrelated user work and existing local drafts.
- After a meaningful UX, UI, accessibility, motion, content-design, or authoring decision, append an entry to `docs/portfolio-ux-ui-log.md`.
- Validate meaningful code changes with `npm run typecheck` and `npm run build`.

## Locked homepage decisions

- Films: VCR 3D object.
- Moodboards: Camellia flower 3D object.
- Lists: PSX Nokia 3D object.
- Projections: cigarette-box 3D object.
- Typeface: Syne Mono.
- Label scale: 75%.
- 3D icon scale: 100%.
- Standard object rotation period: 10 seconds.
- The VCR uses a slower exception so its perceived angular speed matches the smaller objects.

## Film Thoughts and Criticisms

### Public design

- The film index and article template are design-finalized.
- PP Mori is used for headings and Cardo for body/editorial text.
- Header centers “Second Viewing”; the search icon expands into search.
- Featured articles use a restrained `Featured` label.
- Dates use spelled-out formatting.
- Index images have rounded frames, a white ground, and editorial captions.
- Pagination is centered.
- The experimental film-grain overlay was removed; the page background is white.
- Article pages have a persistent header, centered title and subtitle, a restrained gray subtitle, and a 2 × 2 related-article footer.

### Administration

- Supports header, subheader, cover image, and body text.
- Cover images support upload, drag-to-position, and zoom/pinch-to-zoom.
- Supports autosaved recovery drafts, editing, deletion, and publication.

## Lists

### Public design

- Permanent dark mode using `#191514`.
- Typeface: Libre Caslon Text.
- Artwork scale: 115%.
- Carousel completes a rotation in 45 seconds.
- Lists can contain up to 20 items.
- Rankings are optional; unranked lists preserve manual order.
- Type, period, creator label, and artwork format are customizable.
- Supported presentation formats include 2:3 movie poster, book-cover proportions, square album artwork, and 16:9 landscape artwork.
- A 16:9 artwork selection conditionally exposes its appropriate title treatment.
- Optional external links appear only in the expanded poster/detail view and only when supplied.
- Custom type and period values appear in public filters.

### Administration

- Supports draft recovery, editing, deletion, publication, reordering, and image upload.
- List settings use a 1 × 2 × 2 layout: title; type/period; creator type/poster format.
- Matching/related-list logic was deliberately deferred to version 2.
- Mobile carousel refinement was accepted for version 2; the current mobile layout is serviceable but not final.

## Moodboards

### Public design

- `/moodboards` uses card-stack browsing organized by editable categories.
- Supports light and dark themes with simple sun/moon controls.
- Directional arrows respond to viewport size.
- Clicking an open moodboard closes it.
- Category labels stay outside the card and remain stable across responsive sizes.

### Administration routes

- Moodboard library: `/admin/moodboards`
- New moodboard: `/admin/moodboards/new?draft=new`

### Administration capabilities

- The client can add, edit, delete, and reorder categories.
- A moodboard can be moved between categories.
- The editor accepts JPG/JPEG, PNG/APNG, WebP, AVIF, HEIC/HEIF, TIFF, and BMP. GIF upload is intentionally rejected.
- Complete images are placed on a 16:9 canvas; transparent PNG backgrounds remain transparent.
- A background color is required and can be set with a color picker or exact hex value.
- Layers can be positioned freely, scaled proportionally with corner handles, rotated, and assigned opacity.
- Rotation and opacity use typed numeric values rather than sliders.
- Layers support visibility, locking, right-click duplicate/delete, Cmd/Ctrl+D, Delete/Backspace, and undo.
- Fullscreen editing uses the native fullscreen canvas. A compact, draggable inspector contains background, layers, image-add, visibility, locking, numeric controls, and undo.
- Category dropdown choices update after category edits.

## Current focus: Projections

Moodboards is complete for the current release scope, including full-screen
zoom, bounded panning, full-row layer sorting, draft recovery, and a compact
draggable Canvas Controls palette. `npm run typecheck` and `npm run build`
passed after the final changes.

Important local-state caution:

- The current local moodboard draft contains three layers. Do not delete it or
  overwrite its browser storage while testing other areas.

The current subsite is Projections. Its approved R1 paired-column public index
and six fixture reader routes are now implemented, responsive, and
browser-verified. The Projection database, APIs, protected admin library/editor,
draft recovery, asset workflow, publication system, and promoted-revision data
adapter remain unbuilt. Start with `docs/projections-handoff.md`; it contains
the implemented files and evidence, locked public direction, remaining content
model decisions, next build order, acceptance checklist, and safe deployment
context.

## Deferred version 2 work

- More polished Lists mobile composition and density.
- Moodboard blend modes; opacity is the version 1 control.
- Matching/related lists.
- Any broader refinement that is not necessary for reliable authoring and launch.

## Additional site-wide reminder

- A reusable logo at the top-left of every subsite should eventually return visitors to the main four-subsite homepage. The logo itself still needs to be designed.
