import { NextRequest, NextResponse } from "next/server";
import { createServiceClient } from "@/lib/supabase";
import { requireAdmin } from "@/lib/admin-guard";

/** GET /api/admin/leads/[id]/todos, alle Todos zum Lead (offen zuerst, dann erledigt) */
export async function GET(request: NextRequest, ctx: { params: Promise<{ id: string }> }) {
  const guard = requireAdmin(request);
  if (guard) return guard;

  const { id } = await ctx.params;
  const sb = createServiceClient();
  const { data, error } = await sb
    .from("lead_todos")
    .select("*")
    .eq("lead_id", id)
    .order("done", { ascending: true })
    .order("created_at", { ascending: false });

  if (error) return NextResponse.json({ error: "Datenbankfehler" }, { status: 500 });
  return NextResponse.json(data || []);
}

/** POST /api/admin/leads/[id]/todos, neues Todo anlegen */
export async function POST(request: NextRequest, ctx: { params: Promise<{ id: string }> }) {
  const guard = requireAdmin(request);
  if (guard) return guard;

  const { id } = await ctx.params;
  const body = await request.json().catch(() => ({}));
  const text = String(body.text || "").trim().slice(0, 500);
  if (!text) return NextResponse.json({ error: "Text fehlt" }, { status: 400 });

  const due = body.due_date && /^\d{4}-\d{2}-\d{2}$/.test(body.due_date) ? body.due_date : null;

  const sb = createServiceClient();
  const { data, error } = await sb
    .from("lead_todos")
    .insert({ lead_id: id, text, due_date: due })
    .select()
    .single();

  if (error) return NextResponse.json({ error: "Datenbankfehler" }, { status: 500 });
  return NextResponse.json(data);
}
