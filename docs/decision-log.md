# Decision log

Last updated: 2026-08-01

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
