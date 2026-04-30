import { NextRequest, NextResponse } from "next/server";
import { createServiceClient } from "@/lib/supabase";
import { requireAdmin } from "@/lib/admin-guard";

export async function GET(request: NextRequest) {
  const guard = requireAdmin(request);
  if (guard) return guard;

  const supabase = createServiceClient();
  const { data, error } = await supabase
    .from("message_replies")
    .select("*")
    .order("sent_at", { ascending: false });

  if (error) return NextResponse.json({ error: "Datenbankfehler" }, { status: 500 });
  return NextResponse.json(data);
}

export async function POST(request: NextRequest) {
  const guard = requireAdmin(request);
  if (guard) return guard;

  const supabase = createServiceClient();
  const body = await request.json();
  const message_id = body.message_id;
  const reply_text = body.reply_text;
  if (!message_id || typeof reply_text !== "string") {
    return NextResponse.json({ error: "message_id oder reply_text fehlt" }, { status: 400 });
  }
  const { data, error } = await supabase
    .from("message_replies")
    .insert({ message_id, reply_text })
    .select()
    .single();

  if (error) return NextResponse.json({ error: "Datenbankfehler" }, { status: 500 });
  return NextResponse.json(data);
}
