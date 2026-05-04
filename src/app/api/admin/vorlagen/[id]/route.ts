import { NextRequest, NextResponse } from "next/server";
import { createServiceClient } from "@/lib/supabase";
import { requireAdmin } from "@/lib/admin-guard";

const ALLOWED_KATEGORIEN = new Set(["abloesung", "neukauf", "beide"]);
const STORAGE_PREFIX_REGEX = /\/storage\/v1\/object\/public\/dokument-vorlagen\/(.+)$/;

function extractStoragePath(fileUrl: string | null | undefined): string | null {
  if (!fileUrl) return null;
  const m = fileUrl.match(STORAGE_PREFIX_REGEX);
  return m ? decodeURIComponent(m[1]) : null;
}

export async function GET(
  request: NextRequest,
  context: { params: Promise<{ id: string }> },
) {
  const guard = requireAdmin(request);
  if (guard) return guard;

  try {
    const { id } = await context.params;
    const supabase = createServiceClient();
    const { data, error } = await supabase
      .from("dokument_vorlagen")
      .select("*")
      .eq("id", id)
      .maybeSingle();

    if (error) return NextResponse.json({ error: "Datenbankfehler" }, { status: 500 });
    if (!data) return NextResponse.json({ error: "Nicht gefunden" }, { status: 404 });
    return NextResponse.json(data);
  } catch (err) {
    console.error("Vorlage GET error:", err);
    return NextResponse.json({ error: "Server error" }, { status: 500 });
  }
}

export async function PATCH(
  request: NextRequest,
  context: { params: Promise<{ id: string }> },
) {
  const guard = requireAdmin(request);
  if (guard) return guard;

  try {
    const { id } = await context.params;
    const body = await request.json();
    const supabase = createServiceClient();

    if (body.kategorie !== undefined && !ALLOWED_KATEGORIEN.has(body.kategorie)) {
      return NextResponse.json(
        { error: "Kategorie muss «abloesung», «neukauf» oder «beide» sein" },
        { status: 400 },
      );
    }

    // Wenn die Datei ersetzt wird: alte Datei aus Storage entfernen
    if (body.file_url) {
      const { data: previous } = await supabase
        .from("dokument_vorlagen")
        .select("file_url")
        .eq("id", id)
        .maybeSingle();
      const oldPath = extractStoragePath(previous?.file_url);
      const newPath = extractStoragePath(body.file_url);
      if (oldPath && oldPath !== newPath) {
        await supabase.storage.from("dokument-vorlagen").remove([oldPath]);
      }
    }

    const allowed = [
      "name_de",
      "name_en",
      "description_de",
      "description_en",
      "kategorie",
      "file_url",
      "file_name",
      "file_size",
      "sort_order",
      "active",
    ];
    const updates: Record<string, unknown> = {};
    for (const key of allowed) {
      if (key in body) updates[key] = body[key];
    }

    const { data, error } = await supabase
      .from("dokument_vorlagen")
      .update(updates)
      .eq("id", id)
      .select()
      .single();

    if (error) {
      console.error("Vorlage PATCH DB error:", error);
      return NextResponse.json({ error: "Datenbankfehler" }, { status: 500 });
    }

    return NextResponse.json(data);
  } catch (err) {
    console.error("Vorlage PATCH error:", err);
    return NextResponse.json({ error: "Server error" }, { status: 500 });
  }
}

export async function DELETE(
  request: NextRequest,
  context: { params: Promise<{ id: string }> },
) {
  const guard = requireAdmin(request);
  if (guard) return guard;

  try {
    const { id } = await context.params;
    const supabase = createServiceClient();

    // Datei aus Storage entfernen, dann DB-Eintrag
    const { data: existing } = await supabase
      .from("dokument_vorlagen")
      .select("file_url")
      .eq("id", id)
      .maybeSingle();

    const path = extractStoragePath(existing?.file_url);
    if (path) {
      await supabase.storage.from("dokument-vorlagen").remove([path]);
    }

    const { error } = await supabase
      .from("dokument_vorlagen")
      .delete()
      .eq("id", id);

    if (error) {
      return NextResponse.json({ error: "Datenbankfehler" }, { status: 500 });
    }

    return NextResponse.json({ success: true });
  } catch (err) {
    console.error("Vorlage DELETE error:", err);
    return NextResponse.json({ error: "Server error" }, { status: 500 });
  }
}
