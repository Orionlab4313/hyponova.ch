import { NextRequest, NextResponse } from "next/server";
import { revalidatePath } from "next/cache";
import { createServiceClient } from "@/lib/supabase";

const ALLOWED_IDS = ["impressum", "agb", "datenschutz"] as const;
type AllowedId = (typeof ALLOWED_IDS)[number];

function isAllowed(id: string): id is AllowedId {
  return (ALLOWED_IDS as readonly string[]).includes(id);
}

export async function GET(
  _request: NextRequest,
  context: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await context.params;
    if (!isAllowed(id)) {
      return NextResponse.json({ error: "Ungültige Seite" }, { status: 400 });
    }
    const supabase = createServiceClient();
    const { data, error } = await supabase
      .from("legal_pages")
      .select("*")
      .eq("id", id)
      .maybeSingle();

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 });
    }
    if (!data) {
      return NextResponse.json({ error: "Nicht gefunden" }, { status: 404 });
    }
    return NextResponse.json(data);
  } catch (err) {
    console.error("Legal-page GET error:", err);
    return NextResponse.json({ error: "Server error" }, { status: 500 });
  }
}

export async function PATCH(
  request: NextRequest,
  context: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await context.params;
    if (!isAllowed(id)) {
      return NextResponse.json({ error: "Ungültige Seite" }, { status: 400 });
    }
    const supabase = createServiceClient();
    const body = await request.json();

    const allowed = [
      "title_de",
      "title_en",
      "title_highlight_de",
      "title_highlight_en",
      "content_html_de",
      "content_html_en",
      "meta_description_de",
      "meta_description_en",
    ];
    const updates: Record<string, unknown> = {};
    for (const key of allowed) {
      if (key in body) updates[key] = body[key] ?? "";
    }

    const { data, error } = await supabase
      .from("legal_pages")
      .update(updates)
      .eq("id", id)
      .select()
      .single();

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    // Public-Page Cache invalidieren
    revalidatePath(`/${id}`);

    return NextResponse.json(data);
  } catch (err) {
    console.error("Legal-page PATCH error:", err);
    return NextResponse.json({ error: "Server error" }, { status: 500 });
  }
}
