"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import { useI18n } from "@/i18n/context";
import VorlagenDownloadBlock from "@/components/VorlagenDownloadBlock";

type Lang = "de" | "en";

const COPY = {
  de: {
    badge: "Eigenheimkauf",
    titlePre: "Planen Sie Ihren",
    titleHl: "Liegenschaftskauf",
    progress: "Frage {current} von {total}",
    next: "Weiter",
    back: "← Zurück",
    qKanton: "In welchem Kanton befindet sich Ihre Wunschimmobilie?",
    selectKanton: "Kanton wählen…",
    qObjektart: "Welche Art von Objekt soll es werden?",
    optEfh: "Einfamilienhaus",
    optEfhDesc: "Reihen-, Doppel- oder freistehend",
    optStwe: "Eigentumswohnung (STWE)",
    optStweDesc: "Stockwerkeigentum",
    opt2fh: "Zweifamilienhaus",
    opt2fhDesc: "Mehrfamilien mit 2 Wohneinheiten",
    qStatus: "Wie ist der Status des Objekts?",
    optBestehend: "Bestehende Liegenschaft",
    optBestehendDesc: "Wiederverkauf oder bestehender Bau",
    optNeubau: "Neubau",
    optNeubauDesc: "In Planung oder im Bau",
    qTaetigkeit: "Welche Tätigkeit trifft auf Sie zu?",
    optAngestellt: "Angestellt",
    optSelbstaendig: "Selbständig",
    optPensioniert: "Pensioniert",
    qContact: "Ihre Kontaktdaten",
    qContactDesc: "Damit wir Ihnen die Bestätigung und Unterlagen-Checkliste zustellen können.",
    firstName: "Vorname",
    lastName: "Nachname",
    email: "E-Mail",
    phone: "Telefon (optional)",
    privacy: "Mit dem Absenden akzeptieren Sie unsere Datenschutzerklärung.",
    submit: "Beratungstermin anfragen",
    submitting: "Wird gesendet…",
    successTitle: "Vielen Dank!",
    successDesc:
      "Da ein Neukauf viele Themen umfasst, ist ein Termin der nächste Schritt. Buchen Sie jetzt Ihr kostenloses Erstgespräch — bequem von zu Hause aus.",
    successCheckEmail: "In Kürze erhalten Sie eine E-Mail mit Ihrer persönlichen Unterlagen-Checkliste.",
    successCalendarBtn: "Termin jetzt buchen →",
    successHomeBtn: "← Zur Startseite",
    fieldRequired: "Pflichtfeld",
    invalidEmail: "Bitte gültige E-Mail-Adresse eingeben",
    serverError: "Beim Senden ist ein Fehler aufgetreten. Bitte versuchen Sie es erneut.",
  },
  en: {
    badge: "Property purchase",
    titlePre: "Plan your",
    titleHl: "property purchase",
    progress: "Question {current} of {total}",
    next: "Next",
    back: "← Back",
    qKanton: "In which canton is your desired property located?",
    selectKanton: "Select canton…",
    qObjektart: "What type of property?",
    optEfh: "Single-family home",
    optEfhDesc: "Terraced, semi-detached or detached",
    optStwe: "Condominium (STWE)",
    optStweDesc: "Strata-titled apartment",
    opt2fh: "Two-family home",
    opt2fhDesc: "Multi-family with 2 units",
    qStatus: "What is the status of the property?",
    optBestehend: "Existing property",
    optBestehendDesc: "Resale or existing build",
    optNeubau: "New build",
    optNeubauDesc: "In planning or under construction",
    qTaetigkeit: "What is your employment situation?",
    optAngestellt: "Employed",
    optSelbstaendig: "Self-employed",
    optPensioniert: "Retired",
    qContact: "Your contact details",
    qContactDesc: "So we can send you the confirmation and document checklist.",
    firstName: "First name",
    lastName: "Last name",
    email: "Email",
    phone: "Phone (optional)",
    privacy: "By submitting, you accept our privacy policy.",
    submit: "Request consultation",
    submitting: "Sending…",
    successTitle: "Thank you!",
    successDesc:
      "Since a purchase involves many topics, a meeting is the next step. Book your free initial consultation — conveniently from home.",
    successCheckEmail: "Shortly, you will receive an email with your personal document checklist.",
    successCalendarBtn: "Book appointment now →",
    successHomeBtn: "← Back to homepage",
    fieldRequired: "Required",
    invalidEmail: "Please enter a valid email address",
    serverError: "An error occurred while sending. Please try again.",
  },
} as const;

const KANTONE = [
  ["AG", "Aargau"], ["AI", "Appenzell Innerrhoden"], ["AR", "Appenzell Ausserrhoden"],
  ["BE", "Bern"], ["BL", "Basel-Landschaft"], ["BS", "Basel-Stadt"],
  ["FR", "Freiburg / Fribourg"], ["GE", "Genf / Genève"], ["GL", "Glarus"],
  ["GR", "Graubünden"], ["JU", "Jura"], ["LU", "Luzern"], ["NE", "Neuenburg / Neuchâtel"],
  ["NW", "Nidwalden"], ["OW", "Obwalden"], ["SG", "St. Gallen"], ["SH", "Schaffhausen"],
  ["SO", "Solothurn"], ["SZ", "Schwyz"], ["TG", "Thurgau"], ["TI", "Tessin / Ticino"],
  ["UR", "Uri"], ["VD", "Waadt / Vaud"], ["VS", "Wallis / Valais"],
  ["ZG", "Zug"], ["ZH", "Zürich"],
] as const;

interface Answers {
  kanton: string;
  objektart: "efh" | "stwe" | "2fh" | "";
  status: "bestehend" | "neubau" | "";
  taetigkeit: "angestellt" | "selbstaendig" | "pensioniert" | "";
  first_name: string; last_name: string; email: string; phone: string;
}

const init: Answers = { kanton: "", objektart: "", status: "", taetigkeit: "", first_name: "", last_name: "", email: "", phone: "" };
type StepKey = "kanton" | "objektart" | "status" | "taetigkeit" | "contact" | "success";
const FLOW: StepKey[] = ["kanton", "objektart", "status", "taetigkeit", "contact"];
const ACCENT = "#c8553d";

export default function NeukaufForm({ initialLang }: { initialLang: Lang }) {
  const { lang: ctxLang } = useI18n();
  const lang: Lang = (ctxLang as Lang) || initialLang;
  const t = COPY[lang];

  const [step, setStep] = useState<StepKey>("kanton");
  const [a, setA] = useState<Answers>(init);
  const [error, setError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);

  function up<K extends keyof Answers>(k: K, v: Answers[K]) { setA((p) => ({ ...p, [k]: v })); setError(null); }
  const idx = FLOW.indexOf(step);
  const total = FLOW.length;
  const pct = step === "success" ? 100 : Math.round(((idx + 1) / total) * 100);

  function next() {
    setError(null);
    switch (step) {
      case "kanton": if (!a.kanton) { setError(t.fieldRequired); return; } break;
      case "objektart": if (!a.objektart) { setError(t.fieldRequired); return; } break;
      case "status": if (!a.status) { setError(t.fieldRequired); return; } break;
      case "taetigkeit": if (!a.taetigkeit) { setError(t.fieldRequired); return; } break;
    }
    const n = FLOW[idx + 1];
    if (n) setStep(n);
  }
  function back() { if (idx > 0) setStep(FLOW[idx - 1]); }

  async function submit() {
    if (!a.first_name || !a.last_name || !a.email) { setError(t.fieldRequired); return; }
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(a.email)) { setError(t.invalidEmail); return; }
    setSubmitting(true); setError(null);
    try {
      const res = await fetch("/api/public/neukauf", {
        method: "POST", headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ ...a, lang }),
      });
      if (!res.ok) { const j = await res.json().catch(() => ({})); throw new Error(j.error || t.serverError); }
      setStep("success");
    } catch (e: any) { setError(e.message || t.serverError); } finally { setSubmitting(false); }
  }

  return (
    <div style={{ background: "#f7f5f2", minHeight: "calc(100vh - 200px)", padding: "60px 20px" }}>
      <div style={{ maxWidth: 720, margin: "0 auto" }}>
        {step !== "success" && (
          <>
            <div style={{ textAlign: "center", marginBottom: 30 }}>
              <span style={{ display: "inline-block", padding: "5px 14px", fontSize: 11, fontWeight: 600, letterSpacing: "0.12em", textTransform: "uppercase", color: ACCENT, border: `1px solid ${ACCENT}66`, borderRadius: 0, marginBottom: 16, background: `${ACCENT}0d` }}>{t.badge}</span>
              <h1 style={{ fontSize: "clamp(28px, 4vw, 42px)", fontWeight: 600, lineHeight: 1.15, color: "#1a1a1a", margin: 0 }}>{t.titlePre} <span style={{ color: ACCENT }}>{t.titleHl}</span></h1>
            </div>
            <div style={{ marginBottom: 24 }}>
              <div style={{ display: "flex", justifyContent: "space-between", fontSize: 12, color: "#888", marginBottom: 6 }}>
                <span>{t.progress.replace("{current}", String(idx + 1)).replace("{total}", String(total))}</span>
                <span>{pct}%</span>
              </div>
              <div style={{ height: 6, background: "#e5e5e5", borderRadius: 0, overflow: "hidden" }}>
                <div style={{ height: "100%", width: `${pct}%`, background: ACCENT, transition: "width 0.3s" }} />
              </div>
            </div>
          </>
        )}

        <div style={{ background: "#fff", borderRadius: 0, padding: "32px 28px", border: "1px solid #e5e5e5" }}>
          {step === "kanton" && <SelectStep title={t.qKanton} value={a.kanton} setValue={(v) => up("kanton", v)} placeholder={t.selectKanton} options={KANTONE.map(([c, n]) => ({ val: c, label: n }))} />}
          {step === "objektart" && <RadioStep title={t.qObjektart} value={a.objektart} setValue={(v) => up("objektart", v as any)} options={[
            { val: "efh", label: t.optEfh, desc: t.optEfhDesc },
            { val: "stwe", label: t.optStwe, desc: t.optStweDesc },
            { val: "2fh", label: t.opt2fh, desc: t.opt2fhDesc },
          ]} />}
          {step === "status" && <RadioStep title={t.qStatus} value={a.status} setValue={(v) => up("status", v as any)} options={[
            { val: "bestehend", label: t.optBestehend, desc: t.optBestehendDesc },
            { val: "neubau", label: t.optNeubau, desc: t.optNeubauDesc },
          ]} />}
          {step === "taetigkeit" && <RadioStep title={t.qTaetigkeit} value={a.taetigkeit} setValue={(v) => up("taetigkeit", v as any)} options={[
            { val: "angestellt", label: t.optAngestellt },
            { val: "selbstaendig", label: t.optSelbstaendig },
            { val: "pensioniert", label: t.optPensioniert },
          ]} />}
          {step === "contact" && <ContactStep t={t} a={a} setA={setA} />}
          {step === "success" && <SuccessStep t={t} lang={lang} />}

          {error && <div style={{ marginTop: 16, padding: "10px 14px", background: "rgba(239,68,68,0.08)", color: "#c00", borderRadius: 0, fontSize: 13 }}>{error}</div>}

          {step !== "success" && (
            <div style={{ display: "flex", justifyContent: "space-between", marginTop: 28, gap: 12 }}>
              {idx > 0 ? <button type="button" onClick={back} style={{ padding: "10px 16px", background: "transparent", color: "#666", border: "1px solid #ddd", borderRadius: 0, fontSize: 14, cursor: "pointer", fontFamily: "inherit" }}>{t.back}</button> : <div />}
              {step === "contact"
                ? <button type="button" onClick={submit} disabled={submitting} style={{ padding: "12px 24px", background: ACCENT, color: "#fff", border: "none", borderRadius: 0, fontSize: 14, fontWeight: 600, cursor: submitting ? "wait" : "pointer", fontFamily: "inherit", opacity: submitting ? 0.7 : 1 }}>{submitting ? t.submitting : t.submit}</button>
                : <button type="button" onClick={next} style={{ padding: "12px 24px", background: ACCENT, color: "#fff", border: "none", borderRadius: 0, fontSize: 14, fontWeight: 600, cursor: "pointer", fontFamily: "inherit" }}>{t.next}</button>
              }
            </div>
          )}
        </div>

        <p style={{ textAlign: "center", marginTop: 16, fontSize: 12, color: "#999" }}>
          <Link href="/" style={{ color: "#999", textDecoration: "none" }}>{t.successHomeBtn}</Link>
        </p>
      </div>
    </div>
  );
}

function StepHeader({ title, desc }: { title: string; desc?: string }) {
  return (
    <div style={{ marginBottom: 24 }}>
      <h2 style={{ fontSize: 22, fontWeight: 600, color: "#1a1a1a", margin: 0, lineHeight: 1.3 }}>{title}</h2>
      {desc && <p style={{ fontSize: 14, color: "#666", marginTop: 8, marginBottom: 0, lineHeight: 1.5 }}>{desc}</p>}
    </div>
  );
}
function SelectStep({ title, value, setValue, placeholder, options }: { title: string; value: string; setValue: (v: string) => void; placeholder: string; options: { val: string; label: string }[] }) {
  return (<><StepHeader title={title} /><select value={value} onChange={(e) => setValue(e.target.value)} style={{ ...inp, fontSize: 16 }}><option value="">{placeholder}</option>{options.map((o) => <option key={o.val} value={o.val}>{o.label}</option>)}</select></>);
}
function RadioStep({ title, value, setValue, options }: { title: string; value: string; setValue: (v: string) => void; options: { val: string; label: string; desc?: string }[] }) {
  return (<><StepHeader title={title} /><div style={{ display: "flex", flexDirection: "column", gap: 10 }}>{options.map((o) => { const active = value === o.val; return (
    <button key={o.val} type="button" onClick={() => setValue(o.val)} style={{ textAlign: "left", padding: "14px 16px", background: active ? `${ACCENT}0d` : "#fff", border: `2px solid ${active ? ACCENT : "#e5e5e5"}`, borderRadius: 0, cursor: "pointer", fontFamily: "inherit", transition: "all 0.15s" }}>
      <div style={{ fontSize: 15, fontWeight: 600, color: "#1a1a1a" }}>{o.label}</div>
      {o.desc && <div style={{ fontSize: 13, color: "#666", marginTop: 4 }}>{o.desc}</div>}
    </button>
  );})}</div></>);
}
function ContactStep({ t, a, setA }: { t: any; a: Answers; setA: (a: Answers) => void }) {
  return (<><StepHeader title={t.qContact} desc={t.qContactDesc} />
    <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 10, marginBottom: 10 }}>
      <div><label style={lbl}>{t.firstName}</label><input value={a.first_name} onChange={(e) => setA({ ...a, first_name: e.target.value })} style={inp} /></div>
      <div><label style={lbl}>{t.lastName}</label><input value={a.last_name} onChange={(e) => setA({ ...a, last_name: e.target.value })} style={inp} /></div>
    </div>
    <div style={{ marginBottom: 10 }}><label style={lbl}>{t.email}</label><input type="email" value={a.email} onChange={(e) => setA({ ...a, email: e.target.value })} style={inp} /></div>
    <div><label style={lbl}>{t.phone}</label><input type="tel" value={a.phone} onChange={(e) => setA({ ...a, phone: e.target.value })} style={inp} /></div>
    <p style={{ fontSize: 12, color: "#888", marginTop: 14, lineHeight: 1.5 }}>{t.privacy}</p></>);
}
function SuccessStep({ t, lang }: { t: any; lang: Lang }) {
  return (
    <div style={{ padding: "10px 0" }}>
      <div style={{ textAlign: "center" }}>
        <div style={{ width: 56, height: 56, borderRadius: 0, background: "#dcfce7", color: "#166534", display: "inline-flex", alignItems: "center", justifyContent: "center", fontSize: 28, marginBottom: 16 }}>✓</div>
        <h2 style={{ fontSize: 24, fontWeight: 600, color: "#1a1a1a", marginBottom: 12 }}>{t.successTitle}</h2>
        <p style={{ fontSize: 15, color: "#555", lineHeight: 1.7, maxWidth: 520, margin: "0 auto 12px" }}>{t.successDesc}</p>
        <p style={{ fontSize: 12, color: "#888", margin: "0 auto 24px", maxWidth: 480 }}>{t.successCheckEmail}</p>
        <div style={{ display: "flex", gap: 12, justifyContent: "center", flexWrap: "wrap" }}>
          <Link href="/termin" style={{ padding: "12px 24px", background: ACCENT, color: "#fff", borderRadius: 0, fontSize: 14, fontWeight: 600, textDecoration: "none" }}>{t.successCalendarBtn}</Link>
          <Link href="/" style={{ padding: "12px 24px", background: "#fff", color: "#666", border: "1px solid #ddd", borderRadius: 0, fontSize: 14, textDecoration: "none" }}>{t.successHomeBtn}</Link>
        </div>
      </div>

      {/* Vorlagen zum Download — Vollmacht etc., dynamisch aus DB */}
      <VorlagenDownloadBlock kategorie="neukauf" lang={lang} variant="card" />
    </div>
  );
}

const lbl: React.CSSProperties = { display: "block", fontSize: 12, fontWeight: 600, color: "#444", marginBottom: 4 };
const inp: React.CSSProperties = { width: "100%", padding: "10px 12px", fontSize: 16, border: "1px solid #ddd", borderRadius: 0, fontFamily: "inherit", background: "#fff", boxSizing: "border-box" };
