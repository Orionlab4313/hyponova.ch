import { DAVClient } from "tsdav";

function getClient() {
  return new DAVClient({
    serverUrl: process.env.CALDAV_SERVER || "https://sync.infomaniak.com/",
    credentials: {
      username: process.env.CALDAV_USER || "",
      password: process.env.CALDAV_PASS || "",
    },
    authMethod: "Basic",
    defaultAccountType: "caldav",
  });
}

function createICSEvent(data: {
  uid: string;
  summary: string;
  description: string;
  date: string;
  timeStart: string;
  timeEnd: string;
  attendeeName?: string;
  attendeeEmail?: string;
}): string {
  const dtStart = data.date.replace(/-/g, "") + "T" + data.timeStart.replace(/:/g, "") + "00";
  const dtEnd = data.date.replace(/-/g, "") + "T" + data.timeEnd.replace(/:/g, "") + "00";
  const now = new Date().toISOString().replace(/[-:]/g, "").replace(/\.\d{3}/, "");

  // Replace em dash with regular dash for ICS compatibility
  const summary = data.summary.replace(/—/g, "-");
  const description = data.description.replace(/\n/g, "\\n").replace(/—/g, "-");

  let ics = `BEGIN:VCALENDAR
VERSION:2.0
PRODID:-//HYPONOVA//Terminbuchung//DE
METHOD:PUBLISH
BEGIN:VEVENT
UID:${data.uid}@hyponova.ch
DTSTAMP:${now}
DTSTART:${dtStart}
DTEND:${dtEnd}
SUMMARY;CHARSET=UTF-8:${summary}
DESCRIPTION;CHARSET=UTF-8:${description}`;

  if (data.attendeeEmail) {
    const attendeeName = (data.attendeeName || "").replace(/—/g, "-");
    ics += `\nATTENDEE;CN=${attendeeName}:mailto:${data.attendeeEmail}`;
  }

  ics += `\nEND:VEVENT\nEND:VCALENDAR`;
  return ics;
}

export async function createCalendarEvent(data: {
  uid: string;
  summary: string;
  description: string;
  date: string;
  timeStart: string;
  timeEnd: string;
  attendeeName?: string;
  attendeeEmail?: string;
}) {
  try {
    const client = getClient();
    await client.login();

    const calendars = await client.fetchCalendars();
    if (!calendars.length) {
      console.error("No calendars found");
      return;
    }

    const calendar = calendars[0]; // Use default calendar
    const icsData = createICSEvent(data);

    await client.createCalendarObject({
      calendar,
      filename: `${data.uid}.ics`,
      iCalString: icsData,
    });
  } catch (err) {
    console.error("CalDAV create error:", err);
  }
}

export async function updateCalendarEvent(data: {
  uid: string;
  summary: string;
  description: string;
  date: string;
  timeStart: string;
  timeEnd: string;
  attendeeName?: string;
  attendeeEmail?: string;
}) {
  try {
    const client = getClient();
    await client.login();

    const calendars = await client.fetchCalendars();
    if (!calendars.length) return;

    const calendar = calendars[0];
    const objects = await client.fetchCalendarObjects({ calendar });
    const existing = objects.find((o) => o.data?.includes(data.uid));

    if (existing) {
      const icsData = createICSEvent(data);
      await client.updateCalendarObject({
        calendarObject: { ...existing, data: icsData },
      });
    } else {
      await createCalendarEvent(data);
    }
  } catch (err) {
    console.error("CalDAV update error:", err);
  }
}

export async function deleteCalendarEvent(uid: string) {
  try {
    const client = getClient();
    await client.login();

    const calendars = await client.fetchCalendars();
    if (!calendars.length) return;

    const calendar = calendars[0];
    const objects = await client.fetchCalendarObjects({ calendar });
    const existing = objects.find((o) => o.data?.includes(uid));

    if (existing) {
      await client.deleteCalendarObject({ calendarObject: existing });
    }
  } catch (err) {
    console.error("CalDAV delete error:", err);
  }
}
