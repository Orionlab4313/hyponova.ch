import { NextRequest, NextResponse } from "next/server";
import { createServiceClient } from "@/lib/supabase";
import { requireAdmin } from "@/lib/admin-guard";

const ALLOWED_KATEGORIEN = new Set(["abloesung", "neukauf", "beide"]);

export async function GET(request: NextRequest) {
  const guard = requireAdmin(request);
  if (guard) return guard;

  try {
    const supabase = createServiceClient();
    const { data, error } = await supabase
      .from("dokument_vorlagen")
      .select("*")
      .order("kategorie", { ascending: true })
      .order("sort_order", { ascending: true })
      .order("created_at", { ascending: true });

    if (error) {
      return NextResponse.json({ error: "Datenbankfehler" }, { status: 500 });
    }
    return NextResponse.json(data);
  } catch (err) {
    console.error("Vorlagen GET error:", err);
    return NextResponse.json({ error: "Server error" }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  const guard = requireAdmin(request);
  if (guard) return guard;

  try {
    const body = await request.json();

    if (!body.name_de || !String(body.name_de).trim()) {
      return NextResponse.json({ error: "Name (DE) ist erforderlich" }, { status: 400 });
    }
    if (!body.kategorie || !ALLOWED_KATEGORIEN.has(body.kategorie)) {
      return NextResponse.json(
        { error: "Kategorie muss «abloesung», «neukauf» oder «beide» sein" },
        { status: 400 },
      );
    }
    if (!body.file_url || !body.file_name) {
      return NextResponse.json(
        { error: "Datei fehlt, bitte erst hochladen" },
        { status: 400 },
      );
    }

    const supabase = createServiceClient();
    const { data, error } = await supabase
      .from("dokument_vorlagen")
      .insert({
        name_de: body.name_de,
        name_en: body.name_en || "",
        description_de: body.description_de || null,
        description_en: body.description_en || null,
        kategorie: body.kategorie,
        file_url: body.file_url,
        file_name: body.file_name,
        file_size: body.file_size ?? null,
        file_url_en: body.file_url_en || null,
        file_name_en: body.file_name_en || null,
        file_size_en: body.file_size_en ?? null,
        sort_order: body.sort_order ?? 0,
        active: body.active !== false,
      })
      .select()
      .single();

    if (error) {
      console.error("Vorlagen POST DB error:", error);
      return NextResponse.json({ error: "Datenbankfehler" }, { status: 500 });
    }

    return NextResponse.json(data);
  } catch (err) {
    console.error("Vorlagen POST error:", err);
    return NextResponse.json({ error: "Server error" }, { status: 500 });
  }
}
