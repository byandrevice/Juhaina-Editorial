# Homepage 3D loading optimization — October 30, 2026

## Outcome

The homepage's GLB download budget falls from 26,496,788 bytes across eight
preloads to 6,567,936 bytes across the four published models (75.2% less).
The displayed models alone previously totaled 18,597,168 bytes, so compression
reduces their file sizes by 64.7%; removing unused preloads avoids another
7,899,620 bytes. No loading screen was added.

| Published model | Before (bytes) | After (bytes) | Reduction |
| --- | ---: | ---: | ---: |
| VCR | 9,415,176 | 1,995,752 | 78.8% |
| Camellia | 7,730,080 | 4,382,372 | 43.3% |
| Cigarette box | 1,379,116 | 117,016 | 91.5% |
| PSX Nokia | 72,796 | 72,796 | Unchanged |

These are binary file sizes, not browser timing measurements. No fixed
number of seconds saved is claimed; real loading time depends on the
connection, device, JavaScript startup, and hosting/cache behavior.

## Export and runtime checks

- The exported files round-trip through glTF Transform's NodeIO successfully.
- Every compressed buffer decodes with the actual `three-stdlib` Meshopt
  decoder used by the installed `useGLTF`: 90 VCR, 14 flower, and 5 box streams.
- Vertex, triangle, and material counts match the original runtime files:
  VCR 38,925 / 40,634 / 5; flower 316,825 / 228,485 / 4;
  box 1,117 / 1,696 / 1. No additional geometry simplification was applied.
- The flower's three out-of-range UV tiles use repeat wrapping; translating
  their U coordinates by whole tile offsets enables quantization without
  changing the repeating texture placement.
- Color textures use quality-88 WebP at up to 1024 px. Normal/material maps
  use lossless WebP after resizing to at most 512 px. Source archives remain
  separate from the public exports.
- Homepage code now contains only the four published-model preloads.
  Unselected study alternatives retain their original files and remain
  available to `useGLTF` when selected.
- `npm run typecheck` passed.
- `npm run build` passed, including all 35 generated pages.

## Browser check

The original and optimized homepage were inspected at 1280 × 720 in the
in-app browser. All four optimized models render with the existing layout,
lighting, rotation, and labels. No model loading or decoding errors occurred.
The production build was also opened locally for verification.

Screenshots show different rotation angles because the objects continuously
rotate; they are visual evidence rather than a pixel-difference test.

- [Original appearance](before.png)
- [Optimized production appearance](after.png)

Changes are local; this work does not deploy the site.
