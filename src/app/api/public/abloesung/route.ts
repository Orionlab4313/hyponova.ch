import { NextRequest, NextResponse } from "next/server";
import { createServiceClient } from "@/lib/supabase";
import { createSubmission, isAbloesbar, requiredDocumentCategories, type AbloesungAnswers } from "@/lib/submissions";
import { createUploadToken, buildUploadUrl } from "@/lib/upload-tokens";
import { checkRateLimit, clientIp } from "@/lib/rate-limit";

const RL_BUCKET = "public-abloesung";
const RL_MAX = 5;
const RL_WINDOW = 60 * 60; // 1h pro IP

export async function POST(request: NextRequest) {
  // Rate-Limit gegen Spam
  const ip = clientIp(request.headers);
  const limit = await checkRateLimit({ bucket: RL_BUCKET, key: ip, max: RL_MAX, windowSeconds: RL_WINDOW });
  if (!limit.ok) {
    return NextResponse.json({ error: `Zu viele Anfragen. Bitte in ${Math.ceil(limit.retryAfterSeconds / 60)} Minuten erneut versuchen.` }, { status: 429 });
  }

  let body: any;
  try { body = await request.json(); } catch { return NextResponse.json({ error: "Ungültige Anfrage" }, { status: 400 }); }

  const lang: "de" | "en" = body.lang === "en" ? "en" : "de";
  const first = String(body.first_name || "").trim().slice(0, 80);
  const last = String(body.last_name || "").trim().slice(0, 80);
  const email = String(body.email || "").trim().slice(0, 200);
  const phone = String(body.phone || "").trim().slice(0, 50);

  if (!first || !last || !email) return NextResponse.json({ error: "Pflichtfelder fehlen" }, { status: 400 });
  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) return NextResponse.json({ error: "Ungültige E-Mail" }, { status: 400 });

  // Tranchen-Validation
  const tranchen = Array.isArray(body.tranchen) ? body.tranchen : [];
  if (tranchen.length === 0) return NextResponse.json({ error: "Keine Tranchen angegeben" }, { status: 400 });
  for (const tr of tranchen) {
    if (typeof tr.betrag !== "number" || tr.betrag <= 0) return NextResponse.json({ error: "Betrag ungültig" }, { status: 400 });
    if (!["saron", "festzins", "variable"].includes(tr.modell)) return NextResponse.json({ error: "Modell ungültig" }, { status: 400 });
    if (tr.modell !== "variable" && !tr.faelligkeit) return NextResponse.json({ error: "Fälligkeitsdatum fehlt" }, { status: 400 });
  }

  if (!isAbloesbar(tranchen)) {
    return NextResponse.json({ error: "Hypothek ist aktuell nicht ablösbar" }, { status: 400 });
  }

  const answers: AbloesungAnswers = {
    tranchen,
    ist_abloesbar: true,
    kanton: String(body.kanton || ""),
    objektart: body.objektart || undefined,
    bewohnt: body.bewohnt || undefined,
    baurecht: typeof body.baurecht === "boolean" ? body.baurecht : undefined,
    taetigkeit: body.taetigkeit || undefined,
    weiss_modell: typeof body.weiss_modell === "boolean" ? body.weiss_modell : undefined,
    modell: body.modell || undefined,
    laufzeit_jahre: typeof body.laufzeit_jahre === "number" ? body.laufzeit_jahre : undefined,
  };

  const endPath: "offerten" | "termin" = body.end_path === "termin" ? "termin" : "offerten";

  const sb = createServiceClient();

  // 1. Lead anlegen (oder reaktivieren)
  const { data: existingLead } = await sb
    .from("leads")
    .select("id")
    .eq("email", email)
    .maybeSingle();

  let leadId: string;
  if (existingLead) {
    leadId = existingLead.id as string;
    await sb.from("leads").update({
      first_name: first,
      last_name: last,
      phone: phone || null,
      status: "kontaktiert",
      source: "Ablösung (Fragebogen)",
      updated_at: new Date().toISOString(),
    }).eq("id", leadId);
  } else {
    const { data: newLead, error: leadError } = await sb.from("leads").insert({
      first_name: first,
      last_name: last,
      email,
      phone: phone || null,
      source: "Ablösung (Fragebogen)",
      status: "neu",
    }).select("id").single();
    if (leadError || !newLead) return NextResponse.json({ error: "Lead konnte nicht angelegt werden" }, { status: 500 });
    leadId = newLead.id as string;
  }

  // 2. Submission speichern
  let submission;
  try {
    submission = await createSubmission({ lead_id: leadId, type: "abloesung", answers, lang, end_path: endPath });
  } catch (e: any) {
    return NextResponse.json({ error: "Submission-Fehler" }, { status: 500 });
  }

  // 3. Upload-Token erzeugen (nur wenn Offerten-Pfad — bei Termin sammelt Berater die Docs)
  let uploadUrl: string | null = null;
  if (endPath === "offerten") {
    try {
      const tok = await createUploadToken({ leadId, submissionId: submission.id, ttlDays: 30 });
      const host = request.headers.get("host") || "hyponova.ch";
      uploadUrl = buildUploadUrl(host, tok.token, lang);
    } catch (e) {
      console.error("upload token failed:", e);
    }
  }

  // 4. Email triggern via Edge Function
  try {
    const requiredDocs = requiredDocumentCategories("abloesung", answers);
    const fnUrl = `${process.env.NEXT_PUBLIC_SUPABASE_URL}/functions/v1/on-booking`;
    await fetch(fnUrl, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${process.env.SUPABASE_SERVICE_ROLE_KEY}`,
      },
      body: JSON.stringify({
        action: "questionnaire-submitted",
        type: "abloesung",
        endPath,
        lang,
        lead: { first_name: first, last_name: last, email, phone },
        uploadUrl,
        requiredDocs,
      }),
    });
  } catch (e) {
    console.error("email trigger failed:", e);
    // Trotzdem success, Email kann manuell nachgesendet werden
  }

  return NextResponse.json({ success: true, leadId, submissionId: submission.id, uploadUrl });
}
