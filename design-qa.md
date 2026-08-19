# Projections R1 design QA

Date: 2026-08-16

## Comparison target

- Source visual truth: `docs/audits/projections-r1-2026-08-16/source-reference.png`
- Implementation route: `http://localhost:3000/projections`
- Final implementation screenshot: `docs/audits/projections-r1-2026-08-16/implementation-desktop-1440-final.png`
- Mobile screenshot: `docs/audits/projections-r1-2026-08-16/implementation-mobile-390.png`
- Full-view comparison: `docs/audits/projections-r1-2026-08-16/comparison-source-vs-implementation-final.png`
- Focused comparison: `docs/audits/projections-r1-2026-08-16/comparison-header-first-row-final.png`
- State: index page at rest, dark theme, images loaded

## Viewport and normalization

- Source pixels: 1622 × 1258. The source was proportionally normalized to 1440px wide (1440 × 1117) because the handoff identifies a 1440px design width.
- Implementation pixels: 1440 × 1100 screenshot at a 1440 × 1100 CSS viewport. The in-app browser reported devicePixelRatio 2 but returned a 1:1 1440px viewport capture, so no additional density scaling was applied.
- Responsive evidence: 390 × 844 CSS viewport and 390px screenshot width.
- Both compared desktop images show the same default, non-hovered page state.

## Findings

- No actionable P0, P1, or P2 differences remain.
- Fonts and typography: Archivo is self-hosted as one 36KB latin variable WOFF2 and limited to the used 400–500 weight range in CSS. Desktop title, essay, metadata, excerpt, navigation, identity, and footer sizes match the engineering handoff. Titles remain untruncated. The reference used Helvetica Neue as a wireframe placeholder, so small glyph-width changes from Archivo are expected.
- Spacing and layout rhythm: the measured implementation uses 40px page insets, two 650px columns with a 60px gap, 340 × 255 image slots, 28px image-to-text gaps, 40px row gaps, and 255px entry heights. The full comparison confirms equal visual weight, square corners, no cards, and preserved negative space.
- Colors and tokens: browser-computed ground is rgb(43, 43, 43), matching `#2B2B2B`. White and the three restrained gray levels follow the supplied token set; only supplied imagery introduces color.
- Image quality and asset fidelity: all six supplied local editorial images render as real optimized images with stable 4:3 crops, authored focal points, and specific non-empty alt text. No CSS art, generic placeholder, overlay, filter, radius, or image animation is present.
- Copy and content: all six titles, metadata lines, dates, and excerpts match the handoff. Product navigation is intentionally adapted to the four real Second Viewing sections and marks Projections active; the source's Books/Notebook/Index/About labels were wireframe residue. The footer points to the existing Films index so it is functional.
- Responsive behavior: at 390px the identity precedes a four-link, 44px-tall navigation row; entries stack into full-width 16:9 images followed by 22px titles, 13px metadata, and 15px excerpts. Measured document scroll width equals viewport width, so there is no horizontal overflow.
- Accessibility and interaction: the DOM contains one h1, six h2s, six entry links, one tab stop per entry, `aria-current="page"`, visible `:focus-visible` styles, semantic times, and six authored image alternatives. The first article link navigated successfully to its static `/projections/[slug]` reader route.
- Performance and runtime: the index is a Server Component with no page-specific client JavaScript or runtime state. Image dimensions are reserved by the 4:3/16:9 containers. Browser console contained no errors. Next development mode issued one LCP heuristic warning for a lower lazy image after cache/reload; the implementation intentionally follows the supplied rule to eager-load only the first two entries.

## Comparison history

### Iteration 1

- [P2] Several provisional alt strings described thematic scenes rather than the actual local editorial images.
- [P2] A three-line CSS clamp could have truncated a long essay title at narrow intermediate widths, conflicting with the no-truncation requirement.
- Fixes: rewrote the five affected alt descriptions from direct image inspection and removed the line clamp while retaining natural three-line wrapping for the supplied content.
- Post-fix evidence: the final DOM/browser metrics list six specific non-empty alt strings, and the desktop and mobile screenshots show complete titles without ellipses.

### Iteration 2

- The final full-view and focused comparisons found no remaining actionable P0/P1/P2 issues.
- The visual differences that remain are expected: real editorial imagery replaces the wireframe's gray load-state boxes; project-native navigation replaces placeholder site sections; Archivo replaces the Helvetica wireframe face; and the implementation follows the handoff's exact 34px/26px title-band values even where the screenshot is a few pixels looser.

## Primary interactions and console

- Tested index-to-reader navigation for the first entry.
- Confirmed all section/footer links are semantic anchors and all six entries are single link targets.
- Confirmed the mobile layout has ≥44px navigation targets and no horizontal overflow.
- Checked browser console after index and reader navigation: no errors.

## Implementation checklist

- [x] Two equal-weight paired columns at desktop
- [x] One-column image-left layout at intermediate widths
- [x] Full-width 16:9 mobile stack
- [x] Self-hosted Archivo and supplied color/type tokens
- [x] Real imagery, focal crops, and authored alt text
- [x] Working Projection-specific reader links
- [x] TypeScript and production build pass

## Follow-up polish

- P3: Replace the current representative local imagery and film-oriented fixture metadata when the first real Projection articles are authored; the layout and data adapter are ready for that content.

## 2026-08-18 — Film Reviews fixture restoration

- Verified `/films` renders the six intended mock reviews in the expected
  featured/date order and excludes the backend test entry.
- Verified `/films/the-empty-room-in-aftersun` renders the complete mock body
  and four related fixture reviews.
- Public content mode defaults to fixtures; setting
  `FILMS_CONTENT_MODE=published` restores the existing backend-driven path.
- Fresh browser verification reported no console warnings or errors.
- TypeScript and production build checks passed.

final result: passed

---

# Final Projections reader — design QA

Date: 2026-08-18

## Comparison target

- Source visual truth:
  `docs/audits/projections-layout-studies-2026-08-16/sidebar-desktop-1440.png`
  and `sidebar-mobile-390.png`.
- Implementation route:
  `http://localhost:3000/projections/the-empty-room-in-aftersun`.
- Implementation captures:
  `docs/audits/projections-final-reader-2026-08-18/implementation-desktop-1440-top.png`
  and `implementation-mobile-390.png`.
- Combined comparisons:
  `layout3-source-vs-final-color1.png` and
  `layout3-source-vs-final-color1-mobile.png`.
- State: first fixture article at rest, selected Sidebar structure, finalized
  Color 1 palette, no comparison-lab controls.

## Viewport and normalization

- Desktop source and implementation comparison: 1440 × 1000 pixels at a
  1440 × 1000 CSS target. The in-app browser emitted a 1440px-wide full-page
  capture at 1:1 output density; its top 1000px were cropped for equal framing.
- Mobile source and implementation comparison: 390 × 844 pixels at a
  390 × 844 CSS viewport and devicePixelRatio 1.

## Full-view and focused evidence

- The combined desktop view confirms the selected 780 × 585 lead, 180px
  metadata rail, 48px gutter, 620px reading column, title scale, deck, and
  left-aligned composition remain intact after promotion to production.
- The combined mobile view confirms the same 16:9 lead, two-column metadata
  grid, full-width title, uppercase deck, and single-column body sequence.
- A separate focused crop was unnecessary because both equal-size combined
  views render the navigation, metadata, title, deck, and opening body copy at
  readable scale.

## Findings

- No actionable P0, P1, or P2 differences remain.
- Fonts and typography: Archivo, weights, title tracking, 0.98 title leading,
  uppercase deck, 17px body, and metadata scale match Study 3.
- Spacing and layout rhythm: the production reader preserves the selected
  study's masthead-relative 96px top gap, image scale, 38px image-to-grid gap,
  metadata/content tracks, and responsive stacking order. The lab-only study
  switcher is intentionally absent.
- Colors and tokens: browser-computed background is `rgb(52, 56, 57)` and text
  is `rgb(254, 254, 254)`, exactly matching Color 1.
- Image quality: the existing optimized editorial still, authored alt text,
  focal positioning, 4:3 desktop crop, and exact 16:9 mobile crop are retained.
- Copy and content: all dynamic Projection metadata remains fixture-specific;
  the selected full study body length and pull quote replace the earlier
  five-paragraph generic reader.
- Accessibility and responsiveness: the article has one h1, semantic time and
  aside, authored image alternative, visible link focus states, a 390px
  document width at the 390px viewport, and no long-title overflow.
- Runtime: navigation links remained functional and the fresh console contained
  no warnings or errors.

## Comparison history

- First normalized desktop and mobile comparisons found no actionable
  P0/P1/P2 mismatch. No visual correction iteration was required.

## Implementation checklist

- [x] Study 3 promoted to all public Projection article routes
- [x] Color 1 fixed at `#343839 / #FEFEFE`
- [x] Lab controls excluded from production
- [x] 4:3 desktop and 16:9 mobile image treatment
- [x] Longest title checked at 390px without overflow
- [x] Clean browser console
- [x] TypeScript and production build pass

final result: passed

---

# Projections reader color-lab design QA

Date: 2026-08-18

## Comparison target

- Existing visual source: the seven approved reader-layout studies and their
  browser captures in `docs/audits/projections-layout-studies-2026-08-16/`.
- Color source of truth: the seven background/text pairs supplied by the user,
  plus the Projections home pair `#2B2B2B / #FFFFFF`.
- Implementation routes: all seven static routes under
  `/projections/layout-studies/[study]`.
- Browser evidence: `docs/audits/projections-color-lab-2026-08-18/`.
- Combined comparison:
  `layout-before-vs-home-palette.png`, showing the unchanged Chorus structure
  and the color-lab version in one normalized image.

## Scope and normalization

- Desktop captures use a 1440 × 1000 CSS viewport; the mobile capture uses a
  390 × 844 CSS viewport.
- Color 3 contained the invalid hexadecimal value `#66FFCS`. The implementation
  explicitly labels the working interpretation `#66FFC5`; this remains an
  assumption for the user to confirm or replace.
- Color switching is an ideation overlay only. It does not change the approved
  Projections index, production reader routes, database, or deployment state.

## Findings

- No actionable P0, P1, or P2 differences remain.
- Color fidelity: browser-computed background/foreground pairs matched all
  eight configured hex pairs exactly. Contrast ratios range from 6.59:1 to
  16.57:1, so every pair exceeds WCAG AA for normal text.
- Layout preservation: all seven studies retain their existing typography,
  spacing, image ratios, metadata, and responsive structures. The color lab
  overrides only the reader ground and foreground; the fixed study navigation
  and color controls remain stable neutral utilities.
- Interaction: previous/next buttons wrap through the complete eight-palette
  cycle. Direct `Aa` swatches select a pair, `aria-pressed` exposes the active
  choice, the live output displays background first and foreground second, and
  the selected value is written to the URL and retained across study routes.
- Mobile: the control dock fits within 12px viewport insets, the swatch rail
  scrolls horizontally, all ten buttons measure at least 44 × 44px, and the
  document remains exactly 390px wide with no horizontal page overflow.
- Accessibility: the palette is a labelled region with a labelled option group,
  semantic buttons, visible focus and selected states, readable hex output,
  and a visible Color 3 assumption label. No motion is required to compare
  colors.
- Runtime: all seven layouts rendered the selected Color 2 pair correctly in a
  browser loop. The fresh browser console contained no errors or warnings.

## Comparison history

### Iteration 1

- [P2] Mobile palette controls initially measured 36px, below the project's
  established practical touch-target size.
- Fix: increased mobile previous, next, and swatch controls to 44 × 44px while
  retaining horizontal option scrolling inside the fixed dock.

### Iteration 2

- Browser measurement confirmed a 44px minimum target, 390px document width,
  exact color output, one active pressed state, and a visible `#66FFC5`
  assumption label. No further P0/P1/P2 issues remained.

## Validation

- [x] Home plus seven supplied palettes available on every study
- [x] Exact browser-computed background and foreground colors
- [x] Previous/next wraparound and direct selection
- [x] Palette persistence between reader layouts and query-string state
- [x] Minimum contrast ratio 6.59:1
- [x] 44px mobile targets and no page overflow
- [x] Clean browser console
- [x] TypeScript and production build pass

final result: passed

---

# Projections reader-layout studies design QA

Date: 2026-08-16

## Comparison target

- Source visuals: the seven user-supplied full-page captures from C41, Real
  Life, Lampoon, Noema, Crack, SHOWstudio, and Dazed.
- Implementation gallery: `http://localhost:3000/projections/layout-studies`
- Implementation routes: the seven static routes under
  `/projections/layout-studies/[study]`.
- Evidence directory:
  `docs/audits/projections-layout-studies-2026-08-16/`
- Combined comparisons: one `*-source-vs-implementation.png` per study, with
  the supplied source and browser-rendered implementation in the same image.
- State: article opener at rest, fonts and lead image loaded.

## Viewport and normalization

- Desktop implementation captures: 1440 × 1000 pixels at a 1440 × 1000 CSS
  viewport.
- Mobile implementation captures: 390 × 844 pixels at a 390 × 844 CSS
  viewport.
- The supplied references are long-page captures with different intrinsic
  widths and heights. Each combined comparison preserves the complete source
  at left and the 1440 × 1000 implementation opener at right inside equal
  700 × 960 contain frames. The comparison therefore judges structural design
  cues rather than claiming a pixel clone of unrelated publication chrome.
- The requested product adaptation is intentional: inline article imagery,
  advertising, audio players, and third-party utilities are absent; lead images
  use Projections' 4:3 desktop and 16:9 mobile ratios.

## Findings

- No actionable P0, P1, or P2 differences remain.
- Fonts and typography: each route retains the reference's defining hierarchy
  with project-available, locally loaded faces—Archivo for modern editorial
  systems, Newsreader for literary systems, and IBM Plex Mono for compact
  metadata. Title wrapping, body measure, line height, weight, and pull-quote
  scale were checked in the combined comparisons and at 390px.
- Spacing and layout rhythm: the seven routes preserve their source structures:
  split opener, centered essay, sidebar rail, title/image diptych, long color
  field, image-led modular news page, and compact feature rail. The studies do
  not inherit generic cards, radii, or shadows. Desktop and mobile document
  widths equal their viewport widths, with no horizontal overflow.
- Colors and tokens: each study maps the reference's dominant ground/foreground
  relationship into a restrained two-color system. Text contrast remains high;
  active study navigation uses a clear inverted state.
- Image quality and asset fidelity: all image-bearing studies reuse one real,
  optimized editorial still with authored alt text and focal positioning. Every
  desktop lead measures 1.333 (4:3), every mobile lead measures 1.778 (16:9),
  and the Signal study intentionally has no lead image because its reference is
  a type-and-color opener. There are no inline body images or placeholder art.
- Copy and content: identical title, excerpt, author, date, reading time, and
  article paragraphs make comparison fair. Study names describe reading
  character rather than presenting a recommendation as a decision.
- Accessibility and interaction: each article has one h1, semantic article
  text, a semantic time, authored lead alt text, visible focus styles,
  `aria-current` on the active study, reduced-motion handling, and keyboard-
  operable links. Gallery-to-study and study-to-gallery navigation passed.
- Icons and AI-shortcut artifacts: no iconography is required by the core
  comparison flow. The gallery now uses real browser-rendered study previews;
  it contains no CSS-drawn stand-ins, generated filler art, decorative blobs,
  or approximate logos.

## Comparison history

### Iteration 1

- [P2] Monument and Dispatch capped their full-width lead images by viewport
  height, producing ratios wider than the required Projections 4:3 desktop
  treatment.
- [P2] The article-body render produced a duplicate-key console warning at the
  pull-quote insertion point.
- [P2] Gallery cards initially used abstract CSS miniatures instead of direct
  visual evidence from the built studies.
- Fixes: removed the height caps, grouped quote/paragraph pairs in keyed React
  fragments, and replaced the abstract miniatures with real study screenshots.

### Iteration 2

- Browser recapture confirmed 1.333 desktop lead ratios and 1.778 mobile lead
  ratios, no horizontal overflow across all seven routes, seven real gallery
  previews, successful navigation, and a clean console in a fresh browser tab.
- The final combined source/implementation images showed no remaining P0/P1/P2
  mismatch relative to the requested adaptations.

## Primary interactions and console

- Opened the comparison gallery and confirmed seven complete study links.
- Navigated gallery → Chorus → all studies using visible semantic links.
- Confirmed one active `aria-current` study and no body images.
- Checked the fresh browser console after the fixes: no errors or warnings.

## Implementation checklist

- [x] Seven distinct responsive reader studies
- [x] Shared comparison content and functioning study switcher
- [x] No inline article imagery
- [x] 4:3 desktop / 16:9 mobile lead treatment
- [x] Real gallery previews and authored lead alt text
- [x] Desktop and mobile browser evidence with no overflow
- [x] TypeScript and production build pass

final result: passed
