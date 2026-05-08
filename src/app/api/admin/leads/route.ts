import { NextRequest, NextResponse } from "next/server";
import { createServiceClient } from "@/lib/supabase";
import { requireAdmin } from "@/lib/admin-guard";
import { leadDedupeKey } from "@/lib/leads-dedupe";

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
  const insert = pickAllowed(body) as Record<string, unknown>;

  const newKey = leadDedupeKey({
    first_name: insert.first_name as string | undefined,
    last_name: insert.last_name as string | undefined,
    email: insert.email as string | undefined,
    phone: insert.phone as string | undefined,
  });

  if (newKey.replace(/\|/g, "")) {
    const { data: existingLeads } = await supabase
      .from("leads")
      .select("id, first_name, last_name, email, phone");

    const dupe = (existingLeads || []).find(
      (l) => leadDedupeKey(l) === newKey
    );
    if (dupe) {
      return NextResponse.json(
        {
          error: "Kontakt existiert bereits",
          duplicateOf: dupe.id,
        },
        { status: 409 }
      );
    }
  }

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

async function deleteLeadsByIds(ids: string[]) {
  const supabase = createServiceClient();

  const { data: docs } = await supabase
    .from("documents")
    .select("file_path")
    .in("lead_id", ids);

  const paths = (docs || []).map((d) => d.file_path).filter(Boolean) as string[];
  if (paths.length > 0) {
    await supabase.storage.from("customer-docs").remove(paths).catch((e) => {
      console.error("storage cleanup fehlgeschlagen:", e);
    });
  }

  const { error } = await supabase.from("leads").delete().in("id", ids);
  return { error, deletedFiles: paths.length };
}

export async function DELETE(request: NextRequest) {
  const guard = requireAdmin(request);
  if (guard) return guard;

  const body = await request.json();
  const ids: string[] = Array.isArray(body.ids)
    ? body.ids.filter((x: unknown) => typeof x === "string")
    : body.id
    ? [body.id]
    : [];

  if (ids.length === 0) {
    return NextResponse.json({ error: "id oder ids fehlt" }, { status: 400 });
  }

  const { error, deletedFiles } = await deleteLeadsByIds(ids);
  if (error) return NextResponse.json({ error: "Datenbankfehler" }, { status: 500 });

  return NextResponse.json({
    success: true,
    deletedCount: ids.length,
    deletedFiles,
  });
}
