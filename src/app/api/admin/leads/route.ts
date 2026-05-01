import { NextRequest, NextResponse } from "next/server";
import { createServiceClient } from "@/lib/supabase";
import { requireAdmin } from "@/lib/admin-guard";

const ALLOWED_FIELDS = [
  "first_name",
  "last_name",
  "email",
  "phone",
  "status",
  "source",
  "notes",
] as const;

function pickAllowed(body: Record<string, unknown>) {
  const out: Record<string, unknown> = {};
  for (const k of ALLOWED_FIELDS) {
    if (k in body) out[k] = body[k];
  }
  return out;
}

export async function GET(request: NextRequest) {
  const guard = requireAdmin(request);
  if (guard) return guard;

  const supabase = createServiceClient();
  const { data, error } = await supabase
    .from("leads")
    .select("*")
    .order("created_at", { ascending: false });

  if (error) return NextResponse.json({ error: "Datenbankfehler" }, { status: 500 });
  return NextResponse.json(data);
}

export async function POST(request: NextRequest) {
  const guard = requireAdmin(request);
  if (guard) return guard;

  const supabase = createServiceClient();
  const body = await request.json();
  const insert = pickAllowed(body);
  const { data, error } = await supabase.from("leads").insert(insert).select().single();

  if (error) return NextResponse.json({ error: "Datenbankfehler" }, { status: 500 });
  return NextResponse.json(data);
}

export async function PATCH(request: NextRequest) {
  const guard = requireAdmin(request);
  if (guard) return guard;

  const supabase = createServiceClient();
  const body = await request.json();
  const { id } = body;
  if (!id) return NextResponse.json({ error: "id fehlt" }, { status: 400 });
  const updates = pickAllowed(body);
  (updates as Record<string, unknown>).updated_at = new Date().toISOString();

  const { data, error } = await supabase.from("leads").update(updates).eq("id", id).select().single();

  if (error) return NextResponse.json({ error: "Datenbankfehler" }, { status: 500 });
  return NextResponse.json(data);
}

export async function DELETE(request: NextRequest) {
  const guard = requireAdmin(request);
  if (guard) return guard;

  const supabase = createServiceClient();
  const { id } = await request.json();
  if (!id) return NextResponse.json({ error: "id fehlt" }, { status: 400 });

  // 1. Alle Storage-Files dieses Leads sammeln und loeschen
  //    (DB-Cascade kuemmert sich um documents/submissions/todos/tokens-Rows,
  //     aber die Storage-Bucket-Files bleiben sonst zurueck)
  const { data: docs } = await supabase
    .from("documents")
    .select("file_path")
    .eq("lead_id", id);

  const paths = (docs || []).map((d) => d.file_path).filter(Boolean) as string[];
  if (paths.length > 0) {
    await supabase.storage.from("customer-docs").remove(paths).catch((e) => {
      console.error("storage cleanup fehlgeschlagen:", e);
      // Wir loeschen den Lead trotzdem — orphaned Storage-Files koennen
      // spaeter aufgeraeumt werden.
    });
  }

  // 2. Lead loeschen — CASCADE killt documents, submissions, todos, upload-tokens
  const { error } = await supabase.from("leads").delete().eq("id", id);

  if (error) return NextResponse.json({ error: "Datenbankfehler" }, { status: 500 });
  return NextResponse.json({ success: true, deletedFiles: paths.length });
}
