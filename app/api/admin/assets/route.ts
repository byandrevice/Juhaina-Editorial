import { nanoid } from "nanoid";
import { NextResponse } from "next/server";
import sharp from "sharp";
import { getAdminIdentity } from "@/lib/admin/auth";
import { createClient } from "@/lib/supabase/server";

const allowed = new Set(["image/jpeg", "image/png", "image/webp", "image/avif", "image/gif"]);
const moodboardMimeTypes = new Set([
  "image/jpeg", "image/png", "image/apng", "image/webp", "image/avif",
  "image/heic", "image/heif", "image/tiff", "image/bmp", "image/x-ms-bmp",
]);
const moodboardExtensions = new Set(["jpg", "jpeg", "png", "apng", "webp", "avif", "heic", "heif", "tif", "tiff", "bmp"]);

export async function POST(request: Request) {
  const identity = await getAdminIdentity();
  if (!identity || identity.demo) return NextResponse.json({ error: "Not authorized." }, { status: 401 });
  const formData = await request.formData();
  const file = formData.get("file");
  if (!(file instanceof File)) return NextResponse.json({ error: "Choose an image to upload." }, { status: 400 });
  const scope = new URL(request.url).searchParams.get("scope");
  const isMoodboard = scope === "moodboard" || scope === "moodboard-output";
  const sourceExtension = file.name.split(".").pop()?.toLowerCase().replace(/[^a-z0-9]/g, "") || "";
  if (isMoodboard && (file.type === "image/gif" || sourceExtension === "gif")) {
    return NextResponse.json({ error: "Animated GIF files are not accepted. Use a static image instead." }, { status: 415 });
  }
  if (isMoodboard ? (!moodboardMimeTypes.has(file.type) && !moodboardExtensions.has(sourceExtension)) : !allowed.has(file.type)) {
    return NextResponse.json({ error: isMoodboard ? "Use JPG, PNG, APNG, WebP, AVIF, HEIC, HEIF, TIFF, or BMP." : "Use a JPG, PNG, WebP, AVIF, or GIF image." }, { status: 415 });
  }
  const maximumSize = isMoodboard ? 25 * 1024 * 1024 : 6 * 1024 * 1024;
  if (file.size > maximumSize) return NextResponse.json({ error: `Images must be ${isMoodboard ? 25 : 6} MB or smaller.` }, { status: 413 });

  let uploadBody: File | Buffer = file;
  let uploadMime = file.type;
  let uploadExtension = sourceExtension || "image";
  if (isMoodboard) {
    try {
      const source = Buffer.from(await file.arrayBuffer());
      uploadBody = await sharp(source, { animated: false, limitInputPixels: 80_000_000 })
        .rotate()
        .webp({ quality: scope === "moodboard-output" ? 90 : 92, alphaQuality: 100 })
        .toBuffer();
      uploadMime = "image/webp";
      uploadExtension = "webp";
    } catch {
      return NextResponse.json({ error: "This image could not be prepared. Try exporting it as PNG or WebP." }, { status: 422 });
    }
  }

  const storagePath = `${identity.id}/${new Date().getFullYear()}/${nanoid(18)}.${uploadExtension}`;
  const supabase = await createClient();
  const { error: uploadError } = await supabase.storage.from("editorial-images").upload(storagePath, uploadBody, { contentType: uploadMime, upsert: false });
  if (uploadError) return NextResponse.json({ error: uploadError.message }, { status: 500 });
  const { data: asset, error: assetError } = await supabase.from("assets").insert({
    owner_id: identity.id, storage_path: storagePath, original_filename: file.name,
    mime_type: uploadMime, byte_size: uploadBody instanceof File ? uploadBody.size : uploadBody.byteLength,
  }).select("id, storage_path, original_filename").single();
  if (assetError || !asset) return NextResponse.json({ error: assetError?.message ?? "Could not record the uploaded image." }, { status: 500 });
  const { data: signed } = await supabase.storage.from("editorial-images").createSignedUrl(storagePath, 3600);
  return NextResponse.json({ asset: { ...asset, url: signed?.signedUrl ?? "" } }, { status: 201 });
}
