import { NextRequest, NextResponse } from "next/server";
import { sendBookingConfirmation, sendBookingRescheduled, sendBookingCancelled } from "@/lib/infomaniak-email";
import { createCalendarEvent, updateCalendarEvent, deleteCalendarEvent } from "@/lib/infomaniak-calendar";
import { createContact } from "@/lib/infomaniak-contacts";


export async function POST(request: NextRequest) {
  const body = await request.json();
  const { appointment, lead, action, oldDate, oldTime, reason } = body;

  const results: Record<string, string> = {};

  try {
    if (action === "create" && appointment && lead) {
      // 1. Send confirmation email to customer
      await sendBookingConfirmation({
        to: lead.email,
        firstName: lead.first_name,
        lastName: lead.last_name,
        date: appointment.date,
        timeStart: appointment.time_start?.slice(0, 5),
        timeEnd: appointment.time_end?.slice(0, 5),
      });
      results.email = "sent";

      // 2. Create calendar event in Infomaniak
      await createCalendarEvent({
        uid: appointment.id,
        summary: appointment.title || `Beratungsgespräch — ${lead.first_name} ${lead.last_name}`,
        description: `Kunde: ${lead.first_name} ${lead.last_name}\nE-Mail: ${lead.email}\nTelefon: ${lead.phone || "-"}\n\n${appointment.description || ""}`,
        date: appointment.date,
        timeStart: appointment.time_start?.slice(0, 5),
        timeEnd: appointment.time_end?.slice(0, 5),
        attendeeName: `${lead.first_name} ${lead.last_name}`,
        attendeeEmail: lead.email,
      });
      results.calendar = "created";

      // 3. Create contact in Infomaniak
      await createContact({
        uid: lead.id,
        firstName: lead.first_name,
        lastName: lead.last_name,
        email: lead.email,
        phone: lead.phone,
        note: `Quelle: Website\nBetreff: ${appointment.description || "Terminbuchung"}`,
      });
      results.contact = "created";

    } else if (action === "update" && appointment && lead) {
      // 1. Send rescheduled email
      if (oldDate || oldTime) {
        await sendBookingRescheduled({
          to: lead.email,
          firstName: lead.first_name,
          lastName: lead.last_name,
          oldDate: oldDate || appointment.date,
          oldTime: oldTime || appointment.time_start?.slice(0, 5),
          newDate: appointment.date,
          newTimeStart: appointment.time_start?.slice(0, 5),
          newTimeEnd: appointment.time_end?.slice(0, 5),
        });
        results.email = "sent";
      }

      // 2. Update calendar event
      await updateCalendarEvent({
        uid: appointment.id,
        summary: appointment.title || `Beratungsgespräch — ${lead.first_name} ${lead.last_name}`,
        description: `Kunde: ${lead.first_name} ${lead.last_name}\nE-Mail: ${lead.email}\nTelefon: ${lead.phone || "-"}\n\n${appointment.description || ""}`,
        date: appointment.date,
        timeStart: appointment.time_start?.slice(0, 5),
        timeEnd: appointment.time_end?.slice(0, 5),
        attendeeName: `${lead.first_name} ${lead.last_name}`,
        attendeeEmail: lead.email,
      });
      results.calendar = "updated";

    } else if (action === "delete" && appointment) {
      // 1. Send cancellation email
      if (lead?.email) {
        await sendBookingCancelled({
          to: lead.email,
          firstName: lead.first_name,
          lastName: lead.last_name,
          date: appointment.date,
          time: appointment.time_start?.slice(0, 5),
          reason,
        });
        results.email = "sent";
      }

      // 2. Delete calendar event
      await deleteCalendarEvent(appointment.id);
      results.calendar = "deleted";
    }
  } catch (err: any) {
    console.error("Integration error:", err);
    return NextResponse.json({ error: err.message, results }, { status: 500 });
  }

  return NextResponse.json({ success: true, results });
}
