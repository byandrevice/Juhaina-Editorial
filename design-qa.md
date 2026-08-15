# Moodboards category/card separation — design QA

- Source visual truth: attached recording
  `Screen Recording 2026-08-14 at 12.14.56 PM.mov`
- Source thumbnail:
  `docs/audits/moodboards-category-outside-2026-08-14/source-recording-thumbnail.png`
- Combined comparison:
  `docs/audits/moodboards-category-outside-2026-08-14/comparison-source-vs-implementation.png`
- Implementations:
  - `docs/audits/moodboards-category-outside-2026-08-14/implementation-1600x800.png`
  - `docs/audits/moodboards-category-outside-2026-08-14/implementation-1024x600.png`
  - `docs/audits/moodboards-category-outside-2026-08-14/implementation-390x800.png`
- Source thumbnail pixels: 1600 × 812.
- Implementation pixels / CSS viewports: 1600 × 800, 1024 × 600, and
  390 × 800 at device scale factor 1; the combined comparison normalizes both
  wide captures to 800px width.
- State: light theme, idle card stack, compact landscape and portrait checks.

## Full-view comparison evidence

The source recording shows the category word `PLACE` crossing the upper edge of
the collage. In the corrected 1600 × 800 capture, `MEMORY` sits in the empty
field above the card with 61.75px of measured clearance. The 1024 × 600 capture
retains 21.02px of clearance, and the 390 × 800 portrait retains 126.16px.

## Focused-region comparison evidence

The upper title/card region is large enough in the combined comparison to judge
the failure directly: source type is visually embedded in artwork; revised type
is fully surrounded by the page field before the card begins. Bare edge arrows
remain unchanged and free of resting squares.

## Required fidelity surfaces

- Fonts and typography: Newsreader family, category weight, size, tracking,
  line height, capitalization, and card-caption typography are unchanged.
- Spacing and layout rhythm: portrait/tall screens retain the approved 190px
  anchor. Landscape canvases up to 900px high use an 82–112px title band; very
  short landscapes use a 64–84px band. All tested states keep a positive gap.
- Colors and visual tokens: field, paper, text, shadows, and theme-switch tokens
  are unchanged.
- Image quality and asset fidelity: source collage assets, contain-fit behavior,
  scale, crop, shadow, and card depth are unchanged.
- Copy and content: category and moodboard names remain unchanged.

## Interaction and accessibility evidence

- Four directional buttons retain their ARIA labels, responsive hit areas, and
  keyboard focus outlines while rendering as bare icons.
- Horizontal board navigation was exercised after the responsive change; the
  title/card separation remains structural rather than tied to one artwork.
- Browser console check: zero warnings and zero errors.
- TypeScript and production build: passed.

## Findings

No actionable P0, P1, or P2 findings remain. The title and artwork are separate
at every tested compact-landscape and portrait viewport.

## Comparison history

1. The recording exposed a P1 hierarchy failure: the category title entered the
   collage at a 1600 × 800-style viewport.
2. A compact-landscape title band was added without changing card scale.
3. The 1024 × 600 short-landscape rule was tightened from 13px to 21px of
   measured clearance.
4. Final wide, short-landscape, and portrait captures confirm positive
   title-to-stack separation with bare arrow controls preserved.

## Implementation checklist

- [x] Keep the category outside the poster at 1600 × 800
- [x] Preserve a visible gap at 1024 × 600
- [x] Preserve the approved lower title placement on portrait/tall screens
- [x] Keep directional arrows bare with accessible hit targets
- [x] Confirm clean browser console
- [x] Pass TypeScript and production build

## Follow-up polish

No P3 follow-up is required for this scoped correction.

final result: passed
