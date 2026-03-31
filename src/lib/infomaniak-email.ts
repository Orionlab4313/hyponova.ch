import nodemailer from "nodemailer";

const transporter = nodemailer.createTransport({
  host: process.env.SMTP_HOST || "mail.infomaniak.com",
  port: parseInt(process.env.SMTP_PORT || "587"),
  secure: false,
  auth: {
    user: process.env.SMTP_USER,
    pass: process.env.SMTP_PASS,
  },
});

const FROM_NAME = "HYPONOVA";
const FROM_EMAIL = process.env.SMTP_USER || "info@hyponova.ch";
const SIGNATURE = `
Freundliche Grüsse
Simon Topalli
HYPONOVA GmbH
Dahlienweg 22, 4313 Möhlin
+41 79 249 70 90
info@hyponova.ch`;

function formatDateDE(dateStr: string): string {
  return new Date(dateStr + "T00:00:00").toLocaleDateString("de-CH", {
    weekday: "long",
    day: "numeric",
    month: "long",
    year: "numeric",
  });
}

function htmlTemplate(content: string): string {
  return `
<!DOCTYPE html>
<html lang="de">
<head><meta charset="utf-8"></head>
<body style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif; color: #1a1a1a; line-height: 1.6; max-width: 600px; margin: 0 auto; padding: 20px;">
  <div style="border-bottom: 3px solid #c8553d; padding-bottom: 20px; margin-bottom: 24px;">
    <h2 style="margin: 0; font-size: 20px; font-weight: 600; letter-spacing: 0.05em;">HYPONOVA</h2>
  </div>
  ${content}
  <div style="border-top: 1px solid #e5e5e5; margin-top: 32px; padding-top: 20px; font-size: 13px; color: #888;">
    <p style="margin: 0;">Simon Topalli</p>
    <p style="margin: 2px 0;">HYPONOVA GmbH · Dahlienweg 22, 4313 Möhlin</p>
    <p style="margin: 2px 0;">+41 79 249 70 90 · info@hyponova.ch</p>
  </div>
</body>
</html>`;
}

export async function sendBookingConfirmation(data: {
  to: string;
  firstName: string;
  lastName: string;
  date: string;
  timeStart: string;
  timeEnd: string;
}) {
  const html = htmlTemplate(`
    <p>Guten Tag ${data.firstName} ${data.lastName},</p>
    <p>Vielen Dank für Ihre Terminbuchung. Hier die Details:</p>
    <div style="background: #f5f5f3; border-radius: 8px; padding: 20px; margin: 20px 0;">
      <p style="margin: 0 0 8px;"><strong>Datum:</strong> ${formatDateDE(data.date)}</p>
      <p style="margin: 0 0 8px;"><strong>Uhrzeit:</strong> ${data.timeStart} – ${data.timeEnd} Uhr</p>
      <p style="margin: 0;"><strong>Art:</strong> Kostenloses Beratungsgespräch (Online)</p>
    </div>
    <p>Wir werden uns in Kürze bei Ihnen melden, um den Termin zu bestätigen.</p>
    <p>Bei Fragen stehen wir Ihnen gerne zur Verfügung.</p>
  `);

  await transporter.sendMail({
    from: `"${FROM_NAME}" <${FROM_EMAIL}>`,
    to: data.to,
    subject: `Terminbestätigung — ${formatDateDE(data.date)} um ${data.timeStart} Uhr`,
    html,
  });
}

export async function sendBookingRescheduled(data: {
  to: string;
  firstName: string;
  lastName: string;
  oldDate: string;
  oldTime: string;
  newDate: string;
  newTimeStart: string;
  newTimeEnd: string;
}) {
  const html = htmlTemplate(`
    <p>Guten Tag ${data.firstName} ${data.lastName},</p>
    <p>Ihr Termin bei HYPONOVA wurde verschoben.</p>
    <div style="background: #fef2f2; border-radius: 8px; padding: 16px; margin: 16px 0;">
      <p style="margin: 0; color: #888; text-decoration: line-through;">
        Alter Termin: ${formatDateDE(data.oldDate)} um ${data.oldTime} Uhr
      </p>
    </div>
    <div style="background: #f0fdf4; border-radius: 8px; padding: 20px; margin: 16px 0;">
      <p style="margin: 0 0 8px;"><strong>Neuer Termin:</strong></p>
      <p style="margin: 0 0 8px;"><strong>Datum:</strong> ${formatDateDE(data.newDate)}</p>
      <p style="margin: 0;"><strong>Uhrzeit:</strong> ${data.newTimeStart} – ${data.newTimeEnd} Uhr</p>
    </div>
    <p>Bei Fragen stehen wir Ihnen gerne zur Verfügung.</p>
  `);

  await transporter.sendMail({
    from: `"${FROM_NAME}" <${FROM_EMAIL}>`,
    to: data.to,
    subject: `Terminverschiebung — HYPONOVA`,
    html,
  });
}

export async function sendBookingCancelled(data: {
  to: string;
  firstName: string;
  lastName: string;
  date: string;
  time: string;
  reason?: string;
}) {
  const html = htmlTemplate(`
    <p>Guten Tag ${data.firstName} ${data.lastName},</p>
    <p>Leider müssen wir Ihren Termin absagen.</p>
    <div style="background: #fef2f2; border-radius: 8px; padding: 20px; margin: 20px 0;">
      <p style="margin: 0 0 8px;"><strong>Datum:</strong> ${formatDateDE(data.date)}</p>
      <p style="margin: 0;"><strong>Uhrzeit:</strong> ${data.time} Uhr</p>
      ${data.reason ? `<p style="margin: 12px 0 0; padding-top: 12px; border-top: 1px solid #fecaca;"><strong>Grund:</strong> ${data.reason}</p>` : ""}
    </div>
    <p>Wir werden uns bei Ihnen melden, um einen neuen Termin zu vereinbaren.</p>
    <p>Wir bitten um Ihr Verständnis.</p>
  `);

  await transporter.sendMail({
    from: `"${FROM_NAME}" <${FROM_EMAIL}>`,
    to: data.to,
    subject: `Terminabsage — HYPONOVA`,
    html,
  });
}

export async function sendContactConfirmation(data: {
  to: string;
  firstName: string;
  lastName: string;
  subject: string;
}) {
  const subjectLabels: Record<string, string> = {
    neukauf: "Eigenheim kaufen",
    abloesung: "Hypothek ablösen",
    beratung: "Allgemeine Beratung",
    sonstiges: "Sonstiges",
  };

  const html = htmlTemplate(`
    <p>Guten Tag ${data.firstName} ${data.lastName},</p>
    <p>Vielen Dank für Ihre Nachricht zum Thema <strong>«${subjectLabels[data.subject] || data.subject}»</strong>.</p>
    <p>Wir haben Ihre Anfrage erhalten und werden uns innerhalb von 24 Stunden bei Ihnen melden.</p>
    <p>In der Zwischenzeit können Sie auch direkt einen <a href="https://hyponova.ch/termin" style="color: #c8553d;">kostenlosen Beratungstermin</a> buchen.</p>
  `);

  await transporter.sendMail({
    from: `"${FROM_NAME}" <${FROM_EMAIL}>`,
    to: data.to,
    subject: `Ihre Anfrage bei HYPONOVA — Wir melden uns bei Ihnen`,
    html,
  });
}
