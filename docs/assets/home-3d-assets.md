# Homepage 3D Assets

Status: production candidates prepared on 2026-08-06. Homepage portal mapping
was confirmed on 2026-08-06.

## Confirmed portal mapping

- Films: VCR (Hanseatic VCR 200)
- Moodboards: Camellia sasanqua 'Shishigashira'
- Projections: Cigarette Box
- Lists: Air Conditioner

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
- Portal assignment: Lists

### Camellia sasanqua 'Shishigashira'

- Public path: `/models/home/camellia-sasanqua-shishigashira.glb`
- Size: 7.37 MiB
- Geometry: 316,825 vertices; 228,485 triangles
- Creator: ffish.asia / floraZia.com
- License: CC0 1.0
- Source: https://sketchfab.com/3d-models/cc0-camellia-sasanqua-shishigashira-96bd7ce1b90e49f7bce0ae78a0fbdaba
- Processing: removed the separate `Cube_2` calibration object, consolidated
  compatible scan chunks, welded compatible vertices, simplified geometry, and
  compressed the final mesh with Meshopt
- Original geometry: 1,702,525 vertices; 1,841,160 triangles; 76.97 MiB
- Visual QA: the selected balanced variant was compared locally against the
  cube-free full-resolution model at the intended small homepage display size;
  no meaningful visual advantage was found in the heavier high-quality variant
- Runtime requirement: the loader must support `EXT_meshopt_compression`
- SHA-256: `07ad22bb3ecc7c38911622e40402c6b575cb4db3472a8067c117071a32ad0c5a`
- Portal assignment: Moodboards

### Cigarette Box

- Public path: `/models/home/cigarette-box.glb`
- Size: 1.32 MiB
- Geometry: 1,117 vertices; 1,696 triangles
- Creator: RomarovArt
- License: CC BY 4.0
- Source: https://sketchfab.com/3d-models/cigarette-box-475b510e7876457aa30f3fae7c21cd17
- Processing: removed only the detached cigarette floating in front of the box;
  preserved the cigarettes protruding from the open pack, box shell, material,
  and textures
- SHA-256: `15f9dff2f4b47c1c4ad31f172e707bcf5d6f68bd1641168b9e927ccd7b02ff79`
- Portal assignment: Projections

### VCR (Hanseatic VCR 200)

- Public path: `/models/home/vcr-hanseatic-vcr-200.glb`
- Size: 8.98 MiB
- Geometry: 38,925 vertices; 40,634 triangles
- Creator: AleixoAlonso
- License: CC BY 4.0
- Source: https://sketchfab.com/3d-models/vcr-hanseatic-vcr-200-5b9c01beba1a41728872c2429edbda9d
- Processing: none; downloaded GLB retained as the runtime asset
- SHA-256: `9a31256376ae83162a150e351ae1ab664470b379032b175369e5313a22d70126`
- Portal assignment: Films

## Attribution requirement

The Air Conditioner, Cigarette Box, and VCR use CC BY 4.0 assets. The shipped
site must include creator, source, and license attribution in an accessible
credits location. The Camellia is CC0 and does not require attribution, but its
source should remain in project records.

## Remaining implementation work

- Create a static fallback image for each asset.
- Add the route, visual scale, rotation speed, and initial orientation to the
  homepage portal configuration.
- Ensure the Three.js loader registers a Meshopt decoder before loading the
  Camellia asset.
- Keep labels and navigation usable before WebGL assets finish loading.
- Provide a reduced-motion presentation and a failure fallback.
