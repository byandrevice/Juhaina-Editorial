# Homepage design QA

## Comparison target

- Source visual truth: `docs/audits/homepage-implementation-2026-08-07/homepage-source-reference.png`, the user recording represented by `docs/audits/homepage-implementation-2026-08-07-iteration2/recording-reference-phases.png`, and the August 7 follow-up briefs: enlarge model viewports, lower Films, add scale studies, reduce AC/cigarette dominance, then add 75/65/60/55/50 label states and assess replacing the unstable AC asset.
- Browser-rendered implementation: `docs/audits/homepage-implementation-2026-08-07-iteration4/label-100-cig-smaller.png`.
- Label-scale comparison evidence: `docs/audits/homepage-implementation-2026-08-07-iteration4/label-100-vs-50.png`.
- Combined earlier motion comparison evidence: `docs/audits/homepage-implementation-2026-08-07-iteration2/recording-vs-revised-phases.png`.
- Focused current motion evidence: `docs/audits/homepage-implementation-2026-08-07-iteration3/rotation-phases.png`.
- Responsive evidence: `docs/audits/homepage-implementation-2026-08-07-iteration3/mobile.png`.

## Normalization

- Desktop CSS viewport: 1440 × 1024 at browser device pixel ratio 2.
- Static source pixels: 744 × 528. It is a presentation-size capture of the same 1440 × 1024 composition. Recording-reference frames are normalized to 640 × 360 for phase comparison.
- Implementation pixels: 1440 × 1024. The browser capture backend clips DPR-2 output at CSS dimensions, so the QA route applies a 0.5 visual transform to normalize the complete 2880 × 2048 render surface into a 1440 × 1024 evidence image. Layout values still resolve against the 1440 × 1024 CSS viewport.
- Mobile CSS viewport and evidence pixels: 390 × 844, normalized with the same capture transform.
- State: Syne Mono. The multi-phase comparison uses Fast (10 seconds per revolution) in both the supplied recording and the revised implementation; mobile uses the default Slow preset.

## Full-view comparison evidence

- The combined recording/revision comparison confirms the background crop, free-form four-object composition, off-white labels, and model-label relationships remain faithful through multiple rotation phases.
- Films remains in the upper-left light field but now sits lower than before and slightly above Mood Board's vertical center, as requested. Mood Board, Lists, and Projections retain their approved anchors.
- The reduced label scale gives the GLBs first visual priority without losing legibility. The labels remain subordinate on both desktop and mobile.
- The enlarged WebGL viewports keep the VCR and cigarette pack safely inside their canvas boundaries. The AC continues to read as clipped or misassembled in live review even though its renderer boundary is larger.
- The AC's embedded fan clip is intentionally disabled and no extra X/Z tilt is applied. Its remaining instability comes from the source GLB's independently transformed body and cylinder/fan meshes, so a source-asset replacement is now the appropriate fix.
- The motion strip was required as focused evidence because a single frame cannot establish clipping safety or assembly continuity across a 360-degree turn. The review-control screenshot establishes the new label and 3D-icon scale studies.

## Required fidelity surfaces

- Fonts and typography: passed. Syne Mono and Syne Tactile retain the specified family, synthesized 900 weight, lowercase transform, hard shadow, tracking, and line height. The review panel now exposes the 100% baseline plus the requested 75%, 65%, 60%, 55%, and 50% label-scale states. NCL remains disabled because only a non-commercial demo font is available.
- Spacing and layout rhythm: passed. The approved free-form spacing is preserved, Films is lower without aligning flush to Mood Board, labels remain centered beneath their objects, and the 390 × 844 state has no overlap or page overflow.
- Colors and visual tokens: passed. The background asset is unchanged; label foreground is `#f7f5ef` and hard shadow is `#0a0a0c`.
- Image quality and asset fidelity: blocked for the AC only. The production PNG and four production GLBs are used directly. Cigarette Box optical scale is now `0.50`, removing its hierarchy dominance. The available AC GLB still contains a separately transformed cylinder/fan mesh and continues to produce an unreliable assembled silhouette during rotation despite disabled animation, increased viewport clearance, zero added tilt, and scale reduction. No alternate AC GLB is currently present in Downloads or `public/models`.
- Copy and content: passed. Visible labels remain `films`, `mood board`, `lists`, and `projections`. The review-only panel accurately describes rotation period, label size, and 3D icon size.

## Interaction and runtime checks

- All four models make continuous 360-degree Y-axis turns. Reduced-motion users receive static models.
- Review controls were exercised for Slow (28 seconds/revolution), Medium (18 seconds/revolution), and Fast (10 seconds/revolution); `aria-pressed` updates correctly.
- Label-size controls were exercised at 100%, 75%, 65%, 60%, 55%, and 50%; 3D-icon controls were exercised at 85%, 100%, and 115%. The computed independent CSS scale values and `aria-pressed` states update correctly.
- The AC model's embedded `Cylinder.001|Cylinder.001Action` clip is not played. All of its child meshes remain rigid during the single parent rotation, preventing the fan/housing relationship from appearing unstable.
- Portal links remain native links to `/films`, `/moodboards`, `/lists`, and `/projections`, with accessible names and focus-visible styling.
- Desktop has four WebGL canvases and four portal links. Mobile reports 390 px scroll width against a 390 px client width and 844 px scroll height against an 844 px client height.
- Browser console: no errors. The current React Three Fiber/Three.js pairing emits the same four upstream `THREE.Clock` deprecation warnings noted previously; they do not affect rendering or interaction.
- `npm run typecheck`, `npm run build`, and `git diff --check` pass.

## Comparison history

### Pass 4 — blocked

- P1: The prior oscillation did not complete a 360-degree rotation, so flat-looking source angles could persist.
- P2: Films and Lists occupied the wrong tonal fields for the dark VCR.
- P2: AC, Cigarette Box, and Flower used over-tight optical scales that caused flat or clipped silhouettes.
- P2: Labels competed with the objects for hierarchy.
- Fixes: changed motion to full-turn angular velocity, added three rotation-period presets, swapped the Films/Lists anchors, expanded the three problem canvases, reduced their internal optical scales, and reduced the four label sizes.

### Pass 5 — blocked

- P2: A first capture caught the AC and cigarette pack near edge-on angles, weakening their initial three-dimensional read even though the full rotation worked.
- Fixes: added a slight X/Z tilt and staggered the opening Y angles so the first several seconds favor clear three-quarter views while still completing the full turn.

### Pass 6 — passed

- Post-fix desktop and mobile evidence show all models fully visible, dimensional, and balanced over quieter labels. Motion presets work, navigation remains intact, and there is no responsive overflow.

### Pass 7 — blocked

- P1: The supplied recording showed the VCR, AC, and cigarette pack touching or crossing their WebGL crop at different phases even though their CSS portal containers remained in bounds.
- P2: Films was too high relative to Mood Board.
- P2: The AC's internal fan animation was not being played, and the added housing tilt exaggerated the separation between its fan/coil surfaces and outer case.
- P2: The review panel could not independently compare label and 3D-icon sizes.
- Fixes: expanded only the affected WebGL viewports, inversely compensated optical model scale to preserve visible size, lowered Films, restored the GLB's embedded fan animation, removed the AC's extra housing tilt, and added independent scale studies.

### Pass 8 — passed

- Three revised Fast-preset phases show the affected models fully contained at front, side, and rear angles. The AC housing remains rigid while its intended fan animation plays. The compact layout has no collision or overflow, and all four review groups are functional.

### Pass 9 — blocked

- P1: Follow-up live review showed the AC's embedded fan animation made its independently transformed cylinder read as unstable against the housing during the complete parent turn.
- P2: AC and Cigarette Box remained too visually dominant relative to the VCR and flower.
- P2: AC still approached its viewport crop at unfavorable angles.
- Fixes: removed AC animation playback so every AC mesh remains rigid, reduced AC optical scale from `0.87` to `0.68`, and reduced Cigarette Box optical scale from `0.83` to `0.66`. Their already enlarged viewports remain unchanged.

### Pass 10 — passed

- Four Fast-preset phases show the smaller AC and cigarette pack fully contained at front, rear, and edge-on angles. The AC rotates as one stable assembly. The 390 × 844 compact state remains balanced with no collision or overflow.

### Pass 11 — blocked

- P1: Follow-up visual review confirms the AC asset still clips or assembles unreliably during rotation; layout, viewport, scale, tilt, and animation fixes have been exhausted.
- P2: Cigarette Box remained too dominant.
- P2: The label study did not include the requested sub-75% sizes.
- Fixes completed: reduced Cigarette Box optical scale from `0.66` to `0.50`; replaced the label study with 100%, 75%, 65%, 60%, 55%, and 50% states and verified their computed values.
- Remaining blocker: replace `air-conditioner.glb` with a cleaner single-assembly GLB. No alternate candidate is currently available in the inspected asset locations.

## Follow-up polish

- P3: Select the preferred rotation period after reviewing the three live presets.
- P3: Select the preferred label and 3D-icon scale after using the new independent studies.
- P3: Supply a commercially licensed NCL webfont if it remains a finalist.
- P1: Supply the alternate Lists model for replacement and re-run the full-turn visual check.

final result: blocked
