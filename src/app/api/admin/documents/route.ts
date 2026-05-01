import { NextRequest, NextResponse } from "next/server";
import { createServiceClient } from "@/lib/supabase";
import { requireAdmin } from "@/lib/admin-guard";

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
