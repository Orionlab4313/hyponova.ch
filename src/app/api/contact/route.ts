import { NextRequest, NextResponse } from "next/server";
import { createServiceClient } from "@/lib/supabase";
import { triggerIntegration } from "@/lib/integrations";

export async function POST(request: NextRequest) {
  const supabase = createServiceClient();
  const body = await request.json();
  const { first_name, last_name, email, phone, subject, message, lang } = body;

  if (!first_name || !last_name || !email || !subject || !message) {
    return NextResponse.json({ error: "Bitte füllen Sie alle Pflichtfelder aus." }, { status: 400 });
  }

  const { data, error } = await supabase
    .from("contact_requests")
    .insert({ first_name, last_name, email, phone: phone || null, subject, message })
    .select().single();

  if (error) return NextResponse.json({ error: error.message }, { status: 500 });

  // Trigger Supabase Edge Function (non-blocking)
  triggerIntegration({
    action: "contact-form",
    lead: { id: data.id, first_name, last_name, email, phone, subject, lang: lang || "de" },
  });

  return NextResponse.json(data);
}
