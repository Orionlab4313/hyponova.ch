import { NextRequest, NextResponse } from "next/server";
import { createServiceClient } from "@/lib/supabase";
import { requireAdmin } from "@/lib/admin-guard";

const ALLOWED_FIELDS = [
  "first_name",
  "last_name",
  "email",
  "phone",
  "subject",
  "message",
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
    .from("contact_requests")
    .select("*")
    .neq("first_name", "__SYSTEM_AVAILABILITY__")
    .order("created_at", { ascending: false });

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
  const { data, error } = await supabase
    .from("contact_requests")
    .update(updates)
    .eq("id", id)
    .select()
    .single();

  if (error) return NextResponse.json({ error: "Datenbankfehler" }, { status: 500 });
  return NextResponse.json(data);
}

export async function DELETE(request: NextRequest) {
  const guard = requireAdmin(request);
  if (guard) return guard;

  const supabase = createServiceClient();
  const { id } = await request.json();
  if (!id) return NextResponse.json({ error: "id fehlt" }, { status: 400 });
  const { error } = await supabase.from("contact_requests").delete().eq("id", id);

  if (error) return NextResponse.json({ error: "Datenbankfehler" }, { status: 500 });
  return NextResponse.json({ success: true });
}
