import { NextRequest, NextResponse } from "next/server";
import { createServiceClient } from "@/lib/supabase";
import { createSubmission, requiredDocumentCategories, type NeukaufAnswers } from "@/lib/submissions";
import { checkRateLimit, clientIp } from "@/lib/rate-limit";

const RL_BUCKET = "public-neukauf";
const RL_MAX = 5;
const RL_WINDOW = 60 * 60;

export async function POST(request: NextRequest) {
  const ip = clientIp(request.headers);
  const limit = await checkRateLimit({ bucket: RL_BUCKET, key: ip, max: RL_MAX, windowSeconds: RL_WINDOW });
  if (!limit.ok) return NextResponse.json({ error: `Zu viele Anfragen. Bitte in ${Math.ceil(limit.retryAfterSeconds / 60)} Minuten erneut versuchen.` }, { status: 429 });

  let body: any;
  try { body = await request.json(); } catch { return NextResponse.json({ error: "Ungültige Anfrage" }, { status: 400 }); }

  const lang: "de" | "en" = body.lang === "en" ? "en" : "de";
  const first = String(body.first_name || "").trim().slice(0, 80);
  const last = String(body.last_name || "").trim().slice(0, 80);
  const email = String(body.email || "").trim().slice(0, 200);
  const phone = String(body.phone || "").trim().slice(0, 50);

  if (!first || !last || !email) return NextResponse.json({ error: "Pflichtfelder fehlen" }, { status: 400 });
  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) return NextResponse.json({ error: "Ungültige E-Mail" }, { status: 400 });

  const answers: NeukaufAnswers = {
    kanton: String(body.kanton || ""),
    objektart: body.objektart || undefined,
    status: body.status || undefined,
    baurecht: typeof body.baurecht === "boolean" ? body.baurecht : undefined,
    taetigkeit: body.taetigkeit || undefined,
  };

  const sb = createServiceClient();

  // Lead
  const { data: existingLead } = await sb.from("leads").select("id").eq("email", email).maybeSingle();
  let leadId: string;
  if (existingLead) {
    leadId = existingLead.id as string;
    await sb.from("leads").update({ first_name: first, last_name: last, phone: phone || null, status: "kontaktiert", source: "Neukauf (Fragebogen)", updated_at: new Date().toISOString() }).eq("id", leadId);
  } else {
    const { data: newLead, error } = await sb.from("leads").insert({ first_name: first, last_name: last, email, phone: phone || null, source: "Neukauf (Fragebogen)", status: "neu" }).select("id").single();
    if (error || !newLead) return NextResponse.json({ error: "Lead konnte nicht angelegt werden" }, { status: 500 });
    leadId = newLead.id as string;
  }

  // Submission (immer Termin-Pfad bei Neukauf)
  let submission;
  try {
    submission = await createSubmission({ lead_id: leadId, type: "neukauf", answers, lang, end_path: "termin" });
  } catch { return NextResponse.json({ error: "Submission-Fehler" }, { status: 500 }); }

  // Email triggern
  try {
    const requiredDocs = requiredDocumentCategories("neukauf", answers);
    const fnUrl = `${process.env.NEXT_PUBLIC_SUPABASE_URL}/functions/v1/on-booking`;
    await fetch(fnUrl, {
      method: "POST",
      headers: { "Content-Type": "application/json", Authorization: `Bearer ${process.env.SUPABASE_SERVICE_ROLE_KEY}` },
      body: JSON.stringify({
        action: "questionnaire-submitted",
        type: "neukauf",
        endPath: "termin",
        lang,
        lead: { first_name: first, last_name: last, email, phone },
        uploadUrl: null,
        requiredDocs,
      }),
    });
  } catch (e) { console.error("email trigger failed:", e); }

  return NextResponse.json({ success: true, leadId, submissionId: submission.id });
}
