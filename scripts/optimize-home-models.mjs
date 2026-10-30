import { mkdir, readFile, writeFile } from "node:fs/promises";
import { dirname, resolve } from "node:path";
import { NodeIO, TextureInfo } from "@gltf-transform/core";
import { ALL_EXTENSIONS } from "@gltf-transform/extensions";
import { meshopt, textureCompress } from "@gltf-transform/functions";
import { MeshoptDecoder, MeshoptEncoder } from "meshoptimizer";
import sharp from "sharp";

// Always export from a separate source archive, never from a previous export.
const [inputDirectory, outputDirectory] = process.argv.slice(2);
if (!inputDirectory || !outputDirectory) {
  throw new Error(
    "Usage: npm run optimize:home-models -- <source-directory> <output-directory>",
  );
}
if (resolve(inputDirectory) === resolve(outputDirectory)) {
  throw new Error("Source and output directories must be different.");
}

await Promise.all([MeshoptDecoder.ready, MeshoptEncoder.ready]);
const io = new NodeIO().registerExtensions(ALL_EXTENSIONS).registerDependencies({
  "meshopt.decoder": MeshoptDecoder,
  "meshopt.encoder": MeshoptEncoder,
});

for (const filename of [
  "vcr-hanseatic-vcr-200.glb",
  "camellia-sasanqua-shishigashira.glb",
  "cigarette-box.glb",
]) {
  const input = await readFile(resolve(inputDirectory, filename));
  const document = await io.readBinary(input);
  if (filename === "camellia-sasanqua-shishigashira.glb") {
    // The scan uses separate repeating textures in UV tiles 0–3. Translate
    // whole tiles into [0, 1] so Meshopt can quantize UVs without changing
    // their appearance, removing triangles, or moving any vertices.
    for (const mesh of document.getRoot().listMeshes()) {
      for (const primitive of mesh.listPrimitives()) {
        const uv = primitive.getAttribute("TEXCOORD_0");
        const info = primitive.getMaterial()?.getBaseColorTextureInfo();
        if (
          !uv ||
          uv.getNormalized() ||
          info?.getWrapS() !== TextureInfo.WrapMode.REPEAT
        ) continue;
        const [minU, minV] = uv.getMin([]);
        const [maxU, maxV] = uv.getMax([]);
        const tile = Math.floor(minU);
        if (!tile || maxU > tile + 1 || minV < 0 || maxV > 1) continue;
        const array = uv.getArray().slice();
        for (let index = 0; index < array.length; index += 2) {
          array[index] -= tile;
        }
        uv.setArray(array);
      }
    }
  }
  await document.transform(
    textureCompress({
      encoder: sharp,
      targetFormat: "webp",
      slots: /^(baseColorTexture|emissiveTexture)$/,
      resize: [1024, 1024],
      quality: 88,
      effort: 100,
    }),
    // Normal and material maps carry data: avoid lossy color compression.
    textureCompress({
      encoder: sharp,
      targetFormat: "webp",
      slots: /^(?!baseColorTexture$|emissiveTexture$).*$/,
      resize: [512, 512],
      lossless: true,
      effort: 100,
    }),
    meshopt({ encoder: MeshoptEncoder, level: "high" }),
  );
  const output = await io.writeBinary(document);
  // Check that the exported file can be decoded before replacing the runtime asset.
  await io.readBinary(output);
  if (output.byteLength >= input.byteLength) {
    throw new Error(`${filename}: export did not reduce the file size.`);
  }
  const outputPath = resolve(outputDirectory, filename);
  await mkdir(dirname(outputPath), { recursive: true });
  await writeFile(outputPath, output);
  console.log(
    `${filename}: ${input.byteLength} → ${output.byteLength} bytes ` +
      `(${(100 * (1 - output.byteLength / input.byteLength)).toFixed(1)}% smaller)`,
  );
}
