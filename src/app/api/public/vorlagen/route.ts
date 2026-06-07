import { NextRequest, NextResponse } from "next/server";
import { createServiceClient } from "@/lib/supabase";

const ALLOWED_KATEGORIEN = new Set(["abloesung", "neukauf"]);

/**
 * Liefert aktive Dokument-Vorlagen fuer den Kunden-Workflow.
 * ?kategorie=abloesung|neukauf, gibt Vorlagen zurueck die fuer diesen Workflow
 * gelten ("beide" matched immer).
 */
export async function GET(request: NextRequest) {
  try {
    const url = new URL(request.url);
    const kategorie = url.searchParams.get("kategorie") || "";

    if (!ALLOWED_KATEGORIEN.has(kategorie)) {
      return NextResponse.json(
        { error: "Kategorie muss «abloesung» oder «neukauf» sein" },
        { status: 400 },
      );
    }

    const supabase = createServiceClient();
    const { data, error } = await supabase
      .from("dokument_vorlagen")
      .select("id, name_de, name_en, description_de, description_en, kategorie, file_url, file_name, file_size, file_url_en, file_name_en, file_size_en, sort_order")
      .eq("active", true)
      .in("kategorie", [kategorie, "beide"])
      .order("sort_order", { ascending: true })
      .order("created_at", { ascending: true });

    if (error) {
      console.error("Public Vorlagen GET error:", error);
      return NextResponse.json({ error: "Datenbankfehler" }, { status: 500 });
    }

    return NextResponse.json(data || []);
  } catch (err) {
    console.error("Public Vorlagen exception:", err);
    return NextResponse.json({ error: "Server error" }, { status: 500 });
  }
}
