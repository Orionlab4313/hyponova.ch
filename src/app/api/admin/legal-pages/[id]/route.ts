import { NextRequest, NextResponse } from "next/server";
import { revalidatePath } from "next/cache";
import { createServiceClient } from "@/lib/supabase";
import { requireAdmin } from "@/lib/admin-guard";
import { sanitizeBlogHtml } from "@/lib/sanitize";

const ALLOWED_IDS = ["impressum", "agb", "datenschutz"] as const;
type AllowedId = (typeof ALLOWED_IDS)[number];

const HTML_FIELDS = new Set(["content_html_de", "content_html_en"]);

function isAllowed(id: string): id is AllowedId {
  return (ALLOWED_IDS as readonly string[]).includes(id);
}

export async function GET(
  request: NextRequest,
  context: { params: Promise<{ id: string }> }
) {
  const guard = requireAdmin(request);
  if (guard) return guard;

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
      return NextResponse.json({ error: "Datenbankfehler" }, { status: 500 });
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
  const guard = requireAdmin(request);
  if (guard) return guard;

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
      if (key in body) {
        const raw = String(body[key] ?? "");
        updates[key] = HTML_FIELDS.has(key) ? sanitizeBlogHtml(raw) : raw;
      }
    }

    const { data, error } = await supabase
      .from("legal_pages")
      .update(updates)
      .eq("id", id)
      .select()
      .single();

    if (error) {
      return NextResponse.json({ error: "Datenbankfehler" }, { status: 500 });
    }

    revalidatePath(`/${id}`);

    return NextResponse.json(data);
  } catch (err) {
    console.error("Legal-page PATCH error:", err);
    return NextResponse.json({ error: "Server error" }, { status: 500 });
  }
}
