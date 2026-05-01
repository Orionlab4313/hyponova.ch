import { NextRequest, NextResponse } from "next/server";
import { randomBytes } from "crypto";
import { createServiceClient } from "@/lib/supabase";
import { requireAdmin } from "@/lib/admin-guard";

const MAX_SIZE = 25 * 1024 * 1024;
const ALLOWED_MIMES = new Set(["application/pdf", "image/jpeg", "image/png", "image/jpg", "image/webp"]);

/**
 * GET /api/admin/documents
 *   ?leadId=xxx → liefert alle Dokumente fuer einen Lead inkl. Submission
 *   ohne param → liefert pro-Lead-Aggregation (count, last_upload)
 */
export async function GET(request: NextRequest) {
  const guard = requireAdmin(request);
  if (guard) return guard;

  const url = new URL(request.url);
  const leadId = url.searchParams.get("leadId");
  const sb = createServiceClient();

  if (leadId) {
    const [{ data: lead }, { data: docs }, { data: submissions }] = await Promise.all([
      sb.from("leads").select("*").eq("id", leadId).maybeSingle(),
      sb.from("documents").select("*").eq("lead_id", leadId).order("uploaded_at", { ascending: false }),
      sb.from("questionnaire_submissions").select("*").eq("lead_id", leadId).order("created_at", { ascending: false }),
    ]);
    return NextResponse.json({ lead, documents: docs || [], submissions: submissions || [] });
  }

  // Aggregation pro Lead
  const { data: leads } = await sb
    .from("leads")
    .select("id,first_name,last_name,email,status,source,created_at,updated_at")
    .order("updated_at", { ascending: false });

  const { data: allDocs } = await sb
    .from("documents")
    .select("lead_id,id,uploaded_at,status");

  const { data: subs } = await sb
    .from("questionnaire_submissions")
    .select("lead_id,id,type,created_at");

  const docsByLead = new Map<string, { count: number; last_upload: string | null; reviewing: number }>();
  for (const d of allDocs || []) {
    const cur = docsByLead.get(d.lead_id) || { count: 0, last_upload: null, reviewing: 0 };
    cur.count += 1;
    if (d.status === "received" || d.status === "reviewing") cur.reviewing += 1;
    if (!cur.last_upload || (d.uploaded_at && d.uploaded_at > cur.last_upload)) cur.last_upload = d.uploaded_at;
    docsByLead.set(d.lead_id, cur);
  }

  const subsByLead = new Map<string, { types: string[] }>();
  for (const s of subs || []) {
    const cur = subsByLead.get(s.lead_id) || { types: [] };
    if (!cur.types.includes(s.type)) cur.types.push(s.type);
    subsByLead.set(s.lead_id, cur);
  }

  const result = (leads || []).map((l) => ({
    ...l,
    docs: docsByLead.get(l.id) || { count: 0, last_upload: null, reviewing: 0 },
    submissions: subsByLead.get(l.id) || { types: [] },
  }));

  return NextResponse.json(result);
}

/**
 * POST /api/admin/documents
 * Multipart Body: file, leadId, category?, submissionId?
 * Erlaubt dem Admin selbst ein Dokument fuer einen Lead hochzuladen
 * (z.B. wenn Kunde es per Mail oder Post geschickt hat).
 */
export async function POST(request: NextRequest) {
  const guard = requireAdmin(request);
  if (guard) return guard;

  let formData: FormData;
  try { formData = await request.formData(); } catch { return NextResponse.json({ error: "Ungültige Anfrage" }, { status: 400 }); }

  const file = formData.get("file") as File | null;
  const leadId = String(formData.get("leadId") || "");
  const category = (formData.get("category") as string | null) || null;
  const submissionId = (formData.get("submissionId") as string | null) || null;

  if (!file) return NextResponse.json({ error: "Keine Datei" }, { status: 400 });
  if (!leadId) return NextResponse.json({ error: "leadId fehlt" }, { status: 400 });
  if (file.size > MAX_SIZE) return NextResponse.json({ error: "Datei zu gross (max. 25 MB)" }, { status: 400 });
  if (!ALLOWED_MIMES.has(file.type)) return NextResponse.json({ error: "Ungültiger Dateityp" }, { status: 400 });

  const sb = createServiceClient();

  const safeOriginal = (file.name || "datei")
    .normalize("NFD").replace(/[̀-ͯ]/g, "")
    .replace(/[^a-zA-Z0-9._-]/g, "_")
    .slice(0, 80);
  const random = randomBytes(6).toString("hex");
  const safeCat = category ? category.replace(/[^a-z0-9_-]/gi, "_") : "admin-upload";
  const path = `${leadId}/${safeCat}/${Date.now()}-${random}-${safeOriginal}`;

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
    lead_id: leadId,
    submission_id: submissionId,
    category,
    file_name: file.name?.slice(0, 200) || "datei",
    file_path: path,
    file_size: file.size,
    mime_type: file.type,
    uploaded_via: "admin",
    status: "received",
  }).select().single();

  if (insErr || !doc) {
    await sb.storage.from("customer-docs").remove([path]).catch(() => {});
    return NextResponse.json({ error: "DB-Insert-Fehler" }, { status: 500 });
  }

  return NextResponse.json({ success: true, document: doc });
}
