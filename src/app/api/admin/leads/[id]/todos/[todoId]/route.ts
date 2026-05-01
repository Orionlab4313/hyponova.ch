import { NextRequest, NextResponse } from "next/server";
import { createServiceClient } from "@/lib/supabase";
import { requireAdmin } from "@/lib/admin-guard";

export async function PATCH(
  request: NextRequest,
  ctx: { params: Promise<{ id: string; todoId: string }> }
) {
  const guard = requireAdmin(request);
  if (guard) return guard;

  const { id, todoId } = await ctx.params;
  const body = await request.json().catch(() => ({}));
  const updates: Record<string, unknown> = {};
  if (typeof body.done === "boolean") updates.done = body.done;
  if (typeof body.text === "string") updates.text = body.text.trim().slice(0, 500);
  if (body.due_date === null) updates.due_date = null;
  if (typeof body.due_date === "string" && /^\d{4}-\d{2}-\d{2}$/.test(body.due_date)) updates.due_date = body.due_date;

  if (Object.keys(updates).length === 0) {
    return NextResponse.json({ error: "Nichts zu aktualisieren" }, { status: 400 });
  }

  const sb = createServiceClient();
  const { data, error } = await sb
    .from("lead_todos")
    .update(updates)
    .eq("id", todoId)
    .eq("lead_id", id)
    .select()
    .single();

  if (error) return NextResponse.json({ error: "Datenbankfehler" }, { status: 500 });
  return NextResponse.json(data);
}

export async function DELETE(
  request: NextRequest,
  ctx: { params: Promise<{ id: string; todoId: string }> }
) {
  const guard = requireAdmin(request);
  if (guard) return guard;

  const { id, todoId } = await ctx.params;
  const sb = createServiceClient();
  const { error } = await sb
    .from("lead_todos")
    .delete()
    .eq("id", todoId)
    .eq("lead_id", id);

  if (error) return NextResponse.json({ error: "Datenbankfehler" }, { status: 500 });
  return NextResponse.json({ success: true });
}
