# Homepage first appearance — October 30, 2026

The previous compression release reduced the model downloads by 75.2%, but
Juhaina still perceived a delay. This follow-up removes model loading from
the first appearance of the objects.

## First-paint delivery

- Four transparent WebP renders are embedded in the static homepage HTML:
  VCR 3,766 bytes; flower 6,452; cigarette box 4,000; Nokia 4,242.
- Combined preview image bytes: 18,460. No separate preview HTTP requests.
- The generated homepage HTML is 34,056 bytes, or 21,112 with gzip.
- Background PNG: 1,193,227 bytes; WebP replacement: 46,256 bytes. The image
  is preloaded in the HTML at high priority.
- The production build marks `/` static. Review query options still apply
  after hydration without making every homepage request dynamic.
- Public requests skip session refresh. Existing admin/auth routes still
  refresh sessions, and the admin-only gate runs before this public shortcut.

## Runtime behavior

The preview uses the actual model, initial rotation, camera, scale,
normalization, and lighting. Its height follows the existing model container,
so it tracks the same perspective projection across responsive sizes.
JavaScript enhancement waits until the previews can paint. A preview is
hidden only after the loaded model has rendered a frame, rather than when
the download or React component mount alone finishes. The original rotation,
hover scale, navigation, and reduced-motion handling remain available.

## Verification

1. `npm run typecheck` and `npm run build` passed; all 35 generated pages built.
2. Opened the production output through `scripts/check-home-first-paint.mjs`
   with `script-src 'none'`: four decoded, visible inline previews; four
   navigation links; zero canvases. [Screenshot](no-javascript.png).
3. Opened `/?qa=model-failure` through the same QA server: all four GLB
   requests deliberately return 503. The error boundaries preserve all four
   previews and links. [Screenshot](model-failure.png).
4. Normal production rendering: all four containers reach `data-ready=true`,
   the live canvases show, and there are no model/JavaScript errors.
5. Public homepage/background return 200; unauthenticated `/admin` redirects
   to sign-in with 307; `/api/admin/films` returns 401.
6. Ran the production server with `SITE_ACCESS_MODE=admin-only`: `/`, the
   background, and a model request all return 404, preserving the access gate.

No claim of zero network latency or instantly interactive WebGL is made.
The improvement is that visible objects no longer depend on the 3D startup
path; live animation follows in the background.

## Reproduce

```sh
npm run build
npm run start -- --port 3003
# In another terminal:
node scripts/check-home-first-paint.mjs 3003
```

Open `http://localhost:3011` for the JavaScript-disabled case, or
`http://localhost:3011/?qa=model-failure` for unavailable models. The QA
server and preview exporter bind only to the local machine and are not
part of the public website.
