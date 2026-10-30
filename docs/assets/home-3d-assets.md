# Homepage 3D Assets

Status: runtime exports optimized on 2026-10-30. Current homepage pairings
match `components/home-portal.tsx` and the project context handoff.

## Immediate first appearance — 2026-10-30 follow-up

Compression alone still left the objects waiting for JavaScript, WebGL, and
model decoding. The homepage now embeds four transparent WebP renders of the
actual models directly in its generated HTML. Their combined binary size is
18,460 bytes. The first appearance has no dependency on a model request,
JavaScript execution, or WebGL support. The existing 3D animation starts in
the background after the previews have had a chance to paint, and replaces
each preview only after a real model frame has rendered. Failed model loads
leave the preview and navigation intact.

The background is now a preloaded 46,256-byte WebP export instead of the
1,193,227-byte PNG. The homepage is statically generated; review-only font,
capture, and study query parameters are applied in the browser. Public routes
skip session refresh, while admin/auth routes and admin-only site access
retain their existing checks.

Regenerate previews with `node scripts/render-home-posters.mjs`, then open
`http://localhost:3010`. The local tool writes `lib/home-model-posters.ts`
using the same GLBs, lighting, camera, normalization, initial rotation, and
scale as the homepage. Stop the tool when done. See
[first-paint validation](../audits/homepage-first-paint-2026-10-30/validation.md).

## Confirmed portal mapping

- Films: VCR (Hanseatic VCR 200)
- Moodboards: Camellia sasanqua 'Shishigashira'
- Projections: Cigarette Box
- Lists: PSX Nokia (the Air Conditioner remains a study alternative)

## Loading optimization — 2026-10-30

The homepage previously preloaded all eight study models: 26,496,788 bytes.
It now preloads only the four published pairings: 6,567,936 bytes, a 75.2%
reduction in GLB downloads. These are file sizes, not measured load times.
Unselected study alternatives still load on demand in the review controls.

The VCR, flower, and cigarette box use WebP textures plus Meshopt geometry
compression. Color textures are capped at 1024 px with quality 88; normal and
material maps are capped at 512 px and encoded losslessly after resizing.
All vertex, triangle, and material counts are unchanged. The flower's separate
repeating UV tiles are translated into [0, 1] before quantization; its shape
and texture wrapping remain intact. The already-small Nokia is unchanged
(72,796 bytes).

Exports can be reproduced with:

```sh
npm run optimize:home-models -- /path/to/original-runtime-models public/models/home
```

The input directory must contain the original runtime exports named
`vcr-hanseatic-vcr-200.glb`, `camellia-sasanqua-shishigashira.glb`, and
`cigarette-box.glb`. Use the preserved selected exports from the private source
archive or Git history, not a previously optimized output. Keep that archive
outside the public repository. The script rejects identical input/output
directories and verifies each export can decode before writing it.

The installed `useGLTF` loader supports Meshopt and WebP without additional
decoder downloads. See [validation evidence](../audits/homepage-loading-2026-10-30/validation.md).

## Runtime assets

All public paths are relative to the Next.js `public` directory.

### Air Conditioner

- Public path: `/models/home/air-conditioner.glb`
- Size: 2.48 MiB
- Geometry: 1,418 vertices; 757 triangles
- Creator: Rusty-exe
- License: CC BY 4.0
- Source: https://sketchfab.com/3d-models/air-conditioner-16e2f31ca42844c793f64a3ed61e8e60
- Processing: repacked without geometric reduction to correct an invalid
  animation buffer layout in the downloaded GLB
- SHA-256: `c01b8bdb17f5b11515390785fdf9f11953c5c117a8a84205d98a28e052c04ada`
- Portal assignment: study alternative

### Camellia sasanqua 'Shishigashira'

- Public path: `/models/home/camellia-sasanqua-shishigashira.glb`
- Size: 4.18 MiB (4,382,372 bytes; previously 7,730,080 bytes)
- Geometry: 316,825 vertices; 228,485 triangles
- Creator: ffish.asia / floraZia.com
- License: CC0 1.0
- Source: https://sketchfab.com/3d-models/cc0-camellia-sasanqua-shishigashira-96bd7ce1b90e49f7bce0ae78a0fbdaba
- Processing: removed the separate `Cube_2` calibration object, consolidated
  compatible scan chunks, welded compatible vertices, simplified geometry, and
  compressed the final mesh with Meshopt; the 2026-10-30 export normalizes
  repeating UV tiles and compresses textures to WebP without further simplification
- Original geometry: 1,702,525 vertices; 1,841,160 triangles; 76.97 MiB
- Visual QA: the selected balanced variant was compared locally against the
  cube-free full-resolution model at the intended small homepage display size;
  no meaningful visual advantage was found in the heavier high-quality variant
- Runtime requirement: the loader must support `EXT_meshopt_compression` and `EXT_texture_webp`
- SHA-256: `b3fa353b1a45edf9abfb2405eacbadea6521ac18d63cfa831c3b4cdff6e5ae24`
- Portal assignment: Moodboards

### Cigarette Box

- Public path: `/models/home/cigarette-box.glb`
- Size: 0.11 MiB (117,016 bytes; previously 1,379,116 bytes)
- Geometry: 1,117 vertices; 1,696 triangles
- Creator: RomarovArt
- License: CC BY 4.0
- Source: https://sketchfab.com/3d-models/cigarette-box-475b510e7876457aa30f3fae7c21cd17
- Processing: removed only the detached cigarette floating in front of the box;
  preserved the cigarettes protruding from the open pack, box shell, material,
  and texture content; the 2026-10-30 export resizes and compresses textures
  to WebP and applies Meshopt compression without further geometric reduction
- SHA-256: `6a2e0534c92e043bb4e11b5bb653761201126ef4bef0451558c314982e347f93`
- Portal assignment: Projections

### VCR (Hanseatic VCR 200)

- Public path: `/models/home/vcr-hanseatic-vcr-200.glb`
- Size: 1.90 MiB (1,995,752 bytes; previously 9,415,176 bytes)
- Geometry: 38,925 vertices; 40,634 triangles
- Creator: AleixoAlonso
- License: CC BY 4.0
- Source: https://sketchfab.com/3d-models/vcr-hanseatic-vcr-200-5b9c01beba1a41728872c2429edbda9d
- Processing: WebP texture compression and Meshopt geometry compression;
  normal/material maps resized to 512 px; no triangle reduction
- SHA-256: `e9b6c9fd565ab1088e5c5dc3cbeae3273cae55b4a648ff0dc80f39ca5c7457ec`
- Portal assignment: Films

## Attribution requirement

The Air Conditioner, Cigarette Box, and VCR use CC BY 4.0 assets. The shipped
site must include creator, source, and license attribution in an accessible
credits location. The Camellia is CC0 and does not require attribution, but its
source should remain in project records.

## Remaining implementation work

- Create previews for any study alternatives that become published pairings.

Routing, orientation, scale, rotation, early usable navigation, reduced-motion
handling, Meshopt decoding, and static first-paint/failure previews for the
four published pairings are implemented.
