# Second Viewing — UX/UI portfolio evidence log

This file records meaningful interface and experience decisions as the product evolves. It is intended to become evidence for a portfolio case study, not merely a technical changelog.

For every notable change, preserve:

- the user or design problem;
- the decision and alternatives considered;
- why the decision improves clarity, usability, accessibility, delight, or visual quality;
- implementation and validation evidence;
- what the change demonstrates about the designer's process.

## Case study synthesis — Moodboards

### Overview

Moodboards is one of four editorial experiences inside Second Viewing. The
project had two connected design challenges: create a public browsing model
that felt tactile and image-led, then build an administration workflow that let
a non-technical editor produce those compositions without relying on a separate
design tool.

The resulting system pairs a responsive, two-axis card-stack library with a
custom 16:9 collage editor. The public experience treats categories and boards
as two distinct spatial axes. The private workflow supports taxonomy, draft
recovery, direct layer manipulation, safe publishing, and a focused full-screen
mode for precision work.

### Role and scope

The work covered product definition, interaction architecture, responsive art
direction, authoring-workflow design, accessibility decisions, implementation,
and browser validation. The Moodboards vertical slice includes:

- the public card-stack browser and expanded artwork view;
- category and moodboard administration;
- image ingestion and a layered 16:9 composition canvas;
- local draft and source-image recovery;
- immutable publication behavior and flattened delivery assets;
- responsive full-screen editing with layer sorting, zoom, and bounded pan.

### The core product problem

A conventional gallery grid would be easy to understand, but it would flatten
the editorial relationship between a subject and the moodboards collected
inside it. At the same time, an expressive frontend alone would leave the
client rebuilding every collage elsewhere and handing off finished images.

The product therefore needed to preserve two qualities that often pull in
opposite directions:

- a distinctive, spatial reading experience where imagery remains dominant;
- a dependable authoring system with familiar controls, recoverable drafts,
  content safeguards, and predictable publication.

### Public experience: a two-axis spatial library

The public Moodboards page uses vertical movement to change categories and
horizontal movement to browse boards within the current category. Each
category remembers its last board position, so returning to it preserves the
reader's place. A shallow photographic stack communicates that more content is
available without adding counters or explanatory chrome.

Readers can navigate through four edge arrows, keyboard arrows, or axis-locked
touch gestures. A one-time nudge on the less-obvious downward control teaches
the vertical category axis without interrupting the first visit with a modal.
Only the front card enters the tab order, live changes are announced, adjacent
art is preloaded, and reduced-motion behavior keeps navigation usable without
the full depth transition.

Selecting the front board expands its 16:9 artwork into a quiet contain-fit
inspection view. Clicking the open artwork reverses the action; Escape, browser
Back, and an explicit close control remain parallel dismissal paths. URL hashes
identify the active category and board so an individual composition can be
shared directly without creating a second browsing model.

### Responsive art direction without collapsing the concept

The spatial browser was intentionally preserved on small screens instead of
turning into a generic list. Card dimensions, edge-control size, icon size, and
collision clearance derive from viewport-relative variables. The visible arrow
icons remain visually bare while retaining larger invisible hit areas and
keyboard focus indicators.

The category label is treated as navigation context outside the artwork, not as
text printed on the collage. Portrait and tall layouts hold it at a stable
190-pixel anchor. Dedicated compact- and short-landscape title bands keep it
separate from the centered card when vertical room disappears. This decision
was based on the measured relationship between label and artwork rather than
device names.

The interface was exercised from wide desktop views down to 250-pixel-wide
browser captures. At 1600 × 800, 1024 × 600, and 390 × 800, the measured
label-to-stack clearance remained positive, while the stack and all directional
controls stayed visible and separated. Simple sun and moon controls provide
light and dark presentation states without competing with the imagery.

### Authoring system: direct composition with safety underneath

The administration experience translates the public visual language into a
custom collage workflow. Each moodboard uses a complete 16:9 canvas with a
required background color set through a visual picker or exact hex value, with
recent swatches retained for reuse. The editor accepts JPG/JPEG, PNG/APNG,
WebP, AVIF, HEIC/HEIF, TIFF, and BMP sources while intentionally rejecting GIFs
rather than silently flattening animation. Transparent assets retain
transparency.

Layers can be moved freely, resized proportionally from any corner, rotated,
and assigned precise opacity. Center guides assist placement. Each layer can be
selected, named, hidden, locked, reordered, duplicated, deleted, or restored
through Undo. Rotation and opacity use typed numeric values instead of sliders,
making exact values faster to enter.

The visible layer list is itself the ordering control. The entire row can begin
a sort except for explicit visibility and lock buttons. Rows reorder
continuously as the pointer crosses their midpoints, the moving row receives a
lifted state, cancellation restores the original order, and a completed drag
creates one Undo entry. Command/Ctrl+D and Delete/Backspace support frequent
actions, while a right-click menu keeps Duplicate and Delete discoverable.

### Resilient drafts, taxonomy, and publication

The Moodboards library supports creating, editing, deleting, publishing, and
manually reordering boards. A board can move between categories without being
rebuilt, and published work can return to an editable working revision without
changing the live version.

Local autosave restores both structured draft data and underlying source
images after reload or accidental closure. Incomplete work remains saveable;
image descriptions become mandatory only at publication, preserving a
low-friction drafting loop without weakening the public accessibility gate.

Categories are editable content rather than hard-coded filters. The client can
add, rename, reorder, and delete categories, and move a moodboard by changing
its category. An occupied category cannot be removed without choosing a safe
destination, and the system always retains at least one category. Category
choices refresh in already-open editors after same-browser changes, cross-tab
storage updates, and window focus.

Publication creates flattened preview and full-size outputs for the public
experience while preserving editable layer data. Published revisions remain
immutable: moving or editing a live moodboard stays private until republishing,
so routine authoring cannot accidentally mutate the current public version.

### Full-screen composition and precision navigation

As the editor matured, the canvas became the dominant workspace. The normal
administration layout now lets the full 16:9 canvas span the available width,
with secondary layer controls beneath it. Settings collapse from three columns
to two and then one as the workspace narrows, and administration tables become
labelled responsive fields before their desktop columns collide.

Native full screen removes the surrounding administration shell while
preserving the browser's familiar Escape behavior. Essential tools move into a
draggable Canvas Controls palette containing background, add-image, layers,
visibility, locking, rotation, opacity, and Undo. The palette can be parked
over a less important area of each collage and is now roughly one-third smaller
than its first version—14rem rather than 21rem wide, with its maximum height
reduced from 34rem to 24rem—so more artwork stays visible.

The full-screen canvas supports continuous 60–400% zoom through two-finger
touch pinch and trackpad pinch. Zoom preserves the gesture focal point and
shows the current percentage in the existing toolbar. Two-finger touch movement
pans while distance continues to control scale; two-finger trackpad scrolling
pans above 100%; and Space-drag or middle-mouse drag provides explicit mouse
panning without taking ordinary primary-button dragging away from layers.

Every zoom, pan, and viewport resize passes through the same boundary model. If
an axis fits inside the viewport, it remains centered and cannot pan. If it
overflows, translation stops exactly when the canvas edge reaches the viewport
edge, preventing empty space from being exposed beyond the composition. A
grabbing cursor appears only during an active explicit pan gesture.

### Key tradeoffs

- The public experience keeps its unfamiliar spatial model because multiple
  input paths, visible stack depth, position memory, and restrained teaching
  make it learnable without sacrificing identity.
- The editor uses opacity rather than blend modes for version one. This keeps
  the control model precise and understandable while leaving blend modes as a
  deliberate future extension.
- Source layers and immutable revisions remain structured, but public delivery
  uses flattened images to protect rendering consistency and performance.
- Native full screen and common design-tool gestures reduce learning cost,
  while visible controls and context menus prevent the workflow from depending
  on shortcuts alone.

### Validation and evidence

- Tested the public browser with three categories and nine representative
  boards across desktop, narrow-window, landscape, and mobile dimensions.
- Exercised arrow, keyboard, touch, deep-link, theme, open, close, Escape, Back,
  reduced-motion, preload, tab-order, and live-announcement behavior.
- Verified image upload, transparent assets, proportional resize, free drag,
  duplication, deletion, Undo, and recovery of a three-layer local draft and
  its source files.
- Verified category creation, reordering, transfer-safe deletion, live selector
  refresh, and restoration of the default taxonomy after testing.
- Tested whole-row layer sorting, continuous reordering, typed rotation and
  opacity, keyboard shortcuts, context-menu actions, full-screen Undo, and exact
  restoration of a moved layer's prior coordinates.
- Confirmed the centered 100% canvas does not pan and validated the shared
  boundary calculation for overflowing axes and viewport resizing. Automated
  browser control could not physically synthesize true pinch or held
  middle-mouse gestures, so those paths remain identified for a final hardware
  smoke test rather than being overstated as completed evidence.
- TypeScript checks and optimized production builds pass after the implemented
  interaction and layout changes.

### Outcome and portfolio value

Moodboards now functions as a complete vertical slice rather than a visual
prototype: readers receive a distinctive yet accessible editorial browser, and
the client can independently create, organize, recover, refine, and publish the
compositions that feed it.

The work demonstrates interaction architecture, responsive art direction,
direct-manipulation design, novice-specific tooling, multimodal gestures,
accessibility gating, content-model safety, progressive disclosure, and an
evidence-led iteration process. Because the project has not yet been measured
with production analytics or a formal usability study, the case study reports
validated behavior and workflow coverage rather than inventing engagement or
efficiency metrics.

## 2026-08-14 — Responsive Moodboards chrome and reversible inspection

### Problem

The Moodboards composition held together at its original desktop size, but its
fixed card and control dimensions became crowded on narrow screens. The
category label also sat too close to the top edge, the word-based theme switch
competed with the artwork, and opening a board introduced a close behavior that
was less direct than the initial click that opened it.

### Decision

- Size the card stack and all four edge controls from viewport-relative CSS
  variables, with a dedicated collision-clearance token, so the same spatial
  model can compress from tall desktop to extra-narrow windows without clipping
  or touching the navigation arrows.
- Lower the category label into the composition to give it a deliberate band of
  negative space below the vertical control, and hold it at a fixed 190px
  portrait/tall-screen offset so width and ordinary height changes do not pull
  it back toward the top. A compact landscape exception prevents collision on
  genuinely short screens.
- Replace the `Light` / `Dark` segmented labels with familiar sun and moon
  symbols in a compact control at the top-right.
- Make the expanded artwork itself a close target, while retaining Escape,
  browser Back, and the explicit close control for discoverability and access.
- Remove the `01 / 03` progress counter after testing showed the visible card
  stack already communicated that more boards were available.
- Remove the resting borders and rounded boxes from all four directional
  controls, leaving only the Phosphor arrow marks while preserving their full
  invisible hit areas and keyboard focus indicators.

### User benefit

The interface now preserves its tactile two-axis identity instead of falling
back to a generic mobile list. Controls remain reachable at 320px wide, imagery
keeps visual priority, and readers can reverse an open action by clicking the
same object again.

### Evidence and validation

- Browser-rendered captures were checked down to 250 × 700 CSS pixels, alongside
  320 × 568 and the supplied 644px-wide squeeze reference.
- The stack and edge arrows remain fully visible and separated at every tested
  size.
- At a constant 800px height, the category baseline stays fixed while the
  viewport narrows from 644px to 390px and 250px.
- Light/dark switching and click-artwork-to-close were exercised in the browser.
- The browser console is clean, and TypeScript plus the production build pass.

### Portfolio signal

Demonstrates responsive interaction design beyond breakpoints: the layout,
controls, affordances, and reversal model all adapt while preserving the same
editorial concept.

## 2026-08-13 — Moodboards as a two-axis spatial library

### Problem

A conventional grid would make the Moodboards section easy to scan but would
flatten the distinction between choosing a subject and browsing the boards
inside it. The client brief called for something tactile and editorial without
losing clear navigation on touch, keyboard, or smaller screens.

### Decision

- Use the vertical axis for category changes and the horizontal axis for boards
  within the active category.
- Preserve each category's last board position so returning to a category does
  not erase the reader's place.
- Present boards as a shallow photographic card stack, then expand the chosen
  image into a quiet, contain-fit inspection view with a single close action.
- Add four restrained edge arrows, arrow-key support, axis-locked touch
  gestures, deep links, reduced-motion behavior, and a one-time downward-arrow
  nudge that teaches the less-obvious category axis without an instructional
  overlay.
- Keep the light/dark switch as a review aid while the final Moodboards palette
  is being evaluated.

### User benefit

The spatial model teaches itself: left/right means “another board,” while
up/down means “another subject.” The card stack keeps the available depth
visible, direct links make individual boards shareable, and the expanded state
lets imagery carry the page without adding a second browsing system.

### Evidence and validation

- Three categories and nine realistic editorial boards were tested at desktop
  and mobile viewports.
- Directional controls, per-category position memory, open/close transitions,
  light/dark review states, and direct hash links were exercised in the browser.
- Adjacent board art is preloaded; only the front card enters the tab order;
  status changes are announced through an ARIA live region.
- TypeScript and production builds pass, and the browser console contains no
  errors or warnings from the Moodboards interface.

### Portfolio signal

Demonstrates interaction architecture, motion as navigation, progressive
disclosure, accessibility-aware gesture design, and restraint in teaching an
unfamiliar interface.

## 2026-08-13 — Lists visual system lock-in

### Problem

The Type Study panel was useful during exploration but exposed internal design controls in the reading experience and allowed the approved composition to drift between URLs and sessions.

### Decision

- Lock Lists to dark mode with the approved `#191514` surface.
- Lock the editorial display face to Libre Caslon Text.
- Lock artwork scale to 115% across Films, Albums, and Books.
- Remove the public Type Study panel and discard legacy `font`, `poster`, and `theme` URL parameters.

### User benefit

Every visitor sees the same intentional hierarchy, contrast, and collection density. The client and designer can discuss one canonical presentation rather than debugging personal URL settings.

### Evidence and validation

- Canonical Lists routes contain only content and view state.
- Legacy study URLs resolve to the locked visual system and clean themselves without reloading.
- Carousel, Poster View, list view, type/year filters, and responsive scaling are verified after removing the study branches.

### Portfolio signal

Demonstrates a complete exploration-to-decision arc: testing many variants, selecting a system, and removing the scaffolding once it has served its purpose.

## 2026-08-13 — Reader-facing Lists language and flexible editorial framing

### Problem

“Back to carousel” described an interface mechanism instead of the reader's destination, while “All Years” sounded database-like and excluded lists framed around eras such as “Mid-1990s.” Fixed type and year enums would also force the author to request code changes for ordinary editorial ideas.

### Decision

- Rename the linear-view return action to “View posters.”
- Rename the timeless date preset from “All Years” to “All time.”
- Specify the future Lists editor so both type and date/era labels accept author-written values, with presets retained only as shortcuts.

### User benefit

Readers get clearer navigation language, and the author can frame a list in language appropriate to its argument rather than adapting the idea to the CMS.

### Evidence and validation

- Public list and filter states render “All time” while preserving the stable `/all` route.
- Linear view exposes “View posters” as the return action.
- The backend data plan and decision log now require authored display strings plus optional normalized filtering values.

### Portfolio signal

Demonstrates content design and CMS product thinking: separating reader-facing editorial language from internal data structures.

## 2026-08-13 — Poster View composition and spacing pass

### Problem

After removing secondary detail content, the enlarged poster and its remaining text read as two disconnected blocks. The text column sat too far from the artwork, the close control floated beyond the content edge, and the title-to-metadata rhythm felt compressed.

### Decision

- Move the text column closer to the enlarged artwork while keeping a clear gutter between them.
- Widen the usable title measure so long film names wrap into a more balanced silhouette.
- Reserve space in the kicker row for the close control, anchoring it to the same content column.
- Increase the title-to-metadata gap to restore a deliberate editorial rhythm after removing the blurb and navigation.

### User benefit

Poster View now reads as one composed inspection state: artwork first, then a compact and clearly related identity block, with dismissal visibly attached to that block.

### Evidence and validation

- The revised 1440px reference layout uses a 110px artwork-to-copy gutter and a 520px text column.
- Long-title, short-title, dark-theme, and click-to-dismiss states are checked in the rendered interface.

### Portfolio signal

Demonstrates follow-through after feature pruning: revisiting composition and rhythm instead of leaving spacing optimized for content that no longer exists.

## 2026-08-13 — Poster View interaction simplification

### Problem

The expanded poster state repeated the rank already visible on the artwork, introduced an editorial blurb that was unnecessary for a ranked list, and provided previous/next controls that turned a focused inspection state into a second browsing mode.

### Decision

- Keep the poster's existing corner badge as the only rank indicator.
- Remove the detail blurb, divider, and previous/next navigation from Poster View.
- Retain only the list title, item title, creator, and year as essential context.
- Make any click in Poster View—including the expanded artwork—return to the carousel.
- Disable arrow-key and swipe item changes while a poster is expanded; posters can only be selected from the carousel.

### User benefit

The expanded state has one clear purpose: inspect a chosen cover or poster, then return immediately to the collection. It avoids duplicate information and eliminates two competing navigation models.

### Evidence and validation

- Poster View contains no duplicate rank, note, divider, or directional navigation.
- Pointer, Escape-key, arrow-key, and swipe behavior are verified against the single-action dismissal model.

### Portfolio signal

Demonstrates interaction pruning: removing technically available controls when they dilute the user's mental model instead of improving it.

## 2026-08-13 — Faster ambient carousel tempo

### Problem

The one-minute Lists carousel revolution felt slightly too passive for an interface whose primary visual pleasure comes from seeing the collection move through depth.

### Decision

- Shorten one complete carousel revolution from sixty seconds to forty-five seconds.
- Keep the tempo consistent across Films, Albums, and Books and independent of whether a list contains ten or twenty items.
- Preserve continuous movement during hover, filter menus, collapse, and expansion.

### User benefit

More of the collection becomes visible during a typical visit without making the carousel feel hurried or requiring active dragging.

### Evidence and validation

- The shared carousel clock now uses a fixed forty-five-second revolution.
- TypeScript and production-build verification confirm the timing change does not alter the surrounding interaction states.

### Portfolio signal

Demonstrates iterative motion tuning based on perceived pace rather than treating animation duration as an immutable implementation detail.

## 2026-08-13 — Twenty-item list capacity prototype

### Problem

The client needs the flexibility to publish lists containing up to twenty entries, while the carousel had only been evaluated with ten. Doubling the content could create poster collisions, unreadable metadata, altered rotation speed, or clipped edge states.

### Decision

- Expand Favorite Films of 2023 to twenty representative entries as a real-density prototype.
- Preserve the shared forty-five-second revolution and distribute entries evenly by item count, so capacity changes do not change the carousel's ambient angular speed.
- Use the existing rank, poster-ratio, type-study, and detail systems without creating a special visual mode for longer lists.

### User benefit

The client can choose the appropriate list length without learning a second publishing format, and the designer can assess the maximum intended density using realistic titles and metadata before backend fields are finalized.

### Evidence and validation

- The 2023 Films dataset contains twenty complete entries with natural ranks 1–20.
- Carousel angle spacing derives from the live item count, while revolution duration remains fixed at forty-five seconds.
- Production and rendered-browser checks are used to evaluate clipping, overlap, and interaction behavior at the maximum supported count.

### Portfolio signal

Demonstrates capacity planning, stress-testing with realistic content, and validating an expressive interface beyond its idealized ten-item state.

## 2026-08-12 — Lists carousel hierarchy and motion refinement

### Problem

The poster rank was embedded beside the title with a leading zero, which made the supporting metadata compete with the film title. A rust-colored outline around the front poster over-explained depth that was already visually obvious. Filter changes also felt mechanical: posters only partially contracted, paused after expansion, and did not convincingly disappear behind the central filter/title block.

### Decision

- Move the rank into a circular badge at the poster's top-right corner.
- Use natural numbering (`1`–`10`) instead of zero-padded numbering (`01`–`10`).
- Give the badge the page background, a thin theme-aware outline, and the same foreground color as surrounding text.
- Remove the rust-colored poster outline; reserve emphasis for spatial depth and content rather than redundant decoration.
- Rework filter motion as a two-part spatial sequence:
  1. Posters contract fully into the center and disappear behind the central text panel.
  2. The new set expands outward with depth-based staggering and immediately resumes continuous rotation when expansion completes.
- Use asymmetric easing: a faster, weighted inward collapse and a softer spring-like outward expansion.
- Preserve `prefers-reduced-motion` behavior so the expressive transition is optional rather than required for comprehension.

### User benefit

The title is easier to scan, rank remains visible without interrupting reading, and visual emphasis stays on the poster artwork. The filter transition now explains that the existing collection is being replaced by a new one, while the immediate return to motion removes the impression that the interface has stalled.

### Evidence and validation

- Rank remains programmatically associated with each poster through its accessible button label.
- Natural-number detail routes accept both existing one/two-digit URLs and canonicalize future navigation without leading zeros.
- Collapse target uses the exact carousel center and sits behind the higher-z-index central information block.
- Continuous rotation is re-enabled at the end of the expansion animation with no additional settle delay.
- Reduced-motion users receive an immediate content swap.
- TypeScript and production-build checks pass. A fresh rendered motion review remains pending because the local preview was blocked by the browser security reviewer after the final revision.

### Portfolio signal

Demonstrates hierarchy refinement, motion as state communication, restraint in removing redundant affordances, accessibility-aware animation, and iterative QA of a distinctive editorial interaction.

## 2026-08-12 — Continuous ambient motion through interaction

### Problem

The carousel stopped when a poster was hovered, when the Type or Year menu opened, and while a filter transition collapsed and rebuilt the collection. Those pauses made the interface feel event-driven and mechanical instead of like a continuously turning editorial display. The restart after expansion was especially noticeable because the motion clock itself had been suspended.

### Decision

- Treat carousel rotation as a persistent background clock rather than an interaction state.
- Keep rotation active during hover and while either filter menu is open.
- Keep the angular phase advancing throughout collapse and expansion, so the rebuilt collection emerges already in motion.
- Drive the structural collapse/expansion from the same animation-frame cadence as the live carousel instead of combining frequently changing positions with long CSS transform transitions.
- Continue pausing only when the carousel is no longer the active interface: an article detail is open, the linear list replaces it, or the reader requests reduced motion.

### User benefit

The page feels alive and physically coherent. Opening controls no longer interrupts the visual rhythm, and filter changes read as one continuous transformation instead of a stop–transition–restart sequence.

### Evidence and validation

- Hover and open-menu conditions were removed from the animation-loop gate.
- Filter-transition timing no longer clears or blocks the rotation accumulator.
- Collapse uses a balanced cubic curve and expansion uses a soft quintic ease, both calculated per frame; this prevents CSS transition retargeting from producing a jagged or rubber-band path.
- Detail, linear-list, and reduced-motion states retain intentional pauses for comprehension and accessibility.
- TypeScript and production-build verification pass. A clean browser session confirmed the filter transition completes without console errors, transition-style conflicts, or a delayed restart.

### Portfolio signal

Demonstrates motion-system thinking, iterative response to observed interaction feel, and the distinction between decorative animation and persistent spatial behavior.

## 2026-08-12 — Lists visual exploration controls

### Problem

Poster size, typeface, and light/dark palette materially changed the character and legibility of the carousel, but static mockups made those variables slow to compare.

### Decision

- Add a live type study with 12 locally bundled editorial typefaces.
- Add independent poster-size controls from 75% through 300%.
- Add a light/dark study, with the dark surface anchored to `#191514`.
- Persist choices in the URL so a specific combination can be revisited or shared during critique.
- Dynamically contract the halo geometry for oversized posters to prevent clipping and horizontal overflow.

### User benefit

Design decisions can be made in the real interaction rather than from disconnected stills. The client and designer can compare alternatives without code changes, while URL persistence turns each combination into a reproducible review state.

### Evidence and validation

- Ten representative poster images were optimized and placed into the 2024 film set.
- The 300% state was verified with no offscreen cards, center overlap, or horizontal overflow.
- Dark mode applies to the carousel, detail view, list view, menus, rules, and study panel rather than only swapping the page background.

### Portfolio signal

Demonstrates prototyping as a decision tool, systematic variable isolation, responsive geometry, and design-system thinking across themes and states.

## 2026-08-12 — Format-aware cover geometry

### Problem

Using one generic image rectangle for films, books, and albums made the content types feel interchangeable and forced future editorial assets into an arbitrary crop. The rank badge also sat inside the artwork, visually covering content instead of behaving like attached index metadata.

### Decision

- Give each collection a conventional media ratio: film posters use 2:3, book covers use 5:8, and album artwork uses 1:1.
- Keep the existing percentage control as a shared scale system while deriving height from the active content type.
- Center the rank badge precisely over the poster's upper-right corner, with half the circle extending past each edge, and enlarge both the badge and numeral for clearer hierarchy.
- Recalculate carousel bounds from the active cover height so large size-study options remain contained.

### User benefit

Each collection immediately reads as its native medium, supplied artwork requires less destructive cropping, and the rank stays easy to find without obscuring the cover.

### Evidence and validation

- Cover height is derived from the active List type rather than stored as one fixed value.
- Ratio changes happen while the collection is collapsed and hidden, preventing a visible geometry jump during filter changes.
- Badge offset is exactly half its own diameter on both axes, keeping its center locked to the poster corner across every poster-size option; the numeral scales with the circle.
- The badge is positioned relative to an explicit poster wrapper rather than the overall card, eliminating a transformed-layout offset caused by the metadata area below the artwork.

### Portfolio signal

Demonstrates content-aware component design, reusable proportional systems, and close translation of a Figma composition into responsive behavior.

## 2026-08-12 — Lists information and navigation simplification

### Problem

The first Lists implementation included an unnecessary Places category and a shared header that competed with the immersive carousel. Creator and year appeared side-by-side, reducing readability in narrow labels.

### Decision

- Reduce the type taxonomy to Films, Albums, and Books.
- Remove the interim header so the carousel owns the full viewport.
- Stack year beneath director, musician, or author consistently across cards, detail, and linear list views.
- Set the ambient carousel to one full revolution per minute.

### User benefit

The page is calmer and more focused, metadata scans vertically, and the slow continuous motion adds presence without demanding attention.

### Portfolio signal

Demonstrates scope discipline, information hierarchy, consistency across multiple representations, and calibrated ambient motion.

## 2026-08-12 — Administration recovery and draft cleanup

### Problem

Client testing revealed recovery drafts could not be deleted, published drafts remained visible in the draft board, and image-position sliders duplicated the more direct drag interaction.

### Decision

- Add draft deletion.
- Remove a draft from the board once it is successfully published.
- Remove horizontal and vertical sliders while retaining direct drag and pinch/zoom image positioning.

### User benefit

The authoring dashboard better matches the client's mental model: publishing completes the draft, obsolete recovery items can be cleared, and image composition uses fewer competing controls.

### Portfolio signal

Demonstrates response to client feedback, recovery-state design, lifecycle clarity, and simplification of novice-facing tools.

## 2026-08-10 to 2026-08-11 — Film Thoughts reading and publishing experience

### Problem

The film index and article template needed to preserve an editorial, magazine-like identity while remaining readable, responsive, searchable, and manageable by a single non-technical author.

### Decision

- Use PP Mori for display hierarchy and Cardo for editorial reading text.
- Reduce the index to a centered masthead and expandable search affordance.
- Use large image-led rows on desktop and a deliberately compressed mobile rhythm.
- Treat featured status as restrained editorial metadata instead of a conspicuous pinned-post badge.
- Add persistent article navigation, centered title/subtitle hierarchy, and a 2 × 2 related-reading footer.
- Build one central administration area with section-specific editors, recovery drafts, image repositioning, zoom, revision-safe publishing, and a local non-publishing QA sandbox.

### User benefit

Readers get a focused editorial experience across devices, while the client gets one learnable workflow for creating and maintaining content without needing developer intervention for routine publishing.

### Portfolio signal

Demonstrates end-to-end product thinking across public reading, responsive design, content operations, novice authoring, recovery, and system architecture.

## 2026-08-13 — Lists authoring without rigid taxonomy

### Problem

The visual Lists experience was complete, but a fixed Films/Books/Albums and
calendar-year model would force the author to ask a developer for collections
such as “Mid-1990s.” A generic database form would also expose implementation
language instead of reflecting how the author thinks about a list.

### Decision

- Add a dedicated Lists editor inside the existing central administration area.
- Let the author write the visible Type and Period while offering familiar
  examples through lightweight suggestions.
- Support ranked and unranked lists, manual drag/keyboard reordering, and a
  deliberately bounded 1–20 item workflow.
- Explain artwork ratios in content language: movie poster, book cover, album
  artwork, and landscape/widescreen.
- Keep imagery optional, but provide drag/zoom composition and require an image
  description when artwork is supplied.
- Show an optional external link only in Poster View, where the reader has
  already expressed interest in one item.
- Use private working revisions and immutable published snapshots so editing a
  live list never changes the public page until the author deliberately
  republishes.
- Limit v1 to one live list per Type + Period; defer multiple matching lists and
  their conditional title selector until usage demonstrates the need.

### User benefit

Juhaina can create unusual editorial groupings, recover accidental closures,
reorder up to twenty entries, and revise a published collection without
risking the live page. The form speaks in recognizable editorial terms and
keeps optional features out of the public interface when they are unused.

### Evidence and validation

- The local QA sandbox exposes the full editor without using the client’s
  account or Supabase content.
- Public list routing derives filters from published custom labels and retains
  the approved carousel/list/poster interactions.
- The API preserves unpublished and archived status during editing and blocks
  conflicting live Type + Period pairs at the database boundary.
- TypeScript and production build checks pass; local routes render the new
  editor and the existing Lists reader successfully.

### Portfolio signal

Demonstrates taxonomy design, progressive disclosure, novice-focused content
operations, accessibility-aware media handling, and lifecycle safety across a
distinctive public interaction.

## 2026-08-13 — Separate gestures for artwork and list order

### Problem

The whole list-item card was draggable for reordering while the artwork inside
the card also used dragging for crop positioning. The overlapping gesture
targets made an image adjustment capable of starting a card reorder, so both
interactions felt unreliable.

### Decision

- Restrict list reordering to a visible grip handle in the item’s order column.
- Keep arrow buttons as the precise keyboard and touch-friendly alternative.
- Isolate the artwork frame’s pointer capture and suppress native image dragging.
- Give the crop surface and reorder handle distinct grab feedback.

### User benefit

Dragging the image now always changes its crop, while dragging the grip always
changes list order. The author no longer has to move cautiously or undo an
accidental reorder.

### Portfolio signal

Demonstrates gesture disambiguation, larger-system authoring ergonomics, and
iterative refinement from observed client-side behavior.

## 2026-08-13 — Lists taxonomy guidance and settings alignment

### Problem

The Lists editor explained that custom Type values become public filters but
did not provide the same reassurance for custom Periods. A generic adjacent-
field margin also displaced most controls inside the grid, weakening the
relationship between labels, fields, and helper text.

### Decision

- Explain directly beneath Period that author-written values such as “Mid
  1990s” automatically appear in the public Period filter.
- Assign each settings field an explicit responsive grid area.
- Remove inherited sibling margins within this grid and align every field to a
  shared top edge.
- Give the ranking option a full-width divider so it reads as a list-wide
  behavior rather than a setting associated only with the Period column.

### User benefit

The author can confidently invent an era without needing developer help, and
the form now scans as two intentional rows followed by one collection-wide
choice.

### Portfolio signal

Demonstrates transparent taxonomy behavior, form rhythm, responsive alignment,
and the removal of ambiguous visual grouping.

## 2026-08-13 — Lists settings hierarchy reduced to 1–2–2

### Problem

The three-column settings grid gave Type more visual emphasis than Period and
made closely related controls harder to compare across rows.

### Decision

- Use a full-width List Title row.
- Pair Type with Period on the next row.
- Pair Creator Type with Poster Format on the final field row.
- Rename “Creator label” to “Creator Type” and provide Director, Author, and
  Artist as plain-language examples.
- Rename “Artwork format” to “Poster Format” while retaining all four supported
  aspect ratios.

### User benefit

The form now follows a simple 1–2–2 reading sequence: name the list, describe
how readers find it, then describe how each item is credited and framed.

### Portfolio signal

Demonstrates information grouping, plain-language field naming, and hierarchy
refinement for a novice authoring workflow.

## 2026-08-13 — Client-tested Lists authoring refinement

### Evidence

The first working Lists editor exposed several issues that static design review
did not reveal: image-crop dragging could trigger card reordering, custom Period
behavior was not self-explanatory, and a three-column settings layout weakened
field relationships. These were observed while exercising the real authoring
workflow rather than inferred from a mockup.

### Iteration

- Separated crop and reorder gestures with a dedicated grip handle.
- Preserved arrow-based reordering as the accessible, precise alternative.
- Explained that author-written eras such as “Mid 1990s” become public filters.
- Restructured List Settings from an uneven three-column grid to a 1–2–2
  sequence: List Title; Type/Period; Creator Type/Poster Format.
- Replaced implementation-oriented labels with editorial language and examples.

### Validation strategy

- Continue rapid implementation and automated checks locally.
- Promote complete vertical slices to Vercel staging for client review on real
  devices and authenticated accounts.
- Treat client confirmation as evidence for the next release decision, not as
  a ceremonial review performed only after the entire site is complete.
- Keep production isolated until a staging checkpoint is approved.

### Case-study narrative

This sequence supports a clear story: prototype the distinctive public Lists
interaction, build a novice-facing authoring workflow, observe gesture and
information-hierarchy friction in use, then simplify the system without
removing editorial flexibility.

### Portfolio signal

Demonstrates iterative product judgment, client feedback integration,
gesture-level UX refinement, editorial information architecture, and an
evidence-producing staging practice.

## Lists milestone — release-readiness validation

**What was validated**

The finished Lists experience was checked as a complete system rather than as
isolated screens: the continuously moving carousel, collapsed filter transition,
Poster View, list view, responsive scaling, and the novice-facing publishing
workflow were treated as one release candidate.

**UX and UI value**

This milestone confirms that the unconventional halo navigation still retains
basic usability safeguards: visible Type and Period controls, a plain-language
alternate list view, direct poster selection, click-anywhere dismissal, keyboard
escape support, reduced-motion handling, content-specific artwork ratios, and a
responsive presentation that preserves the composition instead of rebuilding it
as a generic card grid.

**Product-design takeaway**

The strongest portfolio story is not only the visual carousel. It is the paired
system: an expressive public interface supported by a deliberately conventional,
forgiving authoring tool with custom taxonomy, ranked or unranked lists, draft
recovery, crop controls, reorder handles, immutable published revisions, and
edit/republish states.

## 2026-08-13 — Lists mobile composition

### Problem

The first mobile implementation preserved the desktop halo by scaling the full
1440-pixel canvas to the phone width. It retained the composition but made the
filters, posters, labels, and alternate list view too small to use comfortably.

### Decision

- Preserve the halo concept on mobile, but establish a larger minimum stage
  scale and reshape the orbit into a device-relative vertical oval. Its width
  is calculated from the available phone width while its height expands with
  the viewport, keeping more of the collection visible and reducing dead space.
- Treat the alternate list view as a true full-viewport mobile interface rather
  than content inside the scaled desktop canvas.
- Reflow list rows into compact poster/title/credit groupings with comfortable
  tap targets.
- Stack the selected artwork and Poster View information vertically on narrow
  screens while retaining the same visual language as desktop.

### User benefit

The distinctive circular browsing behavior survives on mobile without making
basic reading, filtering, or selection dependent on zooming the page.

### Portfolio signal

Shows responsive art direction rather than mechanical desktop scaling: the
concept remains recognizable while interaction density and hierarchy adapt to
the device.

### Release decision

The denser mobile halo is accepted for v1. Additional poster-spacing, edge-title,
and phone-aspect-ratio polish is intentionally tracked as v2 work so the project
can advance to Moodboards without presenting the current mobile solution as the
final possible refinement.

## 2026-08-14 — Moodboards category/card separation

### Problem

A fixed 190px category anchor worked on tall and portrait canvases, but at a
wide 1600 × 800 viewport the centered card stack rose to the same band. The
category name then appeared printed inside the collage instead of labeling the
collection from the surrounding field.

### Decision

- Keep the approved 190px title anchor for portrait and tall layouts.
- Introduce a compact-landscape title band for viewports up to 900px high,
  placing the category above the card rather than changing card scale.
- Use a tighter short-landscape rule below 600px high so the title retains at
  least a visible separation from the stack as vertical space disappears.
- Preserve bare directional arrows and their full invisible hit targets.

### User benefit

The category label remains legible as navigation context instead of becoming
part of the artwork, while the collage keeps its intended scale and visual
priority across desktop, squeezed-window, and phone layouts.

### Portfolio signal

Shows breakpoint decisions based on component relationships—not device names:
the label and artwork are measured as separate semantic layers and remain
visually distinct under real window compression.

## 2026-08-14 — Moodboards authoring system and taxonomy safety

### Problem

The expressive public card-stack interface needed an authoring workflow that a
single non-technical editor could use without reconstructing collages in a
separate design tool. Category editing also introduced a high-risk edge case:
removing a category could accidentally strand or delete its moodboards.

### Decision

- Build a fixed 16:9 visual canvas with direct layer movement, proportional
  corner resizing, rotation, opacity, center guides, visibility, locking,
  duplication, deletion, and front/back controls.
- Preserve transparent imagery and normalize supported static source formats
  into web-ready assets; reject GIFs explicitly instead of silently flattening
  animation.
- Keep one selected layer at a time and pair direct manipulation with a named
  layer panel, making complex collages easier to understand and recover.
- Autosave drafts and source files locally, including duplicated layers, so a
  reload or accidental window close restores the composition.
- Require image descriptions only at publish time. Incomplete drafts remain
  saveable while the final public moodboard retains an accessibility gate.
- Treat categories as editable content: add, rename, and reorder them; move a
  moodboard by changing its category; and require a destination before deleting
  any occupied category. At least one category must always remain.
- Snapshot the public category at publish time. Moving a published moodboard
  during an edit therefore stays private until republishing, while deleting a
  category safely transfers both its drafts and its existing public references.
- Publish flattened preview and full-size outputs while preserving editable
  layer data and immutable published revisions behind the scenes.

### User benefit

The client gets a familiar, Figma-like collage workflow without needing Figma,
while guardrails protect both unfinished work and already-published pages.
Taxonomy can evolve after handoff without broken links or accidental content
loss.

### Evidence and validation

- Verified a local static-image upload, proportional resize, and free drag on
  the real 16:9 canvas.
- Verified duplicate, delete, and Undo behavior.
- Reloaded the page and confirmed the title, two duplicated image layers, and
  both underlying image files recovered successfully.
- Verified category creation, deletion, and ordering, then restored the default
  Memory / Material / Place sequence.
- Confirmed the administration UI has no horizontal document overflow at a
  1280-pixel viewport and the public Moodboards page still renders without
  browser warnings or errors.

### Portfolio signal

Demonstrates translation of an expressive frontend into a novice-specific CMS,
direct-manipulation interaction design, progressive validation, accessibility
gating, resilient draft recovery, safe taxonomy management, and a flattened
delivery pipeline that protects frontend performance.

## 2026-08-15 — Responsive Moodboards administration and full-canvas editing

### Problem

The Moodboards index retained five desktop columns after its workspace had
become too narrow, allowing title and category information to collide. An empty
category form also used a loading cursor, which incorrectly suggested that the
application had frozen. Inside the editor, the layer panel consumed space that
the collage needed for accurate visual composition.

### Decision

- Convert moodboard rows into clearly labelled responsive fields before the
  workspace becomes constrained, rather than waiting for a phone breakpoint.
- Keep the Add action clickable when the category name is empty and return a
  specific instruction; reserve the loading cursor for an actual request.
- Let the 16:9 moodboard canvas span the full authoring workspace and move the
  layers panel beneath it, preserving a complete, larger composition surface.
- Collapse title, category, and color settings progressively from three columns
  to two and then one as space decreases.

### User benefit

The client can identify every field at narrow widths, understands immediately
why a category cannot yet be added, and edits the collage at a scale much closer
to the published result.

### Portfolio signal

Shows responsive behavior based on available workspace, honest system-status
feedback, and prioritization of the primary direct-manipulation task.

## 2026-08-15 — Live taxonomy sync and focused full-screen composition

### Problem

Category changes made in the Moodboards manager could leave an already-open
editor showing stale options. The normal administration shell also limited the
working scale of an image-heavy composition, while simply hiding every control
in full screen would make the canvas harder—not easier—to edit.

### Decision

- Make the category selector a live view of the managed taxonomy: refresh it
  after same-browser category events, cross-tab storage changes, and window
  focus, with a server refresh in connected environments.
- Replace the canvas-level Add Images action with a clear Full screen action;
  image importing remains available in the layer controls and the empty state.
- Use the browser's native full-screen mode so the composition occupies the
  literal viewport and Escape retains its familiar exit behavior.
- Bring only the essential background and layer controls into a compact
  floating inspector. Place it at the lower-right by default, but let the
  editor drag and park it wherever it obscures the least important content.
- Keep layer visibility, locking, order, duplication, deletion, rotation,
  opacity, and image importing available without leaving the full-screen
  composition context.

### User benefit

The client sees category edits immediately and can compose against a much
larger, distraction-free canvas without losing the tools needed for iterative
image placement. The movable palette adapts to each collage rather than
forcing one permanently obstructed corner.

### Evidence and validation

- Added a temporary category in one administration tab and confirmed it
  appeared in the already-open editor without a reload, then removed the test
  category.
- Entered and exited the native full-screen canvas and confirmed the canvas
  host matched the viewport dimensions.
- Dragged the floating controls palette to a new canvas position and verified
  its background, layer, visibility, and lock controls remained available.

### Portfolio signal

Shows live state synchronization across related admin workflows, progressive
disclosure of authoring controls, spatial customization, and the use of native
browser behavior to reduce learning cost.

## 2026-08-15 — Direct layer ordering and compact Figma-style controls

### Problem

The full-screen palette repeated four large action buttons for layer order,
duplication, and deletion. Those controls made a small utility window feel
heavy, while range sliders made exact rotation and opacity values slower to
enter. The layer order itself was visible but not directly manipulable.

### Decision

- Make each layer row reorderable through a dedicated drag handle with a clear
  insertion state, in both the standard and full-screen layer panels.
- Replace rotation and opacity sliders with compact typed values, including
  degree and percentage units, validation, and safe limits.
- Remove the bottom action-button grid. Support Command/Ctrl+D to duplicate and
  Delete/Backspace to remove the currently selected layer.
- Add a familiar right-click menu with Duplicate and Delete as discoverable
  alternatives to the keyboard shortcuts.
- Put a small Undo icon directly into the draggable full-screen palette header,
  preserving the palette's dimensions and immediate canvas context.

### User benefit

Layer ordering now behaves like the design tools the client is likely to
recognize: the visible list is the control. Exact values are faster to set, the
palette leaves more room for the collage, and destructive or repetitive
actions remain available through both shortcuts and a visible context menu.

### Evidence and validation

- Dragged one layer past another and confirmed the visual list and canvas stack
  changed immediately, then restored the original order.
- Entered a negative rotation and a precise opacity value and confirmed both
  were applied to the selected canvas layer.
- Verified right-click Duplicate/Delete actions, Command+D duplication, and
  Delete-key removal.
- Reordered layers, opened full screen, used the compact Undo control, and
  confirmed the prior layer order was restored.

### Portfolio signal

Shows reduction of control chrome, direct manipulation, shortcut design with
discoverable fallbacks, precision-input patterns, and interaction validation
across pointer, keyboard, and context-menu paths.

## 2026-08-15 — Continuous canvas zoom and whole-row layer sorting

### Problem

The full-screen canvas was large but fixed, making detailed placement harder
on touch devices and trackpads. Layer ordering also felt indirect: only a small
grip could begin a drag, and the list did not visibly change until the pointer
was released.

### Decision

- Add focal-point-preserving pinch zoom to the full-screen canvas for both
  two-finger touch and trackpad pinch gestures, with a 60–400% safe range.
- Keep the canvas centered when zoomed out and constrain its travel when
  zoomed in so the composition cannot be accidentally thrown off-screen.
- Show the current zoom percentage in the existing full-screen toolbar rather
  than introducing another control panel.
- Make the entire layer row the drag target, while excluding visibility and
  lock controls so their actions remain reliable.
- Reorder the visible layer list continuously as the pointer crosses rows,
  with a lifted-row state and a single undoable history entry per drag.

### User benefit

The client can inspect and place small collage details without changing the
finished artwork scale. Layer ordering now follows direct-manipulation
expectations: there is a generous grab target, the content moves during the
gesture, and the result is immediately legible before release.

### Evidence and validation

- Dragged the first layer from the full row surface to the bottom of a
  three-layer list and confirmed the DOM order updated immediately, then
  restored the original order.
- Confirmed the full-screen canvas exposes its zoom status and both touch and
  trackpad gesture paths compile in the production build.
- Passed the full TypeScript check and production build after the interaction
  changes.

### Portfolio signal

Shows continuous direct manipulation, touch/trackpad parity, enlarged target
areas, gesture conflict prevention, spatial constraints, and undo-friendly
interaction design.

## 2026-08-15 — Bounded navigation for the zoomed moodboard canvas

### Problem

Zoom made small collage details easier to inspect, but there was no complete
desktop navigation model for reaching different parts of an enlarged canvas.
Adding an ordinary drag-to-pan interaction would also conflict with the
editor's primary layer-placement gesture.

### Decision

- Pan a canvas above 100% with two-finger trackpad scrolling while preserving
  Ctrl-wheel as focal-point zoom.
- Let two-touch gestures pan and zoom together by following their moving
  midpoint.
- Reserve Space-drag and middle-mouse drag for explicit mouse panning, leaving
  a normal primary-button drag available for layer movement.
- Clamp every zoom, pan, and viewport-resize update through one shared boundary
  calculation. Center any axis that fits; on an overflowing axis, stop at the
  exact point where a canvas edge meets the viewport edge.
- Show a grabbing cursor only during an active explicit pan gesture and keep
  the available gestures visible in the full-screen toolbar.

### User benefit

The client can reach fine details across a magnified moodboard without losing
the composition beyond the visible frame. Canvas navigation remains familiar
across touch, trackpad, and mouse hardware, and moving an image still requires
no mode switch.

### Evidence and validation

- Browser-tested a normal layer drag and confirmed its coordinates changed,
  then used Undo and verified the exact prior coordinates were restored.
- Confirmed scrolling at the centered 100% view does not translate the canvas.
- Verified the shared clamp centers a fitting axis and limits an overflowing
  axis to half the difference between scaled canvas and viewport dimensions;
  resize observation re-applies the same constraint while panned.
- Automated browser control could not synthesize a true pinch or held
  middle-mouse gesture, so those physical gesture paths remain appropriate for
  a final hardware smoke test.
- Passed the full TypeScript check and production build.

### Portfolio signal

Shows multimodal navigation design, gesture-conflict resolution, focal zoom,
edge-safe spatial constraints, resize resilience, and validation that protects
an existing direct-manipulation workflow.

## 2026-08-15 — Reduced full-screen canvas-control footprint

### Problem

The floating Canvas Controls palette occupied too much of the moodboard while
the client was composing in full screen.

### Decision

Reduce the palette's width and maximum height by roughly one-third, then tighten
its header, spacing, image previews, layer rows, and numeric controls to match.
Update its positioning fallbacks to use the new dimensions so dragging still
keeps the complete palette within the viewport.

### User benefit

More of the moodboard remains visible while the essential layer, color,
rotation, opacity, visibility, lock, add, and undo controls stay close at hand.

### Evidence and validation

- The control palette now targets a 14rem width instead of 21rem and a 24rem
  maximum height instead of 34rem.
- Passed the full TypeScript check after the responsive sizing change.

### Portfolio signal

Shows iterative density tuning for a tool palette and preservation of spatial
drag constraints after a substantial component resize.

## 2026-08-16 — Projections paired-column editorial index

### Problem

The final unbuilt subsite needed a distinct public index that could hold six
essays without importing Film Thoughts' calm white card language or assigning
an unrequested featured hierarchy.

### Decision

- Build a full-width, two-column editorial grid on a permanent `#2B2B2B`
  ground, with every entry using the same 340 × 255 image and text structure.
- Pin each excerpt to the image baseline with a space-between text column so
  rhythm comes from content structure rather than one-off offsets.
- Self-host Archivo and use only white plus three accessible gray levels; real
  editorial imagery supplies the page's color.
- Preserve the wide inter-column gap, square imagery, and title-only hover.
  Avoid cards, badges, buttons, imagery effects, and motion.
- Adapt wireframe navigation to the four actual Second Viewing sections and
  keep all entry URLs Projection-specific so Film Thoughts remains untouched.
- Stack the image at 16:9 on mobile, put the identity above a visible navigation
  row, retain 44px targets, and keep each entry to one keyboard stop.

### User benefit

Readers can scan six essays with equal editorial weight, move directly into an
article, and retain the same clear hierarchy on phone and desktop. The client
gets a visually distinctive section without learning a new interaction model.

### Evidence and validation

- Browser-measured the 1440px composition: 40px page insets, two 650px tracks,
  60px column gap, 340 × 255 images, and 40px row gaps.
- Compared the source and final implementation in a single normalized image and
  repeated the check on a focused header/first-row crop.
- At 390 × 844, confirmed a 390px document width, 358 × 201.375 first image,
  44px navigation targets, and no horizontal overflow.
- Confirmed six authored alt descriptions, one h1, six h2s, six single-link
  entries, a working reader route, and no browser console errors.
- `npm run typecheck` and `npm run build` passed; `design-qa.md` records the
  complete comparison and final passed result.

### Portfolio signal

Shows high-fidelity screenshot translation, equal-weight editorial hierarchy,
responsive art direction, semantic whole-entry linking, local font delivery,
image-alt authorship, and evidence-driven visual QA inside an existing product.

## 2026-08-16 — Seven comparable Projections reader studies

### Problem

The client had approved the Projections index but had not selected an article
layout. Seven editorial references contained useful but substantially different
reading systems, making a prose-only comparison too abstract.

### Decision

- Build seven isolated reader studies using one title, excerpt, article body,
  metadata set, and editorial still so structural differences remain legible.
- Translate each reference's defining system—split opener, centered literary
  essay, metadata sidebar, image/title diptych, high-impact color field,
  monumental modular news layout, and narrow culture dispatch—without copying
  unrelated publication chrome.
- Omit all inline article images and third-party modules. Keep lead imagery at
  Projections' 4:3 desktop and 16:9 mobile ratios, with the type-led Signal
  direction retaining the reference's intentional no-image opener.
- Provide a comparison gallery and persistent numbered switcher so the client
  can move between studies without returning to production article routes.

### User benefit

The client can compare seven working reading experiences against identical
content, judge hierarchy and reading character directly on desktop and phone,
and select or combine a direction without disturbing the approved public index.

### Evidence and validation

- Browser-captured every study at 1440 × 1000 and 390 × 844 and stored one
  source-versus-implementation comparison per direction.
- Measured every image-bearing study at 1.333 on desktop and 1.778 on mobile;
  all document scroll widths matched their viewports.
- Verified gallery-to-study and study-to-gallery navigation, semantic headings,
  authored alt text, active-study state, visible focus treatment, no inline body
  images, and a clean browser console after fixes.
- `npm run typecheck` and `npm run build` passed; `design-qa.md` records the
  iteration history and final passed result.

### Portfolio signal

Shows multi-reference editorial synthesis, controlled content comparison,
responsive art direction, typography-led differentiation, accessible
comparison navigation, and evidence-based design QA before client selection.

## 2026-08-18 — Persistent color lab for reader studies

### Problem

Seven article layouts were ready for client comparison, but their reference-
derived colors made it difficult to judge palette independently from structure.
The designer needed to apply the same candidate pairs across every layout and
move between studies without losing the active choice.

### Decision

- Add one reusable color-lab shell to all seven study routes with the seven
  supplied background/text pairs plus the Projections home gray/white pair.
- Present each pair as an actual `Aa` foreground-on-background swatch, with
  direct selection, wrapping previous/next controls, and a live background-
  first hex readout.
- Persist the selected palette locally and reflect it in the query string so
  changing article structure does not reset the color comparison.
- Treat the invalid supplied `#66FFCS` as the clearly labelled working
  assumption `#66FFC5`, keeping the ambiguity visible until confirmed.
- Keep the ideation controls visually neutral and outside the production index
  and reader routes.

### User benefit

The designer can separate color judgment from layout judgment, scan all eight
pairs on any reader, then switch article structures while preserving the active
palette. A future client review can reproduce a chosen state from its URL.

### Evidence and validation

- Browser-cycled through all eight palettes and confirmed exact computed color
  values, one active pressed state, URL updates, and wraparound to Home.
- Confirmed Color 6 persisted from Chorus to Literary and all seven studies
  rendered Color 2 without horizontal overflow or console warnings.
- Calculated contrast ratios from 6.59:1 to 16.57:1 across the complete set.
- At 390 × 844, measured 44 × 44px minimum controls, a 366px dock within 12px
  insets, an internally scrolling swatch rail, and no document overflow.
- `npm run typecheck` and `npm run build` passed; `design-qa.md` records the
  comparison, iteration, and final passed result.

### Portfolio signal

Shows controlled design-variable testing, accessible color comparison,
stateful cross-route prototyping, explicit ambiguity handling, contrast
validation, and mobile utility design that preserves the underlying artifact.

## 2026-08-18 — Film Reviews mock-content mode

### Problem

The public Film Reviews subsite was reading directly from the configured
publishing backend, so a partial test publication could replace the complete
six-review portfolio fixture set on the mock site.

### Decision

- Make the public `/films` index and article routes use the six curated film
  fixtures by default.
- Keep the publishing data path intact behind `FILMS_CONTENT_MODE=published`
  so the site can switch to authored content without another code change.
- Apply the same content mode to related-review cards so index, article, and
  recommendation states remain internally consistent.

### User benefit

The portfolio-facing mock site now presents a complete, intentional Film
Reviews experience while preserving a clean handoff to live editorial content.

### Evidence and validation

- Confirmed exactly six mock reviews on `/films` with no backend test entries.
- Opened the Aftersun review and verified its full mock article plus four
  related reviews.
- `npm run typecheck` and `npm run build` passed.

## 2026-08-18 — Final Projections reader direction

### Problem

Seven article structures and eight palettes were still presented as equal
studies, while the production Projection routes retained an earlier generic
reader. The client selection needed to become the real article experience.

### Decision

- Promote Study 3, the metadata-sidebar reader, to every public
  `/projections/[slug]` route.
- Lock the selected Color 1 pair: `#343839` background and `#FEFEFE` text.
- Preserve the selected study's 180px metadata rail, 620px reading column,
  4:3 desktop lead, 16:9 mobile lead, uppercase deck, and pull quote.
- Remove study-navigation and palette controls from the production reader while
  retaining the comparison lab for historical review.

### User benefit

Projection articles now have one coherent, client-approved reading system on
desktop and mobile, while the experimentation space remains available without
leaking into the public experience.

### Evidence and validation

- Browser comparison against the selected Sidebar study confirmed the same
  image scale, metadata hierarchy, title wrapping, reading measure, and mobile
  stacking order.
- Browser-computed colors matched `rgb(52, 56, 57)` and
  `rgb(254, 254, 254)` exactly.
- The longest fixture title fit at 390px with no horizontal overflow; the mobile
  lead measured exactly 16:9 and the browser console was clean.
- `npm run typecheck` and `npm run build` passed.

### Portfolio signal

Shows disciplined convergence from multi-direction exploration to a production
editorial system, including responsive validation and exact token handoff.

## 2026-08-18 — Independent Mirror's Edge image direction

### Decision

- Replace all six Projection stills with the supplied Mirror's Edge image set.
- Keep the existing article titles, excerpts, subjects, dates, and body copy
  unchanged; the image layer is intentionally independent from the text layer.
- Optimize the six strongest supplied sources as WebP assets and retain
  authored, image-specific alternative text and focal positions.

### Evidence and validation

- Confirmed all six images load on the Projection index and the finalized
  reader while all six existing titles and excerpts remain unchanged.
- Browser console remained clean and `npm run typecheck` plus
  `npm run build` passed.

## 2026-08-19 — Client-managed launch samples and Projections authoring

### Problem

The production mock site mixed bundled portfolio fixtures with a real Supabase
backend. Uploaded content did not overwrite fixture files, but the author could
not remove samples through the admin, Films was locked to mock mode, and
Projections had no authoring workflow.

### Decision

- Add one protected Sample content screen with individual remove/restore actions
  across all four editorial sections.
- Keep samples as a reversible launch layer while merging real promoted content;
  database entries take priority on matching public keys.
- Remove the Film-only content-mode switch and fail closed when production
  visibility state cannot be read, preventing deleted samples from unexpectedly
  returning.
- Build a section-specific Projections editor on the established working-
  revision and immutable-publication architecture.

### User benefit

The client can onboard gradually: publish real work without losing the remaining
portfolio presentation, remove each sample when ready, and restore an accidental
removal. Projections now follows the same understandable save/publish safety
model as the other editorial sections.

### Evidence and validation

- Supabase migration dry run passed and the migration applied successfully.
- Public Films and Projections loaders returned both database and visible sample
  content without duplicate matching keys.
- Browser QA confirmed the protected navigation, sample-management surface, and
  hydrated Projections editor controls.
- `npm run typecheck` and `npm run build` passed.

### Portfolio signal

Demonstrates a reversible content-migration strategy, safe client onboarding,
and reuse of a mature publishing architecture without flattening distinct
editorial products into one generic CMS form.

## 2026-10-30 — Faster homepage 3D assets

### Problem

Juhaina reported that the homepage objects appeared too slowly. The page
downloaded all eight study models, although only four are shown, and the
published models retained large textures and compressible geometry data.

### Decision and rationale

Prefer actual download reduction over a loading screen. Preload only the
four published pairings and export the VCR, flower, and cigarette box with
WebP textures and Meshopt compression. Preserve every triangle and normalize
the flower's repeating UV tiles so its texture coordinates compress better.
Keep the small Nokia unchanged. Retain alternatives as on-demand study assets.

### User benefit

Visitors download 75.2% fewer GLB bytes (26.50 MB → 6.57 MB), while the
homepage keeps its established objects, labels, motion, and immediate links.
No blocking loading screen is introduced.

### Evidence and validation

All optimized files decode through the installed runtime Meshopt decoder;
vertex, triangle, and material counts match the originals. Browser inspection
confirmed all four objects render without model errors. Type checking and
the production build passed. A reproducible export script and
[validation record](audits/homepage-loading-2026-10-30/validation.md) retain
the exact before/after sizes and visual evidence. Timing improvements have
not been measured on the deployed site; this is a local change.

### Portfolio signal

Demonstrates performance work guided by client feedback, removal of competing
requests, and asset optimization with explicit visual and geometry checks.

## 2026-10-30 — Homepage objects visible in the initial HTML

### Problem

After the compressed models were deployed, the client still found their
first appearance too slow. Download reduction alone left JavaScript startup,
model decoding, texture upload, and WebGL initialization ahead of any object
appearing. Public asset requests also passed through session refresh.

### Decision and rationale

Embed transparent first-pose renders of all four actual models in the initial
HTML, then progressively replace each with live 3D after its first rendered
frame. Start enhancement after the previews can paint. Keep the previews if
JavaScript, WebGL, or a model request fails. Prebuild the public homepage,
apply review-only query parameters in the browser, preload a much smaller
background, and limit session refresh to authoring/authentication routes.

### User benefit

All four objects and their links appear without waiting for the 6.57 MB of
live models or the 3D JavaScript bundle. The four inline preview images total
18.46 KB, and the background falls from 1.19 MB to 46.26 KB. Visitors retain
the rotating objects when enhancement finishes and useful navigation when
it cannot finish. No loading screen is introduced.

### Evidence and validation

- Production build lists `/` as statically generated. Its initial HTML
  contains four previews and the background preload; gzip size is 21,112 bytes.
- Browser verification with all JavaScript blocked shows four decoded,
  visible previews, four links, and zero canvases.
- Deliberately failing every GLB request still shows all four previews.
- Normal rendering replaces all four previews with live canvases without
  model errors. Type checking and production build pass.
- Unauthenticated admin page/API requests still return 307/401, and
  admin-only mode still blocks the public homepage and assets with 404.
- [Validation and visual evidence](audits/homepage-first-paint-2026-10-30/validation.md).

### Portfolio signal

Shows iteration from client feedback, a distinction between download size
and first appearance, and progressive enhancement verified under failure
conditions rather than relying only on a fast development connection.
