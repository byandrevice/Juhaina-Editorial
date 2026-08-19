# Second Viewing — Projections Handoff

Last updated: August 16, 2026

## Purpose

This is the starting brief for the next chat continuing **Projections**, the
last Second Viewing subsite still under construction. Read this file together
with `AGENTS.md`, `docs/project-context-handoff.md`,
`docs/decision-log.md`, and the relevant local Next.js documentation before
changing application code.

Suggested opening message for a new chat:

> Read `AGENTS.md`, `docs/project-context-handoff.md`, and
> `docs/projections-handoff.md`. Continue the Projections vertical slice from
> the implemented R1 public index. Do not redesign that approved index or alter
> Film Thoughts. First confirm the remaining Projection taxonomy and
> author-facing metadata, then audit the Film Thoughts backend/editor patterns
> and propose the Projection-specific migration and authoring plan before
> writing database or admin code.

## Product role

Projections is the editorial section for **articles on pop culture and current
events**. It must become a complete authoring-to-public vertical slice, not
only a public landing page:

```text
Sign in → create projection draft → write and add cover image → save/reopen
→ preview → publish → share public URL → edit safely → republish or delete
```

The primary author is non-technical. Visible save state, draft recovery,
explicit publishing, safe editing after publication, useful errors, and clear
image status are required product behavior, not optional polish.

## Current implementation status

The approved R1 public direction is implemented and browser-verified. The
authoring/backend vertical slice is still unbuilt.

### Implemented public surface

- `/projections` now renders `components/projection-index.tsx` through
  `app/[section]/page.tsx`.
- The index uses the approved **R1 — Paired Columns, Dark Ground** direction:
  six equal-weight entries, a two-column 4:3 image/text grid on desktop, one
  image-left column at intermediate widths, and full-width 16:9 stacks below
  820px.
- Archivo is installed through `@fontsource-variable/archivo`, self-hosted as
  one 36 KB latin variable WOFF2, preloaded by `next/font/local`, and exposed as
  `--font-archivo`. Projections uses weights 400–500 only.
- `lib/projection-essays.ts` contains six newest-first representative fixtures,
  image focal points, reading times, and authored alt text.
- Six static `/projections/[slug]` reader routes exist through
  `app/projections/[slug]/page.tsx`. They make the index links functional and
  provide a restrained dark reader, but the reader is not yet connected to a
  Projection publication backend.
- The public index has no filtering, search, featured state, cards, badges,
  accent color, light mode, animation, or client-side state.
- Navigation was adapted to the four real Second Viewing sections—Films,
  Moodboards, Projections, and Lists—with Projections active. The supplied
  Books/Notebook/Index/About labels and `/films` entry URLs were treated as
  wireframe residue and were not used to alter the product architecture.
- The footer's “Earlier film writing — April 2026” link currently points to the
  existing `/films` index so it is functional.

### Representative-content boundary

- The current titles, film metadata, and body copy remain independent design
  fixtures; they do **not** approve a film-specific Projection database schema.
- All six Projection stills use the client-selected Mirror's Edge image set in
  `public/images/projections/mirrors-edge/`. The images are intentionally not
  matched semantically to the article text.
- Existing files under `public/images/film-placeholders/` remain owned by Film
  Thoughts and must not be deleted or renamed.
- The index requires a still to render an entry. There is no fallback still.
- Current displayed image dimensions:
  - desktop at 1200px and wider: **340 × 255 CSS px** (4:3);
  - 820–1199px: **260–340px wide** at 4:3;
  - below 820px: full content width at 16:9; at a 390px viewport this is
    **358 × 201.375 CSS px**.
- Recommended source upload remains at least **1600 × 900px**; the desktop
  frame crops it to 4:3 using the authored focal point.

### Still unbuilt

- Projections remains marked `Later` in the protected admin navigation and is
  a non-interactive `Coming later` dashboard card.
- There are no Projection database tables, migrations, Supabase queries,
  server data loaders, API routes, admin library/new/edit routes, editor,
  local recovery module, remote asset workflow, or publication RPC.
- Public content currently comes from local fixtures rather than promoted,
  immutable revisions. Draft privacy has not yet been exercised for this
  section.
- The homepage portal remains complete and links to `/projections`; its
  approved cigarette-box object was not changed.

### Files added or materially changed for R1

- `components/projection-index.tsx`
- `lib/projection-essays.ts`
- `app/projections/[slug]/page.tsx`
- `app/[section]/page.tsx`
- `app/layout.tsx`
- `app/globals.css`
- `package.json` and `package-lock.json`
- `design-qa.md`
- `docs/audits/projections-r1-2026-08-16/`
- `docs/decision-log.md` — D-018
- `docs/portfolio-ux-ui-log.md`
- `docs/font-licenses.md`

## Existing foundations to reuse—without cloning the public design

Film Thoughts is the operational foundation for this work. It already has:

- Supabase Auth allowlisting and the shared protected `/admin` shell;
- private `editorial-images` Storage and asset upload behavior;
- validated Tiptap JSON article bodies;
- a mutable working revision plus immutable published revision model;
- public signed-image URLs, cache revalidation, and safe fallback content;
- cover-image upload, drag positioning, and zoom/pinch-to-zoom;
- browser-local draft and image recovery;
- create, edit, delete, publish, and republish paths.

The relevant Film Thoughts files are:

- `components/admin/film-editor.tsx`
- `components/admin/film-content-list.tsx`
- `lib/admin/film-schema.ts`
- `lib/admin/films-server.ts`
- `lib/admin/draft-storage.ts`
- `lib/films-data.ts`
- `app/api/admin/films/route.ts`
- `app/api/admin/films/[id]/route.ts`
- `app/api/admin/films/[id]/publish/route.ts`
- `app/admin/(protected)/films/`
- `app/films/[slug]/page.tsx`
- `components/film-index.tsx`
- `supabase/migrations/202608110001_films_admin.sql`

Reuse the stable behavior and underlying patterns. Create Projection-specific
names, schemas, tables, routes, components, copy, and data modules rather than
renaming or weakening Film Thoughts. The project decision is one central admin
with **section-specific editors**, not a universal entry form.

## Locked product and architecture decisions

- The project is one Next.js 16.3 / React 19 application backed by one
  Supabase project and one central author account.
- Published revisions are immutable. Editing a live item changes a private
  working revision only; the author must explicitly republish to change the
  public route.
- Article bodies remain validated Tiptap JSON.
- Projections reuses the article document, image, and publication workflow from
  Films; it varies in public template and taxonomy.
- The admin remains calm, direct, and novice-friendly. The public site may be
  visually distinctive by section.
- Do not expose service-role credentials or commit `.env*` / `.vercel` files.
- Preserve unrelated work, especially the existing browser-local Moodboards
  draft with three layers.

## Approved public direction and reference material

The public index direction has been selected and implemented. Do not reopen a
broad visual-direction exercise unless the user explicitly requests one.

The original six planning screenshots remain available here:

`/Users/AndreVice/Desktop/Juhaina References/3 -  Projections - articles on pop culture and current events/`

The approved R1 source and implementation evidence are stored here:

- source: `docs/audits/projections-r1-2026-08-16/source-reference.png`
- final desktop: `docs/audits/projections-r1-2026-08-16/implementation-desktop-1440-final.png`
- mobile: `docs/audits/projections-r1-2026-08-16/implementation-mobile-390.png`
- normalized comparison:
  `docs/audits/projections-r1-2026-08-16/comparison-source-vs-implementation-final.png`
- focused header/first-row comparison:
  `docs/audits/projections-r1-2026-08-16/comparison-header-first-row-final.png`
- QA report: `design-qa.md` with `final result: passed`

The selected direction preserves these cues:

- dark cultural-publication ground and restrained navigation;
- newest-first chronology;
- equal editorial weight across six entries;
- dense paired image-and-text composition;
- wide negative space between columns;
- square-cornered archival imagery as the page's only color.

The implemented surface is readable, keyboard-operable, responsive, and
distinct from the white, rounded Film Thoughts presentation. It must retain
equal entry weight; do not add an asymmetric feature hierarchy, filtering, or
archive-grid mechanics without a new user decision.

Article color and typography references are also available in
`/Users/AndreVice/Desktop/Juhaina References/Article Colors` and
`/Users/AndreVice/Desktop/Juhaina References/Article References`.

## Decisions still required before backend/admin implementation

These are intentionally open. Do not silently choose a durable content model,
expand the approved index, or redesign the reader without first showing the
user a concise proposal.

1. **Editorial taxonomy** — confirm the category model for pop culture and
   current events: controlled categories, free tags, or a small combination.
   Decide whether filtering belongs on the first public index.
2. **Projection-specific metadata** — the plan requires a subject/category,
   article body, cover/inline assets, tags, and publication metadata. Confirm
   any additional author-facing fields before creating tables. Do not carry
   over Film-specific fields such as director, film year, or Featured by
   default.
3. **Fixture replacement and data adapter** — decide how the approved index's
   visible title, excerpt, subject line, date, image, alt text, and focal point
   map to promoted Projection revisions. Keep `readingTime` available for the
   reader but do not add it to the approved index without user approval.
4. **Reader scope** — the current reader route is functional but provisional.
   Confirm whether the next chat should only connect it to published data or
   also run a dedicated reader-design refinement.
5. **Archive behavior** — decide whether older writing will paginate by month
   or open a full archive index. Until then, preserve the current functional
   footer link to `/films`.

## Recommended build order

1. Confirm taxonomy, Projection-specific author fields, reader scope, and the
   fixture-to-revision mapping. Do not reopen the approved R1 index direction.
2. Audit the Film Thoughts schema, server helpers, editor, local recovery,
   asset upload, publication routes, admin navigation, and current Supabase
   migration state. Read the relevant Next.js 16.3 local documentation.
3. Present the data-model and authoring-flow recommendation and record approved
   durable decisions in `docs/decision-log.md` before writing the migration.
4. Add a Projection-specific Supabase migration with tables, immutable revision
   protection, RLS policies, publication RPC, and any carefully-scoped taxonomy
   support. Preview it with `npx supabase db push --dry-run` before applying it.
5. Build the Projection data layer and API endpoints: list/create, get,
   update/delete, and publish. Match Film Thoughts' authorization and error
   behavior.
6. Build the protected admin library, new/edit routes, local recovery, image
   handling, visible save state, validation, deletion, and publishing flow.
7. Replace the fixture adapter with promoted Projection revisions while
   preserving the approved index markup, visual tokens, ordering, responsive
   behavior, empty state, and shareable `/projections/[slug]` URLs.
8. Replace both admin `Later` states with active Projections navigation and a
   clear create action.
9. Run responsive, keyboard, reduced-motion, draft-privacy, and complete
   authoring-flow QA. Validate
   `npm run typecheck` and `npm run build`, then append meaningful decisions and
   validation evidence to `docs/portfolio-ux-ui-log.md`.

## Minimum acceptance checklist

### Public

- [x] `/projections` has a distinct, responsive editorial index with six
  equal-weight entries and real representative imagery.
- [x] Entry links are keyboard-operable, use one tab stop each, and open stable
  `/projections/[slug]` routes.
- [x] Reader fixtures use semantic hierarchy and authored cover-image alt text.
- [ ] Add a useful public empty state when fixture data is replaced.
- [ ] Connect index and reader routes to promoted immutable revisions only;
  prove that working drafts never leak publicly.
- [ ] Add taxonomy/filtering only if the remaining content-model decision
  approves it. The selected R1 index currently has no filters.

### Admin

- [ ] The author can create, save, reopen, edit, delete, publish, and republish a
  Projection without technical assistance.
- [ ] Browser-local recovery protects text and any selected source image; remote
  saving is the canonical source once Supabase is configured.
- [ ] An author can distinguish draft, saved, published, and published-with-changes
  states.
- [ ] Cover assets are positioned safely and require useful alt text at publication
  if an image is used.

### Safety and quality

- No migration rewrites or weakens existing Films, Lists, Moodboards, assets,
  auth, Storage, or RLS behavior.
- Any pending remote migration is previewed before applying; never use a remote
  database reset for this work.
- Existing homepage portals, Films, Lists, and Moodboards still work after each
  meaningful change.
- TypeScript and the production build pass. Browser evidence captures the
  approved public direction and core authoring loop.

## Latest validation evidence

- `npm run typecheck`: passed after the final Archivo weight-range adjustment.
- `npm run build`: passed; all six `/projections/[slug]` fixture routes were
  statically generated.
- Desktop browser QA: 1440 × 1100 CSS viewport; measured 40px insets, two 650px
  columns, 60px column gap, 340 × 255 images, and no horizontal overflow.
- Mobile browser QA: 390 × 844 CSS viewport; measured 358 × 201.375 first image,
  44px navigation targets, 22px entry titles, and no horizontal overflow.
- Index-to-reader navigation passed. Browser console had no errors. Next
  development mode emitted one non-blocking LCP heuristic warning for the third
  image after cache/reload; the implementation intentionally follows the
  supplied requirement to eager-load only the first two entries.
- The local development server was left running at `http://localhost:3000` at
  handoff time, but a new chat must verify server state rather than assume it.
- `git diff --check` passed.

## Deployment and repository context

- Workspace: `/Users/AndreVice/Desktop/Juhaina Editorial`
- GitHub repository: `https://github.com/byandrevice/jkhan-website`
- Staging URL: `https://second-viewing-staging.vercel.app`
- The local project has an existing Vercel link to `second-viewing-staging`.
- As of August 16, 2026, the user successfully applied
  `202608140001_moodboards_admin.sql` to the linked Supabase project. Run
  `npx supabase migration list` before creating or pushing a new Projection
  migration.

## Deferred work that should remain deferred

- Moodboard blend modes; opacity is the version 1 control.
- Matching/related Lists and further Lists mobile refinement.
- A reusable logo that links every subsite back to the homepage.
- Any broad redesign of already-approved Films, Lists, Moodboards, or homepage
  portals while implementing Projections.
