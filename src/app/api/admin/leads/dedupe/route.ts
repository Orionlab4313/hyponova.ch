import { NextRequest, NextResponse } from "next/server";
import { createServiceClient } from "@/lib/supabase";
import { requireAdmin } from "@/lib/admin-guard";
import { groupDuplicates } from "@/lib/leads-dedupe";

type LeadRow = {
  id: string;
  first_name: string | null;
  last_name: string | null;
  email: string | null;
  phone: string | null;
  created_at: string | null;
};

export async function GET(request: NextRequest) {
  const guard = requireAdmin(request);
  if (guard) return guard;

  const supabase = createServiceClient();
  const { data, error } = await supabase
    .from("leads")
    .select("id, first_name, last_name, email, phone, created_at");

  if (error) return NextResponse.json({ error: "Datenbankfehler" }, { status: 500 });

  const groups = groupDuplicates<LeadRow>(data || []);
  return NextResponse.json({
    groupCount: groups.length,
    removeCount: groups.reduce((n, g) => n + g.remove.length, 0),
    groups: groups.map((g) => ({
      keep: g.keep,
      remove: g.remove.map((r) => ({ id: r.id, created_at: r.created_at })),
    })),
  });
}

export async function POST(request: NextRequest) {
  const guard = requireAdmin(request);
  if (guard) return guard;

  const supabase = createServiceClient();
  const { data, error } = await supabase
    .from("leads")
    .select("id, first_name, last_name, email, phone, created_at");

  if (error) return NextResponse.json({ error: "Datenbankfehler" }, { status: 500 });

  const groups = groupDuplicates<LeadRow>(data || []);
  const removeIds = groups.flatMap((g) => g.remove.map((r) => r.id));

  if (removeIds.length === 0) {
    return NextResponse.json({ deletedCount: 0, deletedFiles: 0, groupCount: 0 });
  }

  const { data: docs } = await supabase
    .from("documents")
    .select("file_path")
    .in("lead_id", removeIds);

  const paths = (docs || []).map((d) => d.file_path).filter(Boolean) as string[];
  if (paths.length > 0) {
    await supabase.storage.from("customer-docs").remove(paths).catch((e) => {
      console.error("storage cleanup fehlgeschlagen:", e);
    });
  }

  const { error: delError } = await supabase.from("leads").delete().in("id", removeIds);
  if (delError) return NextResponse.json({ error: "Datenbankfehler" }, { status: 500 });

  return NextResponse.json({
    deletedCount: removeIds.length,
    deletedFiles: paths.length,
    groupCount: groups.length,
  });
}
