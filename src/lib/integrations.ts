// Calls the Supabase Edge Function for all integrations (E-Mail, CalDAV, CardDAV)
const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const EDGE_FUNCTION_URL = `${SUPABASE_URL}/functions/v1/on-booking`;

export async function triggerIntegration(data: {
  action: "create" | "update" | "delete" | "contact-form" | "reply";
  appointment?: any;
  lead?: any;
  oldDate?: string;
  oldTime?: string;
  reason?: string;
  lang?: string;
  [key: string]: any;
}) {
  try {
    const res = await fetch(EDGE_FUNCTION_URL, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(data),
    });
    return await res.json();
  } catch (err) {
    console.error("Integration error:", err);
    return { error: String(err) };
  }
}
