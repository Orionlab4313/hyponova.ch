import { NextRequest, NextResponse } from "next/server";
import { randomBytes } from "crypto";
import { createServiceClient } from "@/lib/supabase";
import { requireAdmin } from "@/lib/admin-guard";

const MAX_FILE_SIZE = 10 * 1024 * 1024; // 10 MB

// Nur PDFs, Vollmacht/Mandatsvereinbarung/etc. sind immer PDF.
const ALLOWED_TYPES = ["application/pdf"];

function safeOriginalName(name: string): string {
  // Original-Name fuers Download-Attribut speichern, aber Storage-Path
  // bekommt einen sauberen Slug (kein User-Input direkt im Bucket).
  return name
    .replace(/\s+/g, "_")
    .replace(/[^a-zA-Z0-9._-]/g, "")
    .slice(0, 120) || "datei.pdf";
}

export async function POST(request: NextRequest) {
  const guard = requireAdmin(request);
  if (guard) return guard;

  try {
    const supabase = createServiceClient();
    const formData = await request.formData();
    const file = formData.get("file") as File;

    if (!file) {
      return NextResponse.json({ error: "Keine Datei ausgewählt" }, { status: 400 });
    }

    if (file.size > MAX_FILE_SIZE) {
      return NextResponse.json(
        { error: "Datei zu gross. Maximum 10 MB." },
        { status: 400 },
      );
    }

    if (!ALLOWED_TYPES.includes(file.type)) {
      return NextResponse.json(
        { error: "Ungültiger Dateityp. Erlaubt: PDF." },
        { status: 400 },
      );
    }

    const random = randomBytes(8).toString("hex");
    const originalName = safeOriginalName(file.name || "datei.pdf");
    const storagePath = `${Date.now()}-${random}.pdf`;

    const buffer = Buffer.from(await file.arrayBuffer());

    const { data, error } = await supabase.storage
      .from("dokument-vorlagen")
      .upload(storagePath, buffer, {
        contentType: "application/pdf",
        upsert: false,
      });

    if (error) {
      console.error("Vorlagen-Upload error:", error);
      return NextResponse.json({ error: "Upload fehlgeschlagen" }, { status: 500 });
    }

    const {
      data: { publicUrl },
    } = supabase.storage.from("dokument-vorlagen").getPublicUrl(data.path);

    return NextResponse.json({
      url: publicUrl,
      file_name: originalName,
      file_size: file.size,
    });
  } catch (err) {
    console.error("Vorlagen-Upload exception:", err);
    return NextResponse.json({ error: "Upload fehlgeschlagen" }, { status: 500 });
  }
}
