import { NextRequest, NextResponse } from "next/server";
import { createServiceClient } from "@/lib/supabase";
import { sendContactConfirmation } from "@/lib/infomaniak-email";
import { createContact } from "@/lib/infomaniak-contacts";

export async function POST(request: NextRequest) {
  const supabase = createServiceClient();
  const body = await request.json();

  const { first_name, last_name, email, phone, subject, message } = body;

  if (!first_name || !last_name || !email || !subject || !message) {
    return NextResponse.json({ error: "Bitte füllen Sie alle Pflichtfelder aus." }, { status: 400 });
  }

  // Save to Supabase
  const { data, error } = await supabase
    .from("contact_requests")
    .insert({ first_name, last_name, email, phone: phone || null, subject, message })
    .select()
    .single();

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  // Send confirmation email + create contact (non-blocking)
  try {
    await Promise.all([
      sendContactConfirmation({ to: email, firstName: first_name, lastName: last_name, subject }),
      createContact({
        uid: data.id,
        firstName: first_name,
        lastName: last_name,
        email,
        phone: phone || undefined,
        note: `Kontaktanfrage: ${subject}\n${message}`,
      }),
    ]);
  } catch (err) {
    console.error("Integration error (non-blocking):", err);
  }

  return NextResponse.json(data);
}
