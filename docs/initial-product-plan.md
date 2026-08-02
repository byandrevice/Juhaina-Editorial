# Initial product and architecture plan

Last updated: 2026-08-01

## Executive recommendation

Build one Next.js application with two intentionally different surfaces:

- A custom public editorial site with a dimensional portal homepage and four
  section worlds.
- A calm shadcn/ui authoring area backed by Supabase Postgres, Auth, and Storage.

Use structured, revisioned content. Validate the moodboard coordinate model in
an isolated DOM-based spike before production UI. Then build Films end to end as
the first complete authoring-to-reading slice.

D-003 in `decision-log.md` was approved by the owner on 2026-08-01. Do not begin
the broad implementation until the actual repository is located or created and
the remaining visual/content inputs listed below are assigned.

## 1. Repository and reference audit

### Repository evidence

- The supplied workspace root was `/Users/AndreVice`, which is not a Git
  repository.
- The initial audit found no matching application, package manifest, source
  directory, or deployment configuration under the accessible workspace using
  the brief's vocabulary.
- Existing repositories (`team-finder`, `epl_score_predictor`, `backend`, and
  repositories under `repos`) are unrelated and were left untouched.
- The only discovered `AGENTS.md` belongs to the unrelated `team-finder`
  project.
- On 2026-08-01, `/Users/AndreVice/Desktop/Juhaina Editorial` was initialized as
  the new production Git repository on branch `main`. It currently contains
  planning documentation and no application implementation.

### Reference evidence

The source-of-truth folder is `/Users/AndreVice/Desktop/Juhaina References`.
It contains 15 PNG screenshots:

- Films: five references.
  - Contributes editorial card rhythm, alternating image/text layouts, ruled
    grids, serif/sans contrast, excerpts, strong criticism taxonomy, and clear
    active navigation.
  - The most useful shared qualities are readable hierarchy, image-led pacing,
    and generous but structured negative space.
- Projections: five references.
  - Contributes masthead scale, dense cultural-publication navigation, filter
    taxonomies, chronology, asymmetric feature hierarchy, and archival image
    grids.
  - The spatial archive reference is useful as a composition cue, not as a
    default reading interaction.
- Lists: four references.
  - Contributes orbiting images, circular groupings, layered card depth, and a
    sense of a curated collection.
  - These images do **not** specify ranked-list semantics, item hierarchy,
    filtering, or long-list reading. A ranked-list design still needs explicit
    exploration.
- Overview: one OriginKit Spiral Images screenshot.
  - Contributes a restrained vocabulary for orbit, scale falloff, spacing,
    radius, and speed. It should be adapted as inspiration, not copied as a
    wholesale component.
- The `0 - Home Page` and `2 - Moodboard` folders are empty. Portal-object art,
  homepage composition, public moodboard presentation, and editor references
  remain missing.

### Available design-review capability

The requested planning skill was used. The named Jakub Krehel interface skills
and Emil Kowalski prototyping/motion skills were not installed in this session;
their requested concerns are represented by the typography, accessibility,
motion, prototype, and review criteria below.

## 2. Evidence, decisions, assumptions, unknowns, and non-goals

### Opportunity statement

For a nontechnical single author, this product helps her turn writing, image
collections, and ranked recommendations into a polished public page when she
has something to share, without asking a developer to format, deploy, or revise
it.

### Behavioral model

- Primary user: The author.
- Trigger: She has a finished thought, a developing draft, a visual collection,
  or a ranked recommendation to share with friends and followers.
- Starting state: Content exists in her head, notes, a document, or an image
  folder.
- Desired ending state: A reviewed, shareable public URL that still feels like
  her work.
- Assumed current workaround: Social posts, notes/documents, and developer
  assistance. This has not been validated.
- Main anxieties: Losing work, breaking layout, publishing accidentally, and
  not knowing which version is live.
- Trust requirements: Visible save state, explicit preview and publish actions,
  safe editing of already-published work, undo/version recovery, and clear
  image status.
- Definition of done: The live page is correct, shareable, and can be reopened
  and edited without help.

### Product spine

- Primary action: Create and publish an editorial entry.
- Primary object: A revisioned entry with assets and type-specific content.
- Primary result: A stable public page and a recoverable authoring record.
- Smallest complete loop: Sign in -> create draft -> add content and imagery ->
  save/reopen -> preview -> publish -> revisit -> edit or unpublish.
- Success signals:
  - The author publishes the first Film without technical assistance.
  - A saved draft reopens with no lost text, metadata, ordering, or placement.
  - The author can correctly identify draft, preview, and live states.
  - A published edit does not change the live page before republishing.
  - Public pages remain readable and operable at compact and wide viewports,
    with keyboard and reduced-motion settings.

### Confirmed decisions

- One public website, one codebase, and one content system.
- Four top-level sections: Films, Moodboards, Projections, and Lists.
- A homepage with four dimensional PNG portal objects.
- Expressive public site; predictable, novice-friendly admin.
- shadcn/ui is the admin foundation. Public pages are custom-designed.
- Lists support category and year filters and manual rank reordering.
- Moodboards support multi-upload, free placement, stacking, persistence,
  reopening, editing, republishing, and responsive presentation.
- Homepage depth starts with DOM/CSS/PNG techniques, not Three.js.
- The moodboard editor is prototyped before production commitment.
- Films is the first complete vertical slice.
- Loading, empty, error, draft, preview, published, and recovery states are part
  of each slice rather than final cleanup.

### Working assumptions

- Version one has one allowlisted author and no public account creation.
- English is the only authoring and reading language in version one.
- Public comments, reactions, community profiles, subscriptions, payments, and
  newsletters are out of scope.
- Real-time collaborative editing, offline authoring, and native mobile apps are
  out of scope.
- The owner will provide or approve publication rights for imagery and fonts.
- A managed web deployment is acceptable; there is no on-premise requirement.
- Public entry URLs should remain stable when content is republished.

### Critical unknowns

- Repository: Resolved on 2026-08-01. A new production repository was created at
  `/Users/AndreVice/Desktop/Juhaina Editorial`; there is no prior implementation
  to migrate.
- Architecture: Resolved on 2026-08-01. The owner approved the custom shadcn/ui
  administration app on Next.js + Supabase, accepting the additional initial
  work required for the novice-specific authoring experience.
- Permissions: Is there truly one author, or are editor/reviewer roles required?
  This changes RLS policies and workflow states.
- Authentication: Is an email magic link acceptable, or is password plus MFA
  required? Public self-registration should remain disabled.
- Content: What representative Film essay, imagery, list, and moodboard may be
  used for design and usability validation?
- Taxonomy: What do List category and year mean in practice, and can a list have
  more than one category/year?
- Moodboards: Should compact screens preserve a separately authored composition
  or intentionally switch to an ordered gallery? The spike tests the recommended
  dual-layout model.
- Accessibility: What textual context should accompany a visual moodboard? At
  minimum, assets need alt text and a meaningful linear order.
- Operations: Hosting budget, domain ownership, analytics preference, privacy
  requirements, and backup/export expectations are not supplied.

### Non-goals

- Four separate applications or independent content databases.
- A generic social network, portfolio builder, or public CMS.
- A component-gallery assembled public site.
- A real-time 3D engine without a demonstrated interaction need.
- Unlimited arbitrary HTML pasted into articles.
- Real-time multi-author collaboration in version one.
- Automatic AI-written publishing.

## 3. Proposed content model

### Core records

- `authors`
  - Auth user link, display name, bio, avatar, role, active status.
- `entries`
  - Stable identity: id, type (`film`, `projection`, `moodboard`, `list`), slug,
    current draft revision, published revision, created/updated timestamps.
- `entry_revisions`
  - Immutable snapshot metadata: title, dek, cover asset, publication date,
    category/year, SEO fields, revision number, author, timestamps.
  - Publishing atomically points `entries.published_revision_id` at a snapshot.
  - Editing a live entry creates a new working revision while the previous
    revision remains public.
- `article_documents`
  - Film/Projection revision id plus validated Tiptap JSON body and calculated
    reading metadata.
- `assets`
  - Storage key, original filename, media type, byte size, width/height, alt
    text, caption/credit, focal point, upload owner, timestamps.
- `taxonomies` and `entry_taxonomies`
  - Controlled categories and free or controlled tags. Public filters read only
    from the published revision.
- `slug_history`
  - Previous slugs and redirects so shared URLs do not silently break.

### Film-specific data

- Film title, release year, director(s), optional country/runtime, article body,
  cover, inline assets, tags, and publication metadata.
- Keep review scores out of the base model until the author confirms she wants
  ratings; criticism and essays should not be forced into a score.

### Projection-specific data

- Subject/category, article body, cover/inline assets, tags, and publication
  metadata.
- Reuse the article document and publication workflow from Films; vary only the
  public template and taxonomy.

### Ranked-list data

- `list_documents`: revision id plus introduction and list type.
- `list_items`: revision id, stable item id, rank/sort order, title, optional
  subtitle/creator/location, note, asset, and optional external URL.
- Entry-level category and year drive public filtering. Avoid a generic EAV
  field system in version one; add item fields only after representative lists
  expose a repeated need.

### Moodboard data

- `moodboard_documents`: revision id, coordinate model version, description,
  and semantic asset order.
- `moodboard_layouts`: revision id, layout variant (`wide`, `compact`), canonical
  plane width/height, and aspect ratio.
- `moodboard_placements`: layout id, asset id, normalized center `x/y`, normalized
  width, optional rotation, z-index, and visibility/crop settings.
- Store values independent of CSS pixels. Keep assets as DOM images so alt text,
  focus behavior, responsive loading, and a linear fallback remain possible.

### Publication state model

- `draft`: Saved, author-only, never public.
- `preview`: A protected rendering of the working revision; not a separate data
  status.
- `published`: A published revision exists and public routes point to it.
- `published_with_changes`: A live revision exists plus a newer draft.
- `unpublished`: A former public entry has no active published pointer; history
  remains recoverable.
- `archived`: Hidden from normal admin lists but restorable.

## 4. Route, page, state, and component inventory

### Public routes

- `/` — Four portal objects, site identity, section labels, reduced-motion
  alternative, and keyboard-accessible links.
- `/films` — Film index with editorial grid/list and clear empty/loading/error
  behavior.
- `/films/[slug]` — Film essay/criticism reader.
- `/moodboards` — Moodboard index.
- `/moodboards/[slug]` — Responsive visual composition plus semantic asset list
  and context.
- `/projections` — Projection index and category filtering if approved.
- `/projections/[slug]` — Projection reader.
- `/lists` — Ranked-list index with category/year filters reflected in the URL.
- `/lists/[slug]` — Ranked-list reader with persistent rank hierarchy.
- `/not-found` and route-level error states — Branded recovery, never a dead end.

### Administration routes

- `/admin/sign-in` — Allowlisted author authentication and expired/error states.
- `/admin` — Recent drafts, live entries, items needing attention, and a single
  dominant `Create` action.
- `/admin/content` — Search/filter by type and status; row actions for edit,
  preview, duplicate if later approved, publish/unpublish, and archive.
- `/admin/films/new` and `/admin/films/[id]` — Film metadata, rich text, assets,
  save state, preview, publish controls, and history.
- `/admin/projections/new` and `/admin/projections/[id]` — Reuse the article
  editor with Projection fields.
- `/admin/lists/new` and `/admin/lists/[id]` — List metadata, accessible reorder
  builder, preview, and publication controls.
- `/admin/moodboards/new` and `/admin/moodboards/[id]` — Upload, canvas, layers,
  wide/compact layouts, preview, history, and publish controls.
- `/admin/assets` — Uploaded assets, missing alt-text status, replacement and
  usage references. Deletion is blocked while an asset is in use.
- `/admin/settings` — Author profile and site-level metadata only; keep rare
  controls out of everyday authoring.

### Shared states

- Loading/skeleton; empty; partial upload; save in progress; saved; save failed;
  offline/interrupted; validation error; unauthorized; session expired;
  destructive confirmation; publish in progress; published; unpublished;
  published with newer draft; not found; and retry/recovery.
- All destructive actions name the affected entry and offer undo when data can
  be restored.
- Unsaved-change navigation is guarded. Autosave never substitutes for an
  explicit visible save state.

### Component inventory

- Public primitives: semantic typography, link, button, icon, media, divider,
  focus ring, status/visually-hidden helpers.
- Public components: global navigation, portal object, section masthead, entry
  card, filter bar, article header, rich-text renderer, responsive asset,
  ranked-list item, moodboard canvas, related-entry rail, empty/error state.
- Admin components: shadcn form controls, dialog, sheet, dropdown, tabs, toast,
  table, progress, alert, and confirmation patterns.
- Admin product patterns: content table, status badge, metadata form, Tiptap
  editor, asset uploader, preview toolbar, publish panel, revision history, list
  builder, moodboard canvas, layer panel, and unsaved-change guard.
- Do not create a universal entry editor. Share behavior and primitives, but use
  type-specific forms for Films, Projections, Lists, and Moodboards.

## 5. Visual and behavioral foundations

### Structural concepts considered

1. Editorial ledger
   - Ruled grids, strong typography, chronological indexes, and quiet readers.
   - Highest clarity and lowest build cost, but the homepage can feel too flat.
2. Cabinet of objects
   - Spatial imagery and section portals continue throughout the public site.
   - Most expressive, but reading, accessibility, and mobile composition become
     expensive and fragile.
3. Portal foyer + editorial rooms (recommended)
   - The homepage owns the dimensional spectacle. Section indexes and readers
     use distinct editorial treatments on one shared grid and interaction
     system.
   - Preserves the approved portals while keeping long-form reading calm and
     administration predictable.

### Principles

1. Editorial clarity before spectacle.
2. One surprising spatial gesture per view is enough.
3. Images are authored objects with credit, alt text, and deliberate crop.
4. Section personality comes from tokens and composition, not inconsistent
   controls.
5. Long-form reading is quiet, legible, and free of ambient motion.
6. Motion explains depth, navigation, feedback, or continuity and is always
   interruptible.
7. The admin always makes save state and the next consequential action obvious.

### Typography roles and provisional scale

- `display`: 56–96px fluid, homepage/section identity only.
- `heading.large`: 40–64px fluid.
- `heading.medium`: 28–40px fluid.
- `heading.small`: 22–28px.
- `body.reading`: 18–21px, approximately 1.55 line height, maximum 66–72ch.
- `body.interface`: 15–17px.
- `meta`: 12–14px with restrained tracking.
- Use one legible workhorse sans across navigation, metadata, and the admin, plus
  one expressive serif or display face for public editorial hierarchy. Final
  families wait for licensing and a visual-direction approval.

### Semantic color roles

- Text: primary, secondary, muted, inverse.
- Surface: canvas, raised, overlay, selected.
- Border: subtle, default, strong.
- Action: primary, secondary, destructive.
- Status: success, warning, critical, informational.
- Focus: a high-contrast indicator independent of section accent.
- Begin with a warm neutral paper/ink foundation. Give each public section one
  accent family; never use accent color as the only selected/current signal.
  Keep the admin on one quiet neutral theme.

### Grid, spacing, and responsive rules

- Wide: 12-column grid, content max around 1440–1600px, fluid outer gutters.
- Middle: 8 columns with reduced but stable gutters.
- Compact: 4 columns and 16–24px gutters.
- Reading width: 66–72ch regardless of viewport.
- Spacing scale: 4, 8, 12, 16, 24, 32, 48, 64, 96, 128.
- Suggested behavior thresholds, to be validated by content: compact below
  720px, middle 720–1099px, wide 1100px and above.
- Prefer container queries for reusable editorial modules; use viewport
  breakpoints for the page shell and moodboard layout variant.

### Shared navigation

- Site identity and the four sections remain discoverable on every public page.
- Wide layouts use a visible horizontal or compact fixed header; compact layouts
  use one clearly labeled menu trigger and a focus-trapped sheet.
- Current section is indicated by text/shape plus color. Skip links precede
  navigation. Back behavior is never the only way out of a portal.
- The admin has its own stable sidebar/header and never adopts experimental
  portal navigation.

### Motion

- Purposes: portal depth, hover/focus affordance, route continuity, save/upload
  feedback, and reorder/placement feedback.
- Initial vocabulary: 120–180ms control feedback, 220–360ms spatial transitions,
  opacity/transform only where practical, no ambient animation in readers.
- Reduced motion: disable orbit, parallax, depth drift, layout animation, and
  autoplay; preserve state changes with immediate transitions or subtle opacity.
- Motion review checks trigger, purpose, easing, interruptibility, focus, input
  parity, and behavior under `prefers-reduced-motion`.

## 6. Recommended architecture and tradeoffs

### Application

- Next.js App Router with TypeScript.
- Server Components for public reading/index pages; Client Components only for
  interactive filters, editors, reordering, and moodboard placement.
- Route Handlers or server actions for authenticated mutations. Publishing uses
  a database transaction and then route revalidation.
- Next Draft Mode for protected preview of working revisions.

### Backend

- Supabase Postgres as the source of truth.
- Supabase Auth with public sign-up disabled and an allowlisted author. Start
  with email magic link unless the security requirement calls for password/MFA.
- Row Level Security on every exposed table and Storage bucket. Anonymous users
  can read only published revisions and approved public assets; the author can
  manage drafts and owned assets. Never expose a service-role key to the client.
- Supabase Storage for originals and delivery derivatives. Restrict MIME type
  and file size, extract image dimensions, require alt text before publish, and
  preserve asset credits.
- SQL migrations and generated database types; avoid an ORM until a concrete
  query or migration need justifies it.

### Authoring and interactions

- shadcn/ui is the admin primitive/component foundation.
- Moumen Lab patterns may inform the uploader and reorder interactions only;
  adapt behavior to this product rather than importing an unrelated surface.
- Tiptap with a constrained schema for headings, paragraphs, emphasis, links,
  quotes, lists, dividers, and controlled image/figure nodes. Persist JSON and
  validate on write; do not accept arbitrary rendered HTML.
- `@dnd-kit` for ranked-list ordering and possibly moodboard pointer/keyboard
  sensors. The spike decides whether its free-placement behavior is sufficient.
- Use DOM elements and CSS transforms for the moodboard before considering a
  canvas renderer. This retains semantic images and simplifies responsive and
  reduced-motion behavior.
- CSS transitions first. InteractionKit may inform quiet public interactions;
  Motion for React is added only where route/spatial continuity materially
  improves comprehension.
- Paper Shaders is limited to one or two approved atmospheric effects after
  performance, fallback, and reduced-motion review. It is not a structural
  dependency.
- Do not introduce COSS as a competing admin foundation and do not assemble the
  public site wholesale from component galleries.

### Quality and operations

- Vercel for the Next.js deployment and Supabase for managed data/auth/storage,
  subject to budget and ownership approval.
- Unit tests for publication state and coordinate transforms; component tests
  for editor controls; Playwright flows for sign-in, authoring, preview,
  publish/unpublish, reopen, reordering, and moodboard persistence.
- Automated accessibility checks plus manual keyboard, focus, screen reader,
  zoom, contrast, and reduced-motion review.
- Structured logs around save, publish, upload, and render failures. Backups and
  export are launch requirements, not assumptions.

### Meaningful tradeoffs

- Custom admin vs managed CMS: Better author fit and compliance with the brief,
  but more initial engineering and QA.
- Revision snapshots vs in-place editing: More tables/storage and transaction
  logic, but safe preview, republish, and recovery.
- DOM moodboard vs canvas/WebGL: Better semantics and simpler tooling, but needs
  performance testing with many transparent images.
- Dual layouts vs one responsive layout: More authoring UI, but far more
  predictable composition across phones and desktops.
- Managed services vs self-hosting: Lower operational burden, but recurring cost
  and vendor dependency. Postgres and structured JSON keep an export path.

### Current documentation basis

- Next.js documents [App Router](https://nextjs.org/docs/app) and
  [Draft Mode](https://nextjs.org/docs/app/api-reference/functions/draft-mode)
  for protected draft rendering.
- Supabase documents [Next.js Auth](https://supabase.com/docs/guides/auth/quickstarts/nextjs),
  [database RLS](https://supabase.com/docs/guides/database/postgres/row-level-security),
  and [RLS-backed Storage access](https://supabase.com/docs/guides/storage/security/access-control).
- Tiptap recommends [JSON persistence](https://tiptap.dev/docs/editor/core-concepts/persistence)
  and supports [schema-bound content](https://tiptap.dev/docs/editor/core-concepts/schema)
  and static/server rendering.
- shadcn/ui provides composable patterns such as its
  [data-table guide](https://ui.shadcn.com/docs/components/base/data-table)
  rather than a competing application framework.
- dnd-kit provides [keyboard sensors, instructions, and live-region
  foundations](https://docs.dndkit.com/guides/accessibility), which still
  require product-specific accessibility work.
- Motion provides a [reduced-motion policy](https://www.motion.dev/docs/react-motion-config)
  and hook, but the product still owns when animation is appropriate.

## 7. Moodboard technical-spike plan

### Question to answer

Can a novice author create, save, reopen, adapt, preview, and republish a
free-positioned image composition across wide and compact screens using an
accessible DOM model?

### Scope

- Build behind authentication at a lab route, not as production navigation.
- Seed 12–20 representative transparent and standard images with varied aspect
  ratios and file sizes.
- Implement multi-upload, placement, selection, pointer drag, keyboard nudge,
  resize, rotation if needed, layer reorder, delete/undo, save status, reopen,
  and preview at target sizes.
- Prototype three rendering models with the same assets:
  1. One normalized contained plane.
  2. One normalized crop/pan plane.
  3. Dual `wide` and `compact` normalized planes (recommended hypothesis).

### Persistence contract

- Store canonical plane dimensions and normalized placement values.
- Store a schema/coordinate model version with every layout.
- Save through a transaction; reject unknown assets, invalid numbers, duplicate
  z-index/order conflicts, and out-of-bounds sizes.
- Reopening must reproduce the saved transform within a small visual tolerance.
- Keep semantic asset order separate from z-index. Visual stacking is not a
  meaningful reading order.

### Accessibility and recovery

- Every image has meaningful alt text or is explicitly decorative.
- All placement actions have keyboard equivalents and visible instructions.
- Announce selection, position/size changes, layer changes, save success, and
  errors through a concise live region.
- Provide reset position, undo, remove, retry failed upload, and leave-page
  protection.
- Public moodboards expose a meaningful ordered list/description even when the
  visual canvas is not useful to a screen reader.

### Verification matrix

- Viewports: 320, 390, 768, 1024, and 1440px widths.
- Inputs: mouse, trackpad, touch, and keyboard.
- Settings: 200% zoom, reduced motion, high contrast where supported.
- Network: interrupted upload, slow save, failed save, expired session.
- Content: transparent PNGs, portrait/landscape assets, duplicate filenames,
  very large images, and missing alt text.
- Performance target for the spike: smooth direct manipulation with 20 visible
  images on a representative laptop and current phone; measure rather than
  assuming a frame-rate result.

### Exit criteria

- The complete eight-step loop in the brief passes without database/manual file
  edits.
- The author can explain wide vs compact layout and save/publish state without
  coaching.
- Reopen and republish preserve composition.
- A coordinate model is selected and recorded with migration implications.
- Accessibility equivalence and performance limits are documented.
- If all three models fail, stop and choose a specialized canvas editor only
  after documenting why DOM interaction is insufficient.

## 8. Films vertical-slice plan

### Representative content

Use one complete, owner-approved Film essay rather than lorem ipsum. It should
include a title, dek, film metadata, cover, two inline figures with alt text and
credits, headings, a block quote, links, tags, and a publication date. If no
essay is ready, create a clearly labeled editorial sample about a named film
using licensed or owner-supplied imagery.

### Slice sequence

1. Sign in as the allowlisted author; handle invalid/expired sessions.
2. Create a Film draft and validate required metadata.
3. Paste/write formatted text in the constrained editor; upload and insert
   figures with alt text and credits.
4. Autosave with a visible state, deliberately fail a save, retry, leave, and
   reopen without loss.
5. Preview the working revision in the real public reader at compact and wide
   widths; preview URLs remain protected and are not indexed.
6. Publish atomically; revalidate `/films` and `/films/[slug]`; show clear
   confirmation and the live URL.
7. Read the public index/detail through loading, success, not-found, and error
   states; verify metadata, keyboard, semantics, zoom, and reduced motion.
8. Edit the published Film into a newer draft; prove the live page stays
   unchanged until republish.
9. Republish, unpublish, and restore/revisit the revision from history.

### Pages and product patterns in scope

- Admin sign-in, dashboard summary, content list, Film editor, protected preview,
  publish panel, and revision history.
- Public Films index and Film reader.
- Asset uploader/library subset needed by Films.
- Shared status, form validation, save, error recovery, public navigation, and
  reading typography foundations.

### Acceptance criteria

- A novice author completes create -> preview -> publish -> edit -> republish ->
  unpublish without code or database access.
- Pasted content conforms to the supported schema and unsupported formatting is
  handled predictably.
- The public page never exposes a draft or private asset.
- Published edits are atomic and recoverable.
- Index and detail pass responsive, keyboard, focus, semantics, contrast, zoom,
  reduced-motion, metadata, and performance checks.
- Loading, empty, save error, upload error, unauthorized, expired session,
  draft, preview, live, live-with-changes, and unpublished states are verified.

## 9. Proposed project phases

### Phase 0 — Approval and foundation

- Keep the confirmed production repository at
  `/Users/AndreVice/Desktop/Juhaina Editorial` as the single project root.
- Treat D-003 architecture as locked; confirm hosting ownership and the
  one-author permission model.
- Obtain representative content and image/font rights.
- Explore the recommended structural direction with the same representative
  Film content; select public typography and section token direction.
- Finalize schemas, state diagrams, acceptance tests, environment strategy, and
  backup/export expectations.

### Phase 1 — Moodboard risk spike

- Build only the isolated persistence/responsive/accessibility prototype.
- Select and record the coordinate model or stop and revise architecture.

### Phase 2 — Films vertical slice

- Deliver the entire authoring-to-public loop and validate it with the author.
- Promote only proven patterns into shared components.

### Phase 3 — Projections

- Reuse the article/revision/editor foundation while designing a distinct public
  index and reader token set.

### Phase 4 — Lists

- Validate the ranked-list structure with representative film, album, or
  restaurant content.
- Deliver list building, accessible reordering, category/year filters, URLs,
  index, and reader.

### Phase 5 — Production moodboards

- Turn the successful spike into the type-specific admin editor and public
  experience. Migrate spike data only if the model is versioned and approved.

### Phase 6 — Homepage portals and shared navigation

- Produce/approve the four transparent portal objects.
- Implement DOM/CSS depth, focus/hover behavior, route continuity, compact
  layout, and reduced-motion alternative.
- Use no more than one or two atmospheric effects only after performance and
  accessibility review.

### Phase 7 — Launch hardening

- Content migration, redirects, asset rights/credits, SEO/social metadata,
  analytics/privacy, backups/export, security review, browser/device testing,
  accessibility audit, performance budgets, monitoring, and author handoff.

## Definition-of-ready status

### Ready enough to proceed with planning/spikes

- User, core outcome, top-level information architecture, minimum publication
  loop, critical states, and riskiest feature are clear.
- A coherent content/revision model and recommended architecture now exist.

### Not ready for broad implementation

- Representative content and asset rights are missing.
- Public visual direction, final typefaces, portal art, and ranked-list semantics
  are not approved.
- Moodboard coordinate behavior has not been validated.
- Roles, authentication method, hosting ownership, backup, privacy, and analytics
  expectations remain open.

## Architecture approval

D-003 was approved by the owner on 2026-08-01: the project will use a custom
shadcn/ui administration app on Next.js + Supabase and accepts the additional
initial build work required to preserve the novice-specific authoring
experience.

Repository disposition was resolved on 2026-08-01: the new production repository
is `/Users/AndreVice/Desktop/Juhaina Editorial`. Before authenticated backend
work begins, confirm the version-one author/role model and sign-in method.
