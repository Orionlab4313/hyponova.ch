"use client";

import { useState } from "react";
import Link from "next/link";
import { useI18n } from "@/i18n/context";

type Lang = "de" | "en";

const COPY = {
  de: {
    badge: "Kündigungsvorlage",
    titlePre: "Hypothek",
    titleHl: "vorsorglich kündigen",
    intro: "Erstellen Sie in 2 Minuten Ihr vorsorgliches Kündigungsschreiben als PDF — bereit zum Versand per Einschreiben.",
    sectionAbsender: "Ihre Angaben (Absender)",
    sectionEmpfaenger: "Bank (Empfänger)",
    sectionDetails: "Details zur Hypothek",
    salutation: "Anrede",
    salutationHerr: "Herr",
    salutationFrau: "Frau",
    firstName: "Vorname",
    lastName: "Nachname",
    addPerson: "+ Zweite Person hinzufügen",
    removePerson: "× Zweite Person entfernen",
    person2Label: "Zweite Person (optional)",
    addressStreet: "Strasse / Hausnummer",
    addressPlz: "PLZ",
    addressOrt: "Ort",
    bankName: "Name der Bank",
    bankStreet: "Strasse / Hausnummer der Bank",
    bankPlz: "PLZ",
    bankOrt: "Ort",
    propertyAddress: "Adresse der Liegenschaft",
    mortgageHolder: "Hypothek lautend auf (Name/n)",
    mortgageAmount: "Hypothek-Betrag total (CHF)",
    cityToday: "Ort der Unterzeichnung",
    placeholderAmount: "z.B. 800'000",
    download: "Kündigungs-PDF herunterladen",
    generating: "PDF wird erstellt…",
    hintTitle: "Wichtiger Hinweis",
    hintBody: "Diese Vorlage ist eine vorsorgliche Kündigung — Sie müssen die Hypothek nicht zwingend ablösen. Versenden Sie das Schreiben rechtzeitig vor dem Kündigungstermin per Einschreiben.",
    fieldRequired: "Pflichtfeld",
    pdfError: "PDF-Erstellung fehlgeschlagen. Bitte versuchen Sie es erneut.",
    homeBtn: "← Zur Startseite",
  },
  en: {
    badge: "Cancellation template",
    titlePre: "Cancel mortgage",
    titleHl: "as a precaution",
    intro: "Generate your precautionary cancellation letter as a PDF in 2 minutes — ready to send by registered mail.",
    sectionAbsender: "Your details (sender)",
    sectionEmpfaenger: "Bank (recipient)",
    sectionDetails: "Mortgage details",
    salutation: "Salutation",
    salutationHerr: "Mr",
    salutationFrau: "Mrs",
    firstName: "First name",
    lastName: "Last name",
    addPerson: "+ Add second person",
    removePerson: "× Remove second person",
    person2Label: "Second person (optional)",
    addressStreet: "Street / number",
    addressPlz: "ZIP",
    addressOrt: "City",
    bankName: "Bank name",
    bankStreet: "Bank street / number",
    bankPlz: "ZIP",
    bankOrt: "City",
    propertyAddress: "Property address",
    mortgageHolder: "Mortgage holder name(s)",
    mortgageAmount: "Total mortgage amount (CHF)",
    cityToday: "Place of signature",
    placeholderAmount: "e.g. 800'000",
    download: "Download cancellation PDF",
    generating: "Generating PDF…",
    hintTitle: "Important note",
    hintBody: "This template is a precautionary cancellation — you don't have to refinance. Send the letter by registered mail in good time before the cancellation date.",
    fieldRequired: "Required",
    pdfError: "PDF generation failed. Please try again.",
    homeBtn: "← Back to homepage",
  },
} as const;

const ACCENT = "#c8553d";

interface Form {
  salutation: "Herr" | "Frau" | "";
  first_name: string; last_name: string;
  // Optionale zweite Person (z.B. bei Ehepaar oder Konkubinat).
  // Wenn ausgefuellt -> 2 Unterschriftslinien im PDF.
  has_person2: boolean;
  salutation2: "Herr" | "Frau" | "";
  first_name2: string; last_name2: string;
  address_street: string; address_plz: string; address_ort: string;
  bank_name: string; bank_street: string; bank_plz: string; bank_ort: string;
  property_address: string; mortgage_holder: string; mortgage_amount: string;
  city_today: string;
}

const init: Form = {
  salutation: "", first_name: "", last_name: "",
  has_person2: false,
  salutation2: "", first_name2: "", last_name2: "",
  address_street: "", address_plz: "", address_ort: "",
  bank_name: "", bank_street: "", bank_plz: "", bank_ort: "",
  property_address: "", mortgage_holder: "", mortgage_amount: "", city_today: "",
};

/**
 * Schweizer CHF-Format mit Apostroph waehrend der Eingabe.
 */
function formatChfInput(s: string): string {
  const digits = s.replace(/[^0-9]/g, "");
  if (!digits) return "";
  return digits.replace(/\B(?=(\d{3})+(?!\d))/g, "'");
}

export default function KuendigungForm({ initialLang }: { initialLang: Lang }) {
  const { lang: ctxLang } = useI18n();
  const lang: Lang = (ctxLang as Lang) || initialLang;
  const t = COPY[lang];
  const [f, setF] = useState<Form>(init);
  const [error, setError] = useState<string | null>(null);
  const [generating, setGenerating] = useState(false);

  function up<K extends keyof Form>(k: K, v: Form[K]) { setF((p) => ({ ...p, [k]: v })); setError(null); }

  async function generate() {
    const required: (keyof Form)[] = ["first_name", "last_name", "address_street", "address_plz", "address_ort", "bank_name", "bank_street", "bank_plz", "bank_ort", "property_address", "mortgage_holder", "mortgage_amount", "city_today"];
    for (const k of required) {
      if (!f[k]) { setError(t.fieldRequired); return; }
    }
    // Wenn 2. Person aktiviert: Vor- und Nachname Pflicht
    if (f.has_person2 && (!f.first_name2 || !f.last_name2)) { setError(t.fieldRequired); return; }
    setGenerating(true);
    setError(null);
    try {
      const res = await fetch("/api/public/kuendigung", {
        method: "POST", headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ ...f, lang }),
      });
      if (!res.ok) { const j = await res.json().catch(() => ({})); throw new Error(j.error || t.pdfError); }
      const blob = await res.blob();
      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = `Kuendigung_Hypothek_${f.last_name}.pdf`;
      a.click();
      URL.revokeObjectURL(url);
    } catch (e: any) { setError(e.message || t.pdfError); } finally { setGenerating(false); }
  }

  return (
    <div style={{ background: "#f7f5f2", minHeight: "calc(100vh - 200px)", padding: "60px 20px" }}>
      <div style={{ maxWidth: 720, margin: "0 auto" }}>
        <div style={{ textAlign: "center", marginBottom: 30 }}>
          <span style={{ display: "inline-block", padding: "5px 14px", fontSize: 11, fontWeight: 600, letterSpacing: "0.12em", textTransform: "uppercase", color: ACCENT, border: `1px solid ${ACCENT}66`, borderRadius: 0, marginBottom: 16, background: `${ACCENT}0d` }}>{t.badge}</span>
          <h1 style={{ fontSize: "clamp(28px, 4vw, 42px)", fontWeight: 600, lineHeight: 1.15, color: "#1a1a1a", margin: "0 0 12px" }}>{t.titlePre} <span style={{ color: ACCENT }}>{t.titleHl}</span></h1>
          <p style={{ fontSize: 15, color: "#666", maxWidth: 540, margin: "0 auto", lineHeight: 1.6 }}>{t.intro}</p>
        </div>

        <div style={{ marginBottom: 16, padding: "12px 16px", background: "rgba(200,85,61,0.08)", border: "1px solid rgba(200,85,61,0.25)", borderRadius: 0, fontSize: 13, color: "#7a3a2a", lineHeight: 1.5 }}>
          <strong>{t.hintTitle}:</strong> {t.hintBody}
        </div>

        <div style={{ background: "#fff", borderRadius: 0, padding: "28px 24px", border: "1px solid #e5e5e5", display: "flex", flexDirection: "column", gap: 24 }}>
          <Section title={t.sectionAbsender}>
            <Field2>
              <div>
                <label style={lbl}>{t.salutation}</label>
                <select value={f.salutation} onChange={(e) => up("salutation", e.target.value as any)} style={inp}>
                  <option value="">—</option>
                  <option value="Herr">{t.salutationHerr}</option>
                  <option value="Frau">{t.salutationFrau}</option>
                </select>
              </div>
              <div></div>
            </Field2>
            <Field2>
              <div><label style={lbl}>{t.firstName} *</label><input value={f.first_name} onChange={(e) => up("first_name", e.target.value)} style={inp} /></div>
              <div><label style={lbl}>{t.lastName} *</label><input value={f.last_name} onChange={(e) => up("last_name", e.target.value)} style={inp} /></div>
            </Field2>

            {/* Zweite Person — optional, fuer Ehepaar/Konkubinat */}
            {!f.has_person2 ? (
              <button
                type="button"
                onClick={() => up("has_person2", true)}
                style={{ alignSelf: "flex-start", padding: "8px 14px", background: "transparent", color: ACCENT, border: `1px dashed ${ACCENT}66`, borderRadius: 0, fontSize: 13, cursor: "pointer", fontFamily: "inherit", marginTop: 4 }}
              >
                {t.addPerson}
              </button>
            ) : (
              <div style={{ background: "#fafafa", padding: 14, border: "1px solid #ececec", marginTop: 4 }}>
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 10 }}>
                  <span style={{ fontSize: 12, fontWeight: 600, color: "#555" }}>{t.person2Label}</span>
                  <button
                    type="button"
                    onClick={() => { up("has_person2", false); up("first_name2", ""); up("last_name2", ""); up("salutation2", ""); }}
                    style={{ padding: "4px 8px", background: "transparent", color: "#c00", border: "none", fontSize: 12, cursor: "pointer", fontFamily: "inherit" }}
                  >
                    {t.removePerson}
                  </button>
                </div>
                <Field2>
                  <div>
                    <label style={lbl}>{t.salutation}</label>
                    <select value={f.salutation2} onChange={(e) => up("salutation2", e.target.value as any)} style={inp}>
                      <option value="">—</option>
                      <option value="Herr">{t.salutationHerr}</option>
                      <option value="Frau">{t.salutationFrau}</option>
                    </select>
                  </div>
                  <div></div>
                </Field2>
                <Field2>
                  <div><label style={lbl}>{t.firstName} *</label><input value={f.first_name2} onChange={(e) => up("first_name2", e.target.value)} style={inp} /></div>
                  <div><label style={lbl}>{t.lastName} *</label><input value={f.last_name2} onChange={(e) => up("last_name2", e.target.value)} style={inp} /></div>
                </Field2>
              </div>
            )}

            <div><label style={lbl}>{t.addressStreet} *</label><input value={f.address_street} onChange={(e) => up("address_street", e.target.value)} style={inp} /></div>
            <Field2>
              <div><label style={lbl}>{t.addressPlz} *</label><input value={f.address_plz} onChange={(e) => up("address_plz", e.target.value)} style={inp} /></div>
              <div><label style={lbl}>{t.addressOrt} *</label><input value={f.address_ort} onChange={(e) => up("address_ort", e.target.value)} style={inp} /></div>
            </Field2>
          </Section>

          <Section title={t.sectionEmpfaenger}>
            <div><label style={lbl}>{t.bankName} *</label><input value={f.bank_name} onChange={(e) => up("bank_name", e.target.value)} style={inp} placeholder="z.B. Raiffeisen Möhlin" /></div>
            <div><label style={lbl}>{t.bankStreet} *</label><input value={f.bank_street} onChange={(e) => up("bank_street", e.target.value)} style={inp} /></div>
            <Field2>
              <div><label style={lbl}>{t.bankPlz} *</label><input value={f.bank_plz} onChange={(e) => up("bank_plz", e.target.value)} style={inp} /></div>
              <div><label style={lbl}>{t.bankOrt} *</label><input value={f.bank_ort} onChange={(e) => up("bank_ort", e.target.value)} style={inp} /></div>
            </Field2>
          </Section>

          <Section title={t.sectionDetails}>
            <div><label style={lbl}>{t.propertyAddress} *</label><input value={f.property_address} onChange={(e) => up("property_address", e.target.value)} style={inp} /></div>
            <div><label style={lbl}>{t.mortgageHolder} *</label><input value={f.mortgage_holder} onChange={(e) => up("mortgage_holder", e.target.value)} style={inp} /></div>
            <Field2>
              <div><label style={lbl}>{t.mortgageAmount} *</label><input value={f.mortgage_amount} onChange={(e) => up("mortgage_amount", formatChfInput(e.target.value))} placeholder={t.placeholderAmount} style={inp} inputMode="numeric" /></div>
              <div><label style={lbl}>{t.cityToday} *</label><input value={f.city_today} onChange={(e) => up("city_today", e.target.value)} placeholder="Möhlin" style={inp} /></div>
            </Field2>
          </Section>

          {error && <div style={{ padding: "10px 14px", background: "rgba(239,68,68,0.08)", color: "#c00", borderRadius: 0, fontSize: 13 }}>{error}</div>}

          <button type="button" onClick={generate} disabled={generating} style={{ padding: "14px 24px", background: ACCENT, color: "#fff", border: "none", borderRadius: 0, fontSize: 15, fontWeight: 600, cursor: generating ? "wait" : "pointer", fontFamily: "inherit", opacity: generating ? 0.7 : 1, marginTop: 8 }}>
            {generating ? t.generating : t.download}
          </button>
        </div>

        <p style={{ textAlign: "center", marginTop: 16, fontSize: 12, color: "#999" }}>
          <Link href="/" style={{ color: "#999", textDecoration: "none" }}>{t.homeBtn}</Link>
        </p>
      </div>
    </div>
  );
}

function Section({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div>
      <h3 style={{ fontSize: 13, fontWeight: 700, color: "#444", textTransform: "uppercase", letterSpacing: "0.05em", margin: "0 0 14px", paddingBottom: 8, borderBottom: "1px solid #f0ede6" }}>{title}</h3>
      <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>{children}</div>
    </div>
  );
}
function Field2({ children }: { children: React.ReactNode }) {
  return <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 10 }}>{children}</div>;
}

const lbl: React.CSSProperties = { display: "block", fontSize: 12, fontWeight: 600, color: "#444", marginBottom: 4 };
const inp: React.CSSProperties = { width: "100%", padding: "10px 12px", fontSize: 16, border: "1px solid #ddd", borderRadius: 0, fontFamily: "inherit", background: "#fff", boxSizing: "border-box" };
