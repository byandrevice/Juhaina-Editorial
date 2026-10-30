// Open http://localhost:3010 to render transparent previews from the real GLBs.
// The browser exports the same camera, normalization, lighting, and first pose
// used by PortalScene. This local tool is never part of the deployed website.
import { createServer } from "node:http";
import { readFile, writeFile } from "node:fs/promises";
import { resolve } from "node:path";

const root = resolve(import.meta.dirname, "..");
const models = [
  { id: "vcr", file: "vcr-hanseatic-vcr-200.glb", rotation: [-0.04, -0.2, 0], scale: 1.2, camera: 7.2 },
  { id: "camellia", file: "camellia-sasanqua-shishigashira.glb", rotation: [-0.2, -0.35, -0.04], scale: 0.82, camera: 5.6 },
  { id: "cigarette-box", file: "cigarette-box.glb", rotation: [0.12, -0.35, 0.04], scale: 0.5, camera: 5.6 },
  { id: "nokia", file: "candidates/psx-nokia.glb", rotation: [-0.08, -0.3, 0.03], scale: 0.68, camera: 5.6 },
];
const files = new Map([
  ["/three.module.js", "node_modules/three/build/three.module.js"],
  ["/three.core.js", "node_modules/three/build/three.core.js"],
  ["/loaders/GLTFLoader.js", "node_modules/three/examples/jsm/loaders/GLTFLoader.js"],
  ["/utils/BufferGeometryUtils.js", "node_modules/three/examples/jsm/utils/BufferGeometryUtils.js"],
  ["/utils/SkeletonUtils.js", "node_modules/three/examples/jsm/utils/SkeletonUtils.js"],
  ["/meshopt_decoder.mjs", "node_modules/meshoptimizer/meshopt_decoder.mjs"],
  ...models.map(({ file }) => [`/models/${file}`, `public/models/home/${file}`]),
]);
const html = `<!doctype html><html><head><meta charset="utf-8"><title>Homepage preview exporter</title>
<script type="importmap">{"imports":{"three":"/three.module.js"}}</script></head>
<body><h1>Homepage preview exporter</h1><p id="status">Rendering…</p><div id="previews"></div>
<pre data-testid="posters-output" aria-hidden="true"></pre><script type="module">
import * as THREE from 'three';
import { GLTFLoader } from '/loaders/GLTFLoader.js';
import { MeshoptDecoder } from '/meshopt_decoder.mjs';
const loader = new GLTFLoader().setMeshoptDecoder(MeshoptDecoder);
const output = {};
for (const model of ${JSON.stringify(models)}) {
  const { scene: object } = await loader.loadAsync('/models/' + model.file);
  object.updateMatrixWorld(true);
  const bounds = new THREE.Box3().setFromObject(object);
  const center = bounds.getCenter(new THREE.Vector3());
  const size = bounds.getSize(new THREE.Vector3());
  const centered = new THREE.Group();
  centered.position.copy(center).negate();
  centered.add(object);
  const normalized = new THREE.Group();
  normalized.scale.setScalar(3.35 / Math.max(size.x, size.y, size.z));
  normalized.add(centered);
  const shell = new THREE.Group();
  shell.scale.setScalar(model.scale);
  shell.add(normalized);
  const spin = new THREE.Group();
  spin.rotation.set(...model.rotation);
  spin.add(shell);
  const scene = new THREE.Scene();
  scene.add(spin, new THREE.AmbientLight(0xffffff, 3.2), new THREE.HemisphereLight(0xffffff, 0x252822, 2.1));
  for (const [position, intensity] of [[[4, 5, 6], 4.4], [[-4, 1, 3], 1.5]]) {
    const light = new THREE.DirectionalLight(0xffffff, intensity);
    light.position.set(...position);
    scene.add(light);
  }
  const camera = new THREE.PerspectiveCamera(31, 2, 0.01, 100);
  camera.position.set(0, 0, model.camera);
  const renderer = new THREE.WebGLRenderer({ alpha: true, antialias: true });
  renderer.setSize(512, 256);
  renderer.setClearColor(0x000000, 0);
  renderer.toneMapping = THREE.ACESFilmicToneMapping;
  renderer.outputColorSpace = THREE.SRGBColorSpace;
  renderer.render(scene, camera);
  const data = renderer.domElement.toDataURL('image/webp', 0.85);
  output[model.id] = data;
  const image = new Image();
  image.src = data;
  image.alt = model.id;
  image.width = 512;
  document.querySelector('#previews').append(image);
  renderer.dispose();
}
document.querySelector('[data-testid="posters-output"]').textContent = JSON.stringify(output);
const saved = await fetch('/export', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(output) });
document.querySelector('#status').textContent = saved.ok ? 'Four previews saved to lib/home-model-posters.ts' : 'Export failed';
</script></body></html>`;

createServer(async (request, response) => {
  try {
    const pathname = new URL(request.url, "http://localhost:3010").pathname;
    if (pathname === "/export" && request.method === "POST") {
      let body = "";
      for await (const chunk of request) {
        body += chunk;
        if (body.length > 1_000_000) throw new Error("Export is unexpectedly large.");
      }
      const output = JSON.parse(body);
      if (Object.keys(output).length !== models.length || models.some(({ id }) => !output[id]?.startsWith("data:image/webp;base64,"))) {
        throw new Error("Expected four WebP previews.");
      }
      await writeFile(resolve(root, "lib/home-model-posters.ts"),
        "// Generated from the real homepage GLBs, cameras, and lighting.\n" +
        "// Inline previews render in the initial HTML, before JavaScript or model requests.\n" +
        "// Regenerate with scripts/render-home-posters.mjs.\n" +
        "export const homeModelPosters = " + JSON.stringify(output, null, 2) + " as const;\n");
      response.end("Saved four previews.");
      return;
    }
    if (pathname === "/") {
      response.setHeader("Content-Type", "text/html");
      response.end(html);
      return;
    }
    const file = files.get(pathname);
    if (!file) { response.writeHead(404).end(); return; }
    response.setHeader("Content-Type", file.endsWith(".glb") ? "model/gltf-binary" : "text/javascript");
    response.end(await readFile(resolve(root, file)));
  } catch (error) {
    response.writeHead(500).end(String(error));
  }
}).listen(3010, "127.0.0.1", () => console.log("Preview exporter: http://localhost:3010"));
