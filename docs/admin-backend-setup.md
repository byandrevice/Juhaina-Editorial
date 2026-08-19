# Second Viewing central admin setup

Last updated: 2026-08-14

## What is implemented

- One central `/admin` workspace for all four editorial sections.
- A complete Film Thoughts vertical slice at `/admin/films`.
- A complete Lists vertical slice at `/admin/lists`, including custom Type and
  Period labels, ranked or unranked presentation, 1–20 reorderable items, four
  artwork ratios, optional links, recovery, editing, and revision-safe
  publishing.
- A complete Moodboards vertical slice at `/admin/moodboards`: editable and
  reorderable categories, safe category transfer, a fixed 16:9 layer editor,
  proportional resizing, free positioning, rotation, opacity, layer ordering,
  draft recovery, flattened previews, and revision-safe publishing.
- A complete Projections vertical slice at `/admin/projections`, including
  section-specific metadata, rich-text bodies, cover uploads, browser recovery,
  immutable publication snapshots, unpublishing, and archiving.
- A protected `/admin/samples` screen that removes or restores each bundled
  portfolio sample independently without changing real client content.
- Email magic-link authentication with public registration disabled at the app
  layer (`shouldCreateUser: false`).
- A single allowlisted author enforced in the database with row-level security.
- Film drafts, immutable published snapshots, editing, republishing, and
  featured-post ordering.
- Private image uploads for JPG, PNG, WebP, AVIF, and GIF files up to 6 MB.
- Drag/drop selection, focal-point dragging, and keyboard-operable position
  sliders for the fixed public image frame.
- Constrained Tiptap JSON article bodies.
- Debounced browser recovery for every field and IndexedDB recovery for the
  local image file. A closed or refreshed window restores the last draft.
- Public Film Thoughts routes read promoted revisions from Supabase and retain
  the existing placeholder content when Supabase is not connected.

## Connect Supabase

1. Create one Supabase project for Second Viewing.
2. In the Supabase SQL editor, run
   `supabase/migrations/202608110001_films_admin.sql`.
   Then run `supabase/migrations/202608130001_lists_admin.sql` to activate Lists.
Then run `supabase/migrations/202608140001_moodboards_admin.sql` to activate
   Moodboards, followed by
   `supabase/migrations/202608190001_projections_and_sample_content.sql`.
3. In Authentication, create Juhaina's user with her approved email address.
   Do not enable public self-registration.
4. Run the final allowlist statement from the bottom of the migration, replacing
   `author@example.com` with that exact email address.
5. Add the local and production callback URLs to Supabase Auth redirect URLs:
   - `http://localhost:3000/auth/callback`
   - `https://YOUR-PRODUCTION-DOMAIN/auth/callback`
6. Copy `.env.example` to `.env.local` and add:
   - `NEXT_PUBLIC_SUPABASE_URL`
   - `NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY`
   - `ADMIN_EMAIL` (the same allowlisted email)
7. Restart the development server and open `/admin/sign-in`.

Never add the Supabase service-role key to this application. The browser and
server use the publishable key; database and Storage policies enforce access.

## Local QA sandbox

Set `LOCAL_ADMIN_DEMO=true` in `.env.local` to inspect the complete authoring
interface locally without signing into Juhaina's account. The sandbox stores
test drafts and image files only in the current browser. It cannot upload to
Supabase, alter central drafts, or publish. The flag is honored only while the
application is running in development mode and cannot enable a production
bypass.

Open `http://localhost:3000/admin` after restarting the development server. Use
this sandbox for layout, browser recovery, image positioning/zoom, validation,
and general UX reproduction. If a reported issue is specific to remote saving,
Storage upload, authentication, or publishing, use a separate allowlisted QA
user rather than Juhaina's account.

## Publication behavior

Saving updates the working revision. Publishing copies that working revision
into an immutable snapshot and promotes the snapshot to the public route. If a
published essay is edited, the public version remains unchanged until the
author deliberately publishes again.

The browser recovery copy is a safety net, not the canonical database record.
Once a draft is saved to Supabase, the central workspace is the source of truth.

Lists follows the same working-revision and immutable-publication model. Only
one live list may use a given Type + Period pair in v1. If another published
list already uses that pair, publication is stopped with a clear message; the
author can change either label, unpublish the existing list, or edit that list.
Multiple matching lists and a public title selector are reserved for v2.

Moodboards also follow this model. The editable revision retains every layer;
publishing creates immutable layer data plus an optimized preview and full-size
flattened WebP. The public browser reads only the promoted flattened output, so
collage complexity does not increase public rendering work.

## Hosting and low-traffic operation

The owner approved the Supabase Free plan for this low-traffic publication.
Free projects may pause after extended periods without sufficient database
activity. Juhaina may therefore need to resume the project from the Supabase
dashboard before using the administration workspace.

Before public launch, publishing must produce deployment-safe static copies of
live articles and their required images. Already-published public pages must
remain readable while Supabase is paused. This pause-tolerant public delivery is
a launch requirement and is not yet implemented.

## Media behavior

Uploaded images live in the private `editorial-images` bucket. Only the
allowlisted author can upload and manage files. Public reads are permitted only
when an asset is attached to a promoted Film revision. Crop settings are stored
as horizontal and vertical percentages, so the composition remains stable
across responsive image frames.

List artwork uses the same private bucket and upload rules. Artwork is optional;
when supplied, the editor requires a useful image description. The author can
drag and zoom the image inside the selected `2:3`, `5:8`, `1:1`, or `16:9`
frame. External links are optional and appear only in the expanded Poster View.

Moodboard sources may be JPG/JPEG, PNG/APNG, WebP, AVIF, HEIC/HEIF, TIFF, or
BMP up to 25 MB. GIF is deliberately rejected. Accepted source files are
normalized to static WebP while preserving transparency. Drafts can be saved
before descriptions are complete, but publishing requires a description for
every image layer. Local recovery stores the composition and its source files
so duplicated layers also survive an accidental close or reload.
