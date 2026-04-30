import { NextRequest, NextResponse } from "next/server";
import { randomBytes } from "crypto";
import { createServiceClient } from "@/lib/supabase";
import { requireAdmin } from "@/lib/admin-guard";

const MAX_FILE_SIZE = 10 * 1024 * 1024; // 10MB

// SVG bewusst ausgeschlossen — kann inline-Script enthalten und ist als
// Hero-Bild eh unueblich. PNG/JPG/WebP/GIF reichen fuer alle Use-Cases.
const ALLOWED_TYPES = ["image/png", "image/jpeg", "image/webp", "image/gif"];

export async function POST(request: NextRequest) {
  const guard = requireAdmin(request);
  if (guard) return guard;

  try {
    const supabase = createServiceClient();
    const formData = await request.formData();
    const file = formData.get("file") as File;
    const folderRaw = (formData.get("folder") as string) || "general";

    if (!file) {
      return NextResponse.json({ error: "No file provided" }, { status: 400 });
    }

    if (file.size > MAX_FILE_SIZE) {
      return NextResponse.json(
        { error: "Datei zu gross. Maximum 10MB." },
        { status: 400 }
      );
    }

    if (!ALLOWED_TYPES.includes(file.type)) {
      return NextResponse.json(
        { error: "Ungültiger Dateityp. Erlaubt: PNG, JPG, WebP, GIF." },
        { status: 400 }
      );
    }

    // Extension aus MIME-Type ableiten, nicht aus dem User-Filename — der koennte
    // ".jpg.svg" o.ae. heissen.
    const extByMime: Record<string, string> = {
      "image/png": "png",
      "image/jpeg": "jpg",
      "image/webp": "webp",
      "image/gif": "gif",
    };
    const ext = extByMime[file.type] || "bin";

    const safeFolder = folderRaw.replace(/[^a-z0-9-_]/gi, "").slice(0, 32) || "general";
    const random = randomBytes(8).toString("hex");
    const filename = `${safeFolder}/${Date.now()}-${random}.${ext}`;

    const buffer = Buffer.from(await file.arrayBuffer());

    const { data, error } = await supabase.storage
      .from("blog-assets")
      .upload(filename, buffer, {
        contentType: file.type,
        upsert: false,
      });

    if (error) {
      console.error("Blog upload error:", error);
      return NextResponse.json({ error: "Upload fehlgeschlagen" }, { status: 500 });
    }

    const {
      data: { publicUrl },
    } = supabase.storage.from("blog-assets").getPublicUrl(data.path);

    return NextResponse.json({ url: publicUrl });
  } catch (err) {
    console.error("Upload error:", err);
    return NextResponse.json({ error: "Upload failed" }, { status: 500 });
  }
}
