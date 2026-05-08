import { NextRequest, NextResponse } from "next/server";
import { randomBytes } from "crypto";
import { createServiceClient } from "@/lib/supabase";
import { verifyUploadToken } from "@/lib/upload-tokens";
import { checkRateLimit, clientIp } from "@/lib/rate-limit";

const MAX_SIZE = 25 * 1024 * 1024; // 25 MB
const ALLOWED = new Set(["application/pdf", "image/jpeg", "image/png", "image/jpg"]);
const RL_BUCKET = "customer-upload";
const RL_MAX = 50; // pro Stunde, pro IP, generös da Kunde mehrere Files lädt
const RL_WINDOW = 60 * 60;

export async function POST(request: NextRequest, ctx: { params: Promise<{ token: string }> }) {
  const { token } = await ctx.params;
  const tok = await verifyUploadToken(token);
  if (!tok) return NextResponse.json({ error: "Token ungültig oder abgelaufen" }, { status: 401 });

  const ip = clientIp(request.headers);
  const limit = await checkRateLimit({ bucket: RL_BUCKET, key: ip, max: RL_MAX, windowSeconds: RL_WINDOW });
  if (!limit.ok) return NextResponse.json({ error: "Zu viele Uploads in kurzer Zeit." }, { status: 429 });

  let formData: FormData;
  try { formData = await request.formData(); } catch { return NextResponse.json({ error: "Ungültige Anfrage" }, { status: 400 }); }
  const file = formData.get("file") as File | null;
  const category = (formData.get("category") as string | null) || null;
  if (!file) return NextResponse.json({ error: "Keine Datei" }, { status: 400 });
  if (file.size > MAX_SIZE) return NextResponse.json({ error: "Datei zu gross (max. 25 MB)" }, { status: 400 });
  if (!ALLOWED.has(file.type)) return NextResponse.json({ error: "Ungültiger Dateityp" }, { status: 400 });

  const sb = createServiceClient();

  // Filename: original-name (sanitiziert) + random-suffix damit keine Kollisionen
  const safeOriginal = (file.name || "datei")
    .normalize("NFD").replace(/[̀-ͯ]/g, "")
    .replace(/[^a-zA-Z0-9._-]/g, "_")
    .slice(0, 80);
  const random = randomBytes(6).toString("hex");
  const safeCat = category ? category.replace(/[^a-z0-9_-]/gi, "_") : "optional";
  const path = `${tok.lead_id}/${safeCat}/${Date.now()}-${random}-${safeOriginal}`;

  const buf = Buffer.from(await file.arrayBuffer());
  const { error: upErr } = await sb.storage.from("customer-docs").upload(path, buf, {
    contentType: file.type,
    upsert: false,
  });
  if (upErr) {
    console.error("storage upload:", upErr);
    return NextResponse.json({ error: "Upload-Speicher-Fehler" }, { status: 500 });
  }

  const { data: doc, error: insErr } = await sb.from("documents").insert({
    lead_id: tok.lead_id,
    submission_id: tok.submission_id,
    category,
    file_name: file.name?.slice(0, 200) || "datei",
    file_path: path,
    file_size: file.size,
    mime_type: file.type,
    uploaded_via: "customer",
    status: "received",
  }).select("id,category,file_name,file_size,uploaded_at,status").single();

  if (insErr || !doc) {
    // Storage-Cleanup
    await sb.storage.from("customer-docs").remove([path]).catch(() => {});
    return NextResponse.json({ error: "DB-Insert-Fehler" }, { status: 500 });
  }

  return NextResponse.json({ success: true, document: doc });
}

export async function DELETE(request: NextRequest, ctx: { params: Promise<{ token: string }> }) {
  const { token } = await ctx.params;
  const tok = await verifyUploadToken(token);
  if (!tok) return NextResponse.json({ error: "Token ungültig" }, { status: 401 });

  const url = new URL(request.url);
  const docId = url.searchParams.get("docId");
  if (!docId) return NextResponse.json({ error: "docId fehlt" }, { status: 400 });

  const sb = createServiceClient();
  // Sicherheit: nur Dokumente loeschen die zu DIESEM lead gehoeren
  const { data: doc } = await sb.from("documents").select("id,file_path,lead_id").eq("id", docId).maybeSingle();
  if (!doc || doc.lead_id !== tok.lead_id) return NextResponse.json({ error: "Nicht erlaubt" }, { status: 403 });

  await sb.storage.from("customer-docs").remove([doc.file_path]).catch(() => {});
  await sb.from("documents").delete().eq("id", docId);

  return NextResponse.json({ success: true });
}
