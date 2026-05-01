import { NextRequest, NextResponse } from "next/server";
import { createServiceClient } from "@/lib/supabase";
import { requireAdmin } from "@/lib/admin-guard";

/**
 * GET /api/admin/documents/[id]?download=1 → liefert signed URL fuer Download
 * PATCH                                    → Status aendern
 * DELETE                                   → loeschen
 */
export async function GET(request: NextRequest, ctx: { params: Promise<{ id: string }> }) {
  const guard = requireAdmin(request);
  if (guard) return guard;

  const { id } = await ctx.params;
  const sb = createServiceClient();
  const { data, error } = await sb.from("documents").select("*").eq("id", id).maybeSingle();
  if (error || !data) return NextResponse.json({ error: "Nicht gefunden" }, { status: 404 });

  const url = new URL(request.url);
  if (url.searchParams.get("download") === "1") {
    // Signed URL — 5 Minuten gueltig
    const { data: signed, error: sErr } = await sb.storage
      .from("customer-docs")
      .createSignedUrl(data.file_path, 300);
    if (sErr || !signed) return NextResponse.json({ error: "Signed URL Fehler" }, { status: 500 });
    return NextResponse.json({ url: signed.signedUrl, file_name: data.file_name });
  }

  return NextResponse.json(data);
}

export async function PATCH(request: NextRequest, ctx: { params: Promise<{ id: string }> }) {
  const guard = requireAdmin(request);
  if (guard) return guard;

  const { id } = await ctx.params;
  const body = await request.json().catch(() => ({}));
  const allowed = ["status", "category"];
  const updates: Record<string, unknown> = {};
  for (const k of allowed) if (k in body) updates[k] = body[k];
  if (Object.keys(updates).length === 0) return NextResponse.json({ error: "Nichts zu aktualisieren" }, { status: 400 });

  const sb = createServiceClient();
  const { data, error } = await sb.from("documents").update(updates).eq("id", id).select().single();
  if (error) return NextResponse.json({ error: "Update-Fehler" }, { status: 500 });
  return NextResponse.json(data);
}

export async function DELETE(request: NextRequest, ctx: { params: Promise<{ id: string }> }) {
  const guard = requireAdmin(request);
  if (guard) return guard;

  const { id } = await ctx.params;
  const sb = createServiceClient();
  const { data: doc } = await sb.from("documents").select("file_path").eq("id", id).maybeSingle();
  if (doc?.file_path) {
    await sb.storage.from("customer-docs").remove([doc.file_path]).catch(() => {});
  }
  await sb.from("documents").delete().eq("id", id);
  return NextResponse.json({ success: true });
}
