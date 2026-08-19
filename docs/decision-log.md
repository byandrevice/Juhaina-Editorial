# Decision log

Last updated: 2026-08-14

## D-001 — One revisioned content system

- Status: Confirmed by brief
- Decision: Films, Moodboards, Projections, and Lists share one codebase,
  identity model, asset library, taxonomy system, publication lifecycle, and
  administration shell.
- Reason: Shared behavior must remain coherent even when public section styling
  differs.
- Reversal cost: Very high after content exists.
- Reconsider only if: A section acquires a genuinely incompatible operational
  or security requirement.

## D-002 — Homepage depth without a 3D engine

- Status: Confirmed by brief
- Decision: Start with transparent PNG assets, DOM/CSS transforms, shadows,
  depth, and restrained motion. Do not add Three.js during the initial build.
- Reason: The approved effect does not yet require a 3D scene, camera, lighting,
  or physics model.
- Reversal cost: Low before portal art is finalized.
- Reconsider only if: A tested interaction requires true spatial occlusion,
  camera movement, or geometry that cannot be represented accessibly in the
  DOM.

## D-003 — Custom shadcn admin on Next.js and Supabase

- Status: Approved by owner on 2026-08-01
- Decision: Use a custom shadcn/ui administration experience in the same
  Next.js application as the public site. Use Supabase Postgres, Auth, and
  Storage as managed backend services.
- Reason: It honors the approved admin foundation, permits a novice-specific
  workflow, and keeps the moodboard editor inside the same permission and
  revision model.
- Alternatives:
  - Sanity: Faster conventional editorial setup and strong preview tooling, but
    its Studio would replace shadcn as the admin foundation and the moodboard
    editor would still be custom.
  - Payload: Integrated database, auth, uploads, and admin, but its admin would
    also replace the approved foundation and it adds self-hosting/upgrade work.
  - Custom backend from separate primitives: Maximum control but unnecessary
    security and operations burden compared with managed Postgres/Auth/Storage.
- Tradeoff: More application work up front in exchange for the intended author
  experience and lower platform lock-in.
- Reversal cost: Highest of the open decisions once schemas and authoring flows
  are built.
- Reconsider only if: Delivery time later matters more than the approved custom
  admin, or implementation evidence shows the authoring burden is materially
  higher than planned.

## D-004 — Dual-layout moodboard coordinate model

- Status: Recommended hypothesis; validate in spike
- Decision: Store normalized placements against two explicit composition
  planes: `wide` and `compact`. Generate the compact layout from wide as a
  starting point, then allow adjustment. Keep a linear, semantic asset order as
  the accessible fallback.
- Reason: One scaled canvas either makes imagery tiny on phones or crops it
  unpredictably. Independent normalized layouts preserve authorship without
  storing viewport-specific pixels.
- Alternatives:
  - Single contained canvas: Simple and faithful, but often illegible on phones.
  - Crop/pan world: Expressive, but hides content and adds navigation and motion
    burdens.
  - Automatic masonry fallback: Accessible and responsive, but discards the
    authored mobile composition.
- Reversal cost: High after moodboards have been authored.
- Reconsider only if: The spike demonstrates that a single responsive transform
  passes legibility, accessibility, and author usability tests.

## D-005 — Structured rich text and immutable published revisions

- Status: Proposed with architecture
- Decision: Persist article bodies as validated Tiptap JSON. Saving edits creates
  or updates a working revision; publishing atomically promotes a snapshot.
  Editing a published entry never mutates the live revision until republish.
- Reason: It supports safe paste/write behavior, server rendering, preview,
  version recovery, and a predictable published state.
- Reversal cost: High after content migration.
- Reconsider only if: A selected CMS provides an equivalent portable structured
  document and revision model.

## D-006 — Production repository root

- Status: Confirmed on 2026-08-01
- Decision: `/Users/AndreVice/Desktop/Juhaina Editorial` is the production
  repository root. It begins with the approved planning documents and no
  application scaffold.
- Reason: Keeping decisions and future implementation together prevents later
  sessions from depending on chat history or an adjacent planning workspace.
- Reversal cost: Low before application code, environments, and deployment are
  created.
- Reconsider only if: A remote repository or organizational convention requires
  a different local checkout path.

## D-007 — One central admin with section-specific editors

- Status: Approved by owner on 2026-08-10
- Decision: Juhaina uses one `/admin` area, one Supabase project, and one
  authentication flow to manage Film Thoughts, Moodboards, Projections, and
  Lists. The shared dashboard routes her into a purpose-built editor for each
  content type rather than exposing one generic publishing form.
- Reason: One sign-in, media library, draft queue, and publishing model is
  faster to implement and easier for a single author to learn. Tailored forms
  preserve the novice-specific authoring experience without duplicating auth,
  security, uploads, and deployment across four backends.
- Reversal cost: High after content schemas, uploads, and permissions exist.
- Reconsider only if: A section later requires genuinely separate ownership,
  permissions, compliance, or deployment boundaries.

## D-008 — Film Thoughts publishing and recovery model

- Status: Implemented on 2026-08-11
- Decision: Film Thoughts uses a constrained Tiptap JSON document, a mutable
  working revision, immutable published snapshots, a private Supabase image
  bucket, and browser-local recovery for text, metadata, crop coordinates, and
  pre-upload image files.
- Reason: Juhaina must be able to recover from an accidentally closed window,
  edit live work without silently changing the public page, and position common
  image formats inside the approved editorial frame without an external image
  editor.
- Tradeoff: The browser recovery copy is device-specific; central drafts become
  available across devices only after Supabase is connected and the draft is
  saved to the workspace.
- Reversal cost: Medium. Tiptap JSON and crop percentages are portable, while
  revision history and Storage policies are intentionally Supabase-specific.
- Reconsider only if: User testing shows that explicit draft saving is still
  confusing, a multi-author workflow is approved, or images regularly exceed
  the current 6 MB standard-upload limit.

## D-009 — Free Supabase with pause-tolerant public publishing

- Status: Approved by owner on 2026-08-11; public snapshot delivery remains to
  be implemented before launch.
- Decision: Keep the project on the Supabase Free plan. Treat Supabase as the
  authoring system and source of truth, while publishing deployment-safe static
  copies of live articles and their required images so the public website stays
  available if the low-traffic Supabase project is automatically paused.
- Expected operation: Juhaina may occasionally need to open Supabase and click
  `Resume project` before signing into or using the administration workspace.
  A paused backend must not take already-published public pages offline.
- Reason: The client expects only a few visits per year, so a continuously paid
  Supabase Pro subscription is disproportionate to likely usage.
- Tradeoff: Administration may be temporarily unavailable after long periods of
  inactivity, and publication needs an explicit static snapshot/media delivery
  step. Public content can be stale only until the next successful publish and
  deployment, never dependent on waking Supabase for an ordinary reader visit.
- Launch gate: Verify public articles and their images load with Supabase
  unavailable before unlocking the production site.
- Reconsider only if: The client requires always-available administration,
  publication volume increases materially, or manual project resumption becomes
  operationally burdensome.

## D-010 — Local, non-publishing administration QA sandbox

- Status: Implemented on 2026-08-12.
- Decision: Developers reproduce administration UI and recovery issues through
  a development-only local sandbox. Sandbox drafts and image files remain in
  the current browser and cannot read, upload, change, or publish Supabase data.
- Reason: QA must not require sharing, impersonating, or modifying Juhaina's
  production account and content.
- Escalation path: Bugs involving authentication, remote draft persistence,
  Storage upload, row-level security, or publication require a separate
  allowlisted QA user with isolated test content.
- Safety constraint: The sandbox condition requires `NODE_ENV=development`, so
  setting its environment flag on Vercel cannot create a production auth bypass.

## D-011 — Author-controlled Lists labels

- Status: Approved by owner on 2026-08-13; implementation is required when the
  Lists administration editor is built.
- Decision: The Lists editor will provide convenient presets for content type
  and year/era while allowing Juhaina to replace both with free-text labels.
  Examples include `Films`, `Albums`, or a custom type, paired with `2024`,
  `All time`, `Mid-1990s`, or another author-written period.
- Reason: Ranked lists are editorial arguments, and their framing cannot be
  predicted safely with a fixed enum. The public title must reflect the
  author's language rather than forcing every collection into a calendar year.
- Data constraint: Store the visible labels as authored strings. Optional
  normalized values may support filtering and URLs, but must not overwrite or
  regenerate the visible wording.
- Validation requirement: Preview the composed public list title in the editor
  and enforce sensible length/character limits without limiting the vocabulary.

## D-012 — Locked Lists visual system

- Status: Approved by owner and implemented on 2026-08-13.
- Decision: Lists uses permanent dark mode (`#191514`), Libre Caslon Text for
  the editorial display face, and 115% artwork scale across Films, Albums, and
  Books. The public Type Study panel and its URL overrides are removed.
- Reason: The exploratory study has produced an approved combination. Leaving
  experimental controls in the public experience would expose internal design
  tooling, create inconsistent screenshots, and weaken the subsite's identity.
- Reconsider only if: Responsive testing finds a breakpoint-specific density
  problem. Any adjustment should preserve these as desktop design defaults,
  rather than restoring public-facing style controls.

## D-013 — Lists v1 authoring and publication model

- Status: Approved by owner and implemented on 2026-08-13.
- Decision: Lists uses one central, revision-safe editor with one live list for
  each Type + Period combination. Type, Period, list title, creator-field label,
  ranking visibility, and artwork format are author-controlled. Each list may
  contain 1–20 manually reordered items with optional artwork and an optional
  external link that appears only in Poster View.
- Artwork formats: `2:3 — Movie poster`, `5:8 — Book cover`, `1:1 — Album
  artwork`, and `16:9 — Landscape / widescreen`.
- Publication behavior: Saving edits a private working revision. Publishing
  promotes an immutable snapshot. Editing a live list does not change the
  public version until Republish is chosen. Unpublished and archived lists
  remain private while being edited.
- v2 boundary: Multiple simultaneously live lists with the same Type + Period,
  and the conditional title selector that would distinguish them, are
  deliberately deferred. Examples such as `Favorite Films of 2024`, `Best
  Horror Films of 2024`, and `Best First Watches of 2024` cannot all occupy the
  same public filter pair in v1.
- Reason: The one-list constraint keeps the first authoring model predictable
  for a single novice author, avoids adding a third public filter before client
  need is demonstrated, and leaves a clear migration path for v2.

## D-014 — Milestone-based staging deployment

- Status: Approved operating recommendation on 2026-08-13.
- Decision: Iterate continuously on localhost, deploy to Vercel staging at
  meaningful end-to-end checkpoints, and reserve production deployment for
  approved release candidates. Do not redeploy staging for every spacing or
  copy adjustment, and do not postpone all client testing until the full site
  is complete.
- Staging checkpoint examples: a section becomes fully navigable; its backend
  migration and authoring flow are ready together; a reported client issue is
  fixed and needs confirmation; or a responsive/interaction milestone needs a
  real-device review.
- Current release order: the Lists database migration is additive, so push the
  Supabase migration first and deploy the matching Vercel code immediately
  afterward. Avoid leaving staging in a half-updated state for client testing.
- Reason: Milestone deployments produce useful client evidence and catch
  environment-specific issues without turning every micro-adjustment into a
  release-management task.
- Portfolio value: staging checkpoints preserve a traceable sequence of
  hypotheses, observed client friction, design decisions, fixes, and validation
  rather than presenting the final interface as a single unexplained result.

## Open design TODOs

- Design a shared Second Viewing logo/brand mark for the top-left of every
  subsite header.
- The logo must link back to the main home screen containing the four section
  portals: Film Thoughts, Moodboards, Projections, and Lists.
- Keep the logo's form, scale, and responsive behavior open until the dedicated
  logo exploration phase; do not treat the current text mastheads as the final
  brand mark.

## D-015 — Accept the current Lists mobile composition for v1

- Status: Approved for v1 on 2026-08-13; refinement deferred to v2.
- Decision: Ship the current responsive Lists halo, mobile list view, and mobile
  Poster View for the first release. Do not hold the Moodboards work or the
  Lists staging checkpoint for further mobile art-direction polish.
- V2 focus: refine poster spacing and overlap, improve title legibility near the
  viewport edges, tune orbit density across different phone aspect ratios, and
  revisit the relationship between the central controls and rotating artwork.
- Reason: The current implementation is functional, displays the full collection,
  preserves the distinctive halo concept, and provides a readable alternate list
  view. Further refinement is valuable but is not required to validate the core
  product or authoring workflow.

## D-016 — Moodboards frontend interaction model

- Status: Implemented and browser-verified on 2026-08-13.
- Decision: Moodboards uses a fixed-viewport, two-axis card-stack browser.
  Horizontal movement changes boards inside a category; vertical movement
  changes categories. Each category preserves its own board position.
- Input model: Four visible edge arrows, arrow keys, and axis-locked pointer/touch
  gestures share the same navigation state. Wheel scrolling is intentionally
  disabled because the page is a spatial browser rather than a document.
- Open state: Selecting the front card expands its 16:9 artwork into a static,
  contain-fit inspection view. Close, Escape, and browser Back return to the
  preserved stack. The URL hash identifies the active category and board.
- Motion and access: Category and board transitions have separate timing and
  depth behavior, with reduced-motion alternatives. Only the front card is
  tabbable, live changes are announced, and a one-time edge-arrow nudge teaches
  the vertical axis without introducing a tutorial modal.
- Content boundary: The current three categories and nine boards are realistic
  frontend fixtures. Moodboards administration, ordering, taxonomy, upload,
  draft recovery, and publication are deferred until the authoring workflow is
  designed.
- Review boundary: Light/dark controls remain visible only as a palette review
  aid. A permanent theme will be locked before production release.

## D-017 — Responsive Moodboards spatial chrome

- Status: Implemented and browser-verified on 2026-08-14.
- Decision: Preserve the same two-axis card-stack composition across desktop
  and mobile by deriving the card width, edge-control size, icon size, and edge
  clearance from viewport-relative CSS variables instead of fixed dimensions.
  Reserve an explicit responsive gap between the stack and side controls.
- Hierarchy: The category label sits lower in the upper field, and the palette
  review control is a compact sun/moon switch at the top-right so neither
  competes with the moodboard imagery. The visible board counter is removed;
  the card-stack depth and directional controls are sufficient navigation cues.
- Control treatment: Directional controls keep their responsive click/touch
  targets but render as bare arrow icons without resting borders, fills, or
  rounded boxes. Focus outlines remain available for keyboard users.
- Title anchor: On portrait and tall layouts, the category label uses a fixed
  190px top offset so resizing width cannot pull it upward. Landscape canvases
  up to 900px high use a dedicated upper title band, with a tighter rule below
  600px, so the label always stays outside the centered card stack.
- Reversal model: Clicking expanded artwork closes it. The explicit close
  control, Escape, and browser Back remain available as parallel accessible
  paths.
- Reason: Responsive behavior should preserve the project's spatial identity,
  not merely shrink a desktop canvas. Reusing the artwork as both open and
  close target makes inspection more direct without removing conventional
  dismissal affordances.
- Validation: Verified against both supplied squeeze recordings and at
  1600 × 800, 1024 × 600, and 390 × 800 CSS pixels. The measured label-to-stack
  clearance is 61.75px, 21.02px, and 126.16px respectively, with no overlap,
  browser warnings, or console errors.

## D-018 — Projections R1 public index direction

- Status: Supplied by owner and implemented on 2026-08-16.
- Decision: Projections uses the R1 paired-column index on a permanent `#2B2B2B`
  ground. Six newest entries receive equal weight. Each desktop entry pairs a
  square-cornered 4:3 image with a space-between text column; the layout becomes
  one image-left column below 1000px and a 16:9 stacked list below 820px.
- Typography: Self-host Archivo for this section, using regular and medium
  weights only. Preserve the restrained white/gray hierarchy and let editorial
  images provide the only color.
- Interaction: The whole entry is one link with a title-only accessible name.
  Hover only underlines the title; keyboard focus outlines the full entry. No
  filters, featured treatment, cards, animation, light mode, or accent color.
- Product adaptation: Use the four real Second Viewing sections in navigation
  and mark Projections active. Treat the supplied Films/Books/Notebook/Index/
  About labels and `/films` examples as wireframe residue rather than changing
  the approved site architecture or Film Thoughts implementation.
- Content boundary: The current six film-oriented entries and existing images
  are representative public fixtures. They establish rendering and responsive
  behavior but do not create or approve the eventual Projection database schema.
- Validation: Compared the normalized source and browser implementation at
  1440px, checked the 390px mobile composition, navigated into a reader route,
  confirmed no overflow or console errors, and passed typecheck and production
  build. See `design-qa.md`.

## D-019 — Database content plus individually removable launch samples

- Status: Implemented on 2026-08-19.
- Decision: Treat the portfolio fixtures as a separately managed sample layer,
  not as uploaded client posts. Real published Supabase content and visible
  samples may coexist. A protected Sample content screen lets the author remove
  or restore each sample independently across Films, Lists, Moodboards, and
  Projections.
- Data behavior: A sample is visible when it has no hidden record in
  `fixture_visibility`. Removing a sample creates an authenticated tombstone;
  restoring it removes that tombstone. Published database content wins when it
  shares the same public key as a sample.
- Failure behavior: When production Supabase is configured but sample
  visibility cannot be read, public loaders fail closed to database content
  rather than unexpectedly restoring removed portfolio samples.
- Reason: Bundled examples should remain useful during client onboarding but
  must never be mistaken for editable database rows or overwrite client work.
  Individual visibility records provide reversible cleanup without duplicating
  placeholder media into private Storage.

## D-020 — Projections authoring model

- Status: Implemented on 2026-08-19.
- Decision: Projections reuses the proven mutable-working-revision and immutable
  published-snapshot architecture from Films while retaining section-specific
  fields and public design.
- Fields: headline, subheader, Tiptap body, cover image, image description,
  focal position, zoom, subject, creator/source, subject year, reading time, and
  publication date.
- Workflow: browser recovery → save draft → explicit publish → edit working
  revision → republish, unpublish, or archive. Only promoted revisions and their
  cover assets are publicly readable.
- Reason: The client needs the reliability of the existing editorial backend
  without collapsing four distinct editorial formats into one generic editor.
