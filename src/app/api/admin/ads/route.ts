import { NextRequest, NextResponse } from "next/server";
import { createServiceClient } from "@/lib/supabase";
import { requireAdmin } from "@/lib/admin-guard";
import { extractGoogleTagId } from "@/lib/ads";

const COLUMNS = "google_tag_id, google_tag_enabled, ads_updated_at";

export async function GET(request: NextRequest) {
  const guard = requireAdmin(request);
  if (guard) return guard;

  try {
    const supabase = createServiceClient();
    const { data, error } = await supabase
      .from("admin_settings")
      .select(COLUMNS)
      .eq("id", 1)
      .maybeSingle();
    if (error) {
      console.error("admin ads GET DB:", error.message);
      return NextResponse.json({ error: "Datenbankfehler" }, { status: 500 });
    }
    return NextResponse.json(data || { google_tag_id: null, google_tag_enabled: false, ads_updated_at: null });
  } catch (err) {
    console.error("admin ads GET:", err);
    return NextResponse.json({ error: "Server error" }, { status: 500 });
  }
}

export async function PATCH(request: NextRequest) {
  const guard = requireAdmin(request);
  if (guard) return guard;

  try {
    const body = await request.json();
    const updates: { google_tag_id?: string | null; google_tag_enabled?: boolean } = {};

    if ("google_tag_id" in body) {
      const raw = typeof body.google_tag_id === "string" ? body.google_tag_id.trim() : "";
      if (raw === "") {
        updates.google_tag_id = null;
      } else {
        const id = extractGoogleTagId(raw);
        if (!id) {
          return NextResponse.json(
            { error: "Das ist keine gültige Google-Tag-ID. Erwartet wird z.B. AW-123456789." },
            { status: 400 },
          );
        }
        updates.google_tag_id = id;
      }
    }

    if ("google_tag_enabled" in body) {
      updates.google_tag_enabled = body.google_tag_enabled === true;
    }

    if (Object.keys(updates).length === 0) {
      return NextResponse.json({ error: "Keine Änderungen" }, { status: 400 });
    }

    const supabase = createServiceClient();

    // Ohne ID kann der Tag nicht aktiv sein.
    if (updates.google_tag_id === null) {
      updates.google_tag_enabled = false;
    } else if (updates.google_tag_enabled === true && updates.google_tag_id === undefined) {
      const { data: current } = await supabase
        .from("admin_settings")
        .select("google_tag_id")
        .eq("id", 1)
        .maybeSingle();
      if (!current?.google_tag_id) {
        return NextResponse.json({ error: "Bitte zuerst eine Google-Tag-ID eintragen." }, { status: 400 });
      }
    }

    const { data, error } = await supabase
      .from("admin_settings")
      .update({ ...updates, ads_updated_at: new Date().toISOString() })
      .eq("id", 1)
      .select(COLUMNS)
      .single();

    if (error) {
      console.error("admin ads PATCH DB:", error.message);
      return NextResponse.json({ error: "Datenbankfehler" }, { status: 500 });
    }
    return NextResponse.json(data);
  } catch (err) {
    console.error("admin ads PATCH:", err);
    return NextResponse.json({ error: "Server error" }, { status: 500 });
  }
}
