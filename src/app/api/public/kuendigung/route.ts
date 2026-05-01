import { NextRequest, NextResponse } from "next/server";
import { PDFDocument, StandardFonts, rgb } from "pdf-lib";
import { checkRateLimit, clientIp } from "@/lib/rate-limit";

const RL_BUCKET = "public-kuendigung";
const RL_MAX = 10;
const RL_WINDOW = 60 * 60;

const MONTHS_DE = ["Januar","Februar","März","April","Mai","Juni","Juli","August","September","Oktober","November","Dezember"];
const MONTHS_EN = ["January","February","March","April","May","June","July","August","September","October","November","December"];

export async function POST(request: NextRequest) {
  const ip = clientIp(request.headers);
  const limit = await checkRateLimit({ bucket: RL_BUCKET, key: ip, max: RL_MAX, windowSeconds: RL_WINDOW });
  if (!limit.ok) return NextResponse.json({ error: "Zu viele Anfragen." }, { status: 429 });

  let body: any;
  try { body = await request.json(); } catch { return NextResponse.json({ error: "Ungültige Anfrage" }, { status: 400 }); }

  const lang: "de" | "en" = body.lang === "en" ? "en" : "de";
  const required = ["first_name","last_name","address_street","address_plz","address_ort","bank_name","bank_street","bank_plz","bank_ort","property_address","mortgage_holder","mortgage_amount","city_today"];
  for (const k of required) {
    if (!body[k] || String(body[k]).trim().length === 0) {
      return NextResponse.json({ error: `Pflichtfeld fehlt: ${k}` }, { status: 400 });
    }
  }

  const today = new Date();
  const monthName = (lang === "de" ? MONTHS_DE : MONTHS_EN)[today.getMonth()];
  const year = today.getFullYear();

  const salutation = body.salutation === "Frau" ? "Frau" : body.salutation === "Herr" ? "Herr" : "";
  const senderLines = [
    salutation ? `${salutation} ${body.first_name} ${body.last_name}` : `${body.first_name} ${body.last_name}`,
    body.address_street,
    `${body.address_plz} ${body.address_ort}`,
  ];
  const bankLines = [body.bank_name, body.bank_street, `${body.bank_plz} ${body.bank_ort}`];
  const dateLine = `${body.city_today}, im ${monthName} ${year}`;
  const subject = lang === "en"
    ? `Precautionary cancellation of the mortgage on ${body.property_address}, held by ${body.mortgage_holder}`
    : `Vorsorgliche Kündigung der Hypothek auf der Liegenschaft ${body.property_address}, lautend auf ${body.mortgage_holder}`;

  const greeting = lang === "en" ? "Dear Sir or Madam" : "Sehr geehrte Damen und Herren";
  const bodyText = lang === "en"
    ? `We hereby give precautionary notice of cancellation for our mortgage (total CHF ${body.mortgage_amount}) effective at the next possible cancellation date.\n\nWe thank you for confirming receipt of this letter of cancellation.`
    : `Unsere Hypothek (Total CHF ${body.mortgage_amount}) möchten wir per nächstmöglichem Kündigungstermin vorsorglich kündigen.\n\nWir danken Ihnen für eine Bestätigung des Erhalts dieses Kündigungsschreibens.`;
  const sign = lang === "en" ? "Kind regards" : "Freundliche Grüsse";

  // PDF erzeugen — A4 595x842 pt
  const pdf = await PDFDocument.create();
  const page = pdf.addPage([595, 842]);
  const font = await pdf.embedFont(StandardFonts.Helvetica);
  const fontBold = await pdf.embedFont(StandardFonts.HelveticaBold);

  let y = 800;
  const left = 70;
  const right = 525;
  const black = rgb(0.1, 0.1, 0.1);

  function text(s: string, x: number, ypos: number, opts?: { size?: number; bold?: boolean; color?: any }) {
    const sz = opts?.size ?? 11;
    const f = opts?.bold ? fontBold : font;
    page.drawText(s, { x, y: ypos, size: sz, font: f, color: opts?.color ?? black });
  }

  function drawLines(lines: string[], x: number, startY: number, lineHeight = 14): number {
    let cy = startY;
    for (const ln of lines) {
      text(ln, x, cy);
      cy -= lineHeight;
    }
    return cy;
  }

  function wrapText(s: string, maxChars: number): string[] {
    const words = s.split(/\s+/);
    const lines: string[] = [];
    let cur = "";
    for (const w of words) {
      if ((cur + " " + w).trim().length > maxChars) {
        if (cur) lines.push(cur);
        cur = w;
      } else {
        cur = (cur + " " + w).trim();
      }
    }
    if (cur) lines.push(cur);
    return lines;
  }

  // Sender oben links
  y = drawLines(senderLines, left, y);
  y -= 30;

  // EINSCHREIBEN-Marker
  text("EINSCHREIBEN", left, y, { bold: true, size: 10 });
  y -= 24;

  // Empfaenger
  y = drawLines(bankLines, left, y);
  y -= 40;

  // Datum
  text(dateLine, left, y);
  y -= 40;

  // Betreff
  for (const ln of wrapText(subject, 75)) {
    text(ln, left, y, { bold: true, size: 11 });
    y -= 14;
  }
  y -= 24;

  // Anrede
  text(greeting, left, y);
  y -= 24;

  // Body
  for (const para of bodyText.split("\n\n")) {
    for (const ln of wrapText(para, 80)) {
      text(ln, left, y);
      y -= 14;
    }
    y -= 10;
  }
  y -= 20;

  // Sign-off
  text(sign, left, y);
  y -= 60;

  // Unterschriftslinien
  text("_______________________", left, y);
  text("_______________________", left + 200, y);
  y -= 14;
  text(`${body.first_name} ${body.last_name}`, left, y, { size: 10, color: rgb(0.4, 0.4, 0.4) });

  // Footer-Hinweis
  text("Erstellt mit hyponova.ch", left, 40, { size: 8, color: rgb(0.6, 0.6, 0.6) });

  const pdfBytes = await pdf.save();

  return new NextResponse(Buffer.from(pdfBytes), {
    status: 200,
    headers: {
      "Content-Type": "application/pdf",
      "Content-Disposition": `attachment; filename="Kuendigung_Hypothek_${body.last_name}.pdf"`,
      "Cache-Control": "no-store",
    },
  });
}
