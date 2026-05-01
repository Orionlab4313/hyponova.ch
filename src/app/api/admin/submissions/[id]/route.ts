import { NextRequest, NextResponse } from "next/server";
import { createServiceClient } from "@/lib/supabase";
import { requireAdmin } from "@/lib/admin-guard";
import { isAbloesbar } from "@/lib/submissions";

/**
 * PATCH /api/admin/submissions/[id]
 * Body: { answers: {...}, end_path?, status? }
 *
 * Erlaubt dem Admin, die Antworten eines Fragebogens nachträglich zu
 * korrigieren (z.B. wenn der Kunde telefonisch eine Aenderung mitteilt).
 */
export async function PATCH(
  request: NextRequest,
  ctx: { params: Promise<{ id: string }> }
) {
  const guard = requireAdmin(request);
  if (guard) return guard;

  const { id } = await ctx.params;
  const body = await request.json().catch(() => ({}));

  const updates: Record<string, unknown> = {};

  if (body.answers && typeof body.answers === "object") {
    const answers = { ...body.answers };
    // Re-compute ist_abloesbar wenn Tranchen geaendert wurden
    if (Array.isArray(answers.tranchen)) {
      answers.ist_abloesbar = isAbloesbar(answers.tranchen);
    }
    updates.answers = answers;
  }

  if (body.end_path === "offerten" || body.end_path === "termin") {
    updates.end_path = body.end_path;
  }

  if (body.status && ["submitted", "reviewing", "done", "rejected"].includes(body.status)) {
    updates.status = body.status;
  }

  if (Object.keys(updates).length === 0) {
    return NextResponse.json({ error: "Nichts zu aktualisieren" }, { status: 400 });
  }

  const sb = createServiceClient();
  const { data, error } = await sb
    .from("questionnaire_submissions")
    .update(updates)
    .eq("id", id)
    .select()
    .single();

  if (error) return NextResponse.json({ error: "Datenbankfehler" }, { status: 500 });
  return NextResponse.json(data);
}
