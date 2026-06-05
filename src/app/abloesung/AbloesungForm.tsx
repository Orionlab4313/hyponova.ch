"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import { useI18n } from "@/i18n/context";
import VorlagenDownloadBlock from "@/components/VorlagenDownloadBlock";

type Lang = "de" | "en";

const COPY = {
  de: {
    badge: "Hypothekarablösung",
    titlePre: "Vergleichen Sie",
    titleHl: "neue Offerten",
    intro:
      "In wenigen Minuten klären wir gemeinsam ab, ob eine Ablösung Ihrer Hypothek aktuell sinnvoll ist und welche Konditionen bei anderen Instituten möglich sind.",
    progress: "Frage {current} von {total}",
    next: "Weiter",
    back: "← Zurück",
    chf: "CHF",
    submit: "Anfrage absenden",
    submitting: "Wird gesendet…",
    addTranche: "Weitere Tranche hinzufügen",
    removeTranche: "Entfernen",
    qTranchen: "Hypothekartranchen",
    qTranchenDesc: "Tragen Sie alle Ihre aktuellen Tranchen ein. Wir prüfen automatisch, ob eine Ablösung möglich ist.",
    fieldBetrag: "Hypothek-Betrag",
    fieldModell: "Hypothekenmodell",
    fieldFaelligkeit: "Fälligkeitsdatum",
    saron: "SARON",
    festzins: "Festzinshypothek",
    variable: "Variable Hypothek",
    placeholderBetrag: "z.B. 500'000",
    sackgasseTitle: "Aktuelle Ablösung nicht möglich",
    sackgasseBody:
      "Leider kann Ihre Hypothek derzeit nicht abgelöst werden. Gerne stehen wir Ihnen bei der nächsten Verlängerung zur Verfügung. Wir zeigen Ihnen auf, wie Sie Ihre Hypothek optimal gestalten können, um künftig mehr Flexibilität zu gewinnen und Ihre Verhandlungsposition zu verbessern.",
    sackgasseCta: "Beratung buchen",
    sackgasseHome: "← Zurück zur Startseite",
    qKanton: "In welchem Kanton befindet sich Ihre Liegenschaft?",
    qKantonDesc: "Kanton der Liegenschaft, die abgelöst werden soll.",
    selectKanton: "Kanton wählen…",
    qObjektart: "Welche Art von Objekt ist Ihre Liegenschaft?",
    optEfh: "Einfamilienhaus",
    optEfhDesc: "Reihen-, Doppel- oder freistehend",
    optStwe: "Eigentumswohnung (STWE)",
    optStweDesc: "Stockwerkeigentum",
    opt2fh: "Zweifamilienhaus",
    opt2fhDesc: "Mehrfamilien mit 2 Wohneinheiten",
    qBewohnt: "Ist Ihre Liegenschaft selbstbewohnt?",
    optBewohnt100: "100% selbstbewohnt",
    optBewohnt100Desc: "Sie wohnen vollständig selbst darin",
    optBewohntMixed: "Ein Teil ist vermietet",
    optBewohntMixedDesc: "Z.B. Einliegerwohnung",
    qBaurecht: "Befindet sich Ihre Liegenschaft im Baurecht?",
    qBaurechtDesc: "Baurecht bedeutet, das Land gehört einem Dritten (z.B. Gemeinde, Stiftung).",
    yes: "Ja",
    no: "Nein",
    qTaetigkeit: "Welche Tätigkeit trifft auf Sie zu?",
    optAngestellt: "Angestellt",
    optSelbstaendig: "Selbständig",
    optPensioniert: "Pensioniert",
    qWeissModell: "Wissen Sie bereits, in welchem Modell und mit welcher Laufzeit Sie verlängern möchten?",
    optWeissModellJa: "Ja, ich habe eine konkrete Vorstellung",
    optWeissModellNein: "Nein, ich brauche Beratung",
    qModell: "In welchem Modell möchten Sie Ihre Hypothek verlängern?",
    optModellFestzins: "Festzinshypothek",
    optModellFestzinsDesc: "Fester Zinssatz über die ganze Laufzeit",
    optModellSaronRahmen: "SARON mit Rahmenlaufzeit",
    optModellSaronRahmenDesc: "Variabler Zins, gebunden an Rahmenlaufzeit",
    optModellSaronFrei: "SARON ohne Rahmenlaufzeit",
    optModellSaronFreiDesc: "Maximale Flexibilität",
    qLaufzeit: "Welche Laufzeit wünschen Sie?",
    qLaufzeitDesc: "In Jahren",
    selectLaufzeit: "Laufzeit wählen…",
    yearOne: "Jahr",
    yearMany: "Jahre",
    qEndPath: "Wie möchten Sie weiterfahren?",
    optEndOfferten: "Offerten-Vergleich von «HYPONOVA» erhalten",
    optEndOffertenDesc: "Wir vergleichen für Sie die besten Angebote und melden uns per E-Mail",
    optEndTermin: "Beratungstermin vereinbaren",
    optEndTerminDesc: "Persönliches Online-Gespräch mit Ihrem Hypothekenberater",
    qContact: "Ihre Kontaktdaten",
    qContactDesc:
      "Damit wir Ihnen die Ergebnisse und die Unterlagen-Checkliste zustellen können.",
    firstName: "Vorname",
    lastName: "Nachname",
    email: "E-Mail",
    phone: "Telefon (optional)",
    privacy:
      "Mit dem Absenden akzeptieren Sie unsere Datenschutzerklärung.",
    successTitle: "Vielen Dank!",
    successSubmittedDesc:
      "Wir haben Ihre Anfrage erhalten. In Kürze erhalten Sie eine E-Mail mit Ihrer persönlichen Unterlagen-Checkliste und einem sicheren Link, über den Sie Ihre Dokumente hochladen können.",
    successTerminDesc:
      "Buchen Sie jetzt Ihren persönlichen Beratungstermin - bequem von zu Hause aus.",
    successCheckEmail: "Bitte prüfen Sie auch den Spam-Ordner, falls keine E-Mail eintrifft.",
    successCalendarBtn: "Termin jetzt buchen →",
    successHomeBtn: "← Zur Startseite",
    nextStepTitle: "Nächster Schritt: Vorsorgliche Kündigung",
    nextStepBody: "Sobald wir die besten Konditionen für Sie haben, müssen Sie Ihre aktuelle Hypothek vorsorglich kündigen. Erstellen Sie das Kündigungsschreiben in 2 Minuten als PDF, bereit zum Versand per Einschreiben.",
    nextStepCta: "Kündigungsvorlage erstellen →",
    fieldRequired: "Pflichtfeld",
    invalidEmail: "Bitte gültige E-Mail-Adresse eingeben",
    invalidBetrag: "Betrag muss grösser als 0 sein",
    invalidDate: "Bitte ein gültiges Fälligkeitsdatum eingeben",
    minOneTranche: "Bitte mindestens eine Hypothekartranche eingeben",
    serverError: "Beim Senden ist ein Fehler aufgetreten. Bitte versuchen Sie es erneut.",
  },
  en: {
    badge: "Mortgage refinancing",
    titlePre: "Compare",
    titleHl: "new offers",
    intro:
      "In a few minutes, we'll work out together whether refinancing your mortgage makes sense right now and what conditions are possible at other institutions.",
    progress: "Question {current} of {total}",
    next: "Next",
    back: "← Back",
    chf: "CHF",
    submit: "Submit request",
    submitting: "Sending…",
    addTranche: "Add another tranche",
    removeTranche: "Remove",
    qTranchen: "Mortgage tranches",
    qTranchenDesc: "Enter all your current tranches. We automatically check whether refinancing is possible.",
    fieldBetrag: "Mortgage amount",
    fieldModell: "Mortgage type",
    fieldFaelligkeit: "Maturity date",
    saron: "SARON",
    festzins: "Fixed-rate mortgage",
    variable: "Variable mortgage",
    placeholderBetrag: "e.g. 500'000",
    sackgasseTitle: "Refinancing currently not possible",
    sackgasseBody:
      "Unfortunately, your mortgage cannot currently be refinanced. We'd be happy to assist you with your next renewal. We'll show you how to optimally structure your mortgage to gain more flexibility and improve your negotiating position in the future.",
    sackgasseCta: "Book consultation",
    sackgasseHome: "← Back to homepage",
    qKanton: "In which canton is your property located?",
    qKantonDesc: "Canton of the property to be refinanced.",
    selectKanton: "Select canton…",
    qObjektart: "What type of property do you own?",
    optEfh: "Single-family home",
    optEfhDesc: "Terraced, semi-detached or detached",
    optStwe: "Condominium (STWE)",
    optStweDesc: "Strata-titled apartment",
    opt2fh: "Two-family home",
    opt2fhDesc: "Multi-family with 2 units",
    qBewohnt: "Is your property owner-occupied?",
    optBewohnt100: "100% owner-occupied",
    optBewohnt100Desc: "You live in it entirely",
    optBewohntMixed: "Partially rented out",
    optBewohntMixedDesc: "E.g. granny flat",
    qBaurecht: "Is your property on leased land (Baurecht)?",
    qBaurechtDesc: "Baurecht means the land belongs to a third party (e.g. municipality, foundation).",
    yes: "Yes",
    no: "No",
    qTaetigkeit: "What is your employment situation?",
    optAngestellt: "Employed",
    optSelbstaendig: "Self-employed",
    optPensioniert: "Retired",
    qWeissModell: "Do you already know which model and term you want for your renewal?",
    optWeissModellJa: "Yes, I have a clear idea",
    optWeissModellNein: "No, I need advice",
    qModell: "Which model do you want for your renewal?",
    optModellFestzins: "Fixed-rate mortgage",
    optModellFestzinsDesc: "Fixed interest rate over the entire term",
    optModellSaronRahmen: "SARON with framework term",
    optModellSaronRahmenDesc: "Variable rate, bound to framework term",
    optModellSaronFrei: "SARON without framework term",
    optModellSaronFreiDesc: "Maximum flexibility",
    qLaufzeit: "What term would you like?",
    qLaufzeitDesc: "In years",
    selectLaufzeit: "Select term…",
    yearOne: "year",
    yearMany: "years",
    qEndPath: "How would you like to proceed?",
    optEndOfferten: "Receive «HYPONOVA» offer comparison",
    optEndOffertenDesc: "We compare the best offers for you and contact you via email",
    optEndTermin: "Book a consultation appointment",
    optEndTerminDesc: "Personal online meeting with your mortgage advisor",
    qContact: "Your contact details",
    qContactDesc: "So we can send you the results and the document checklist.",
    firstName: "First name",
    lastName: "Last name",
    email: "Email",
    phone: "Phone (optional)",
    privacy: "By submitting, you accept our privacy policy.",
    successTitle: "Thank you!",
    successSubmittedDesc:
      "We have received your request. Shortly, you will receive an email with your personal document checklist and a secure link to upload your documents.",
    successTerminDesc:
      "Book your personal consultation appointment now, conveniently from home.",
    successCheckEmail: "Please also check your spam folder if no email arrives.",
    successCalendarBtn: "Book appointment now →",
    successHomeBtn: "← Back to homepage",
    nextStepTitle: "Next step: Precautionary cancellation",
    nextStepBody: "Once we have the best conditions for you, you'll need to give precautionary notice on your current mortgage. Generate the cancellation letter in 2 minutes as a PDF, ready to send by registered mail.",
    nextStepCta: "Create cancellation template →",
    fieldRequired: "Required",
    invalidEmail: "Please enter a valid email address",
    invalidBetrag: "Amount must be greater than 0",
    invalidDate: "Please enter a valid maturity date",
    minOneTranche: "Please enter at least one mortgage tranche",
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

interface Tranche {
  betrag: string;
  modell: "saron" | "festzins" | "variable" | "";
  faelligkeit: string;
}

interface Answers {
  tranchen: Tranche[];
  kanton: string;
  objektart: "efh" | "stwe" | "2fh" | "";
  bewohnt: "100" | "teilvermietet" | "";
  baurecht: boolean | null;
  taetigkeit: "angestellt" | "selbstaendig" | "pensioniert" | "";
  weiss_modell: boolean | null;
  modell: "festzins" | "saron-rahmen" | "saron-frei" | "";
  laufzeit_jahre: number | null;
  end_path: "offerten" | "termin" | "";
  first_name: string;
  last_name: string;
  email: string;
  phone: string;
}

const initialAnswers: Answers = {
  tranchen: [{ betrag: "", modell: "", faelligkeit: "" }],
  kanton: "", objektart: "", bewohnt: "", baurecht: null,
  taetigkeit: "", weiss_modell: null, modell: "", laufzeit_jahre: null,
  end_path: "", first_name: "", last_name: "", email: "", phone: "",
};

type StepKey =
  | "tranchen" | "sackgasse" | "kanton" | "objektart" | "bewohnt" | "baurecht"
  | "taetigkeit" | "weiss_modell" | "modell" | "laufzeit" | "end_path"
  | "contact" | "success";

/**
 * Schweizer CHF-Format mit Apostroph als Tausendertrenner.
 * Akzeptiert beliebigen User-Input und gibt formatierten String zurueck.
 * "300000" -> "300'000"  /  "1500000" -> "1'500'000"
 */
function formatChfInput(s: string): string {
  const digits = s.replace(/[^0-9]/g, "");
  if (!digits) return "";
  return digits.replace(/\B(?=(\d{3})+(?!\d))/g, "'");
}

function isAbloesbarLocal(tranchen: Tranche[]): boolean {
  if (!tranchen || tranchen.length === 0) return false;
  const now = new Date();
  const cutoff = new Date(now.getFullYear() + 2, now.getMonth(), now.getDate());
  // Alle Tranchen muessen innerhalb 2 Jahren faellig sein (sonst lohnt sich
  // die Abloesung wegen Vorfaelligkeitsentschaedigung nicht). Variable
  // Tranchen sind jederzeit kuendbar.
  return tranchen.every((t) => {
    if (t.modell === "variable") return true;
    if (!t.faelligkeit) return false;
    const d = new Date(t.faelligkeit);
    if (isNaN(d.getTime())) return false;
    return d <= cutoff;
  });
}

const ACCENT = "#c8553d";

export default function AbloesungForm({ initialLang }: { initialLang: Lang }) {
  const { lang: ctxLang } = useI18n();
  const lang: Lang = (ctxLang as Lang) || initialLang;
  const t = COPY[lang];

  const [step, setStep] = useState<StepKey>("tranchen");
  const [answers, setAnswers] = useState<Answers>(initialAnswers);
  const [error, setError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);

  function up<K extends keyof Answers>(k: K, v: Answers[K]) {
    setAnswers((p) => ({ ...p, [k]: v }));
    setError(null);
  }

  // Step-Reihenfolge dynamisch
  const flow = useMemo<StepKey[]>(() => {
    const list: StepKey[] = ["tranchen"];
    if (!isAbloesbarLocal(answers.tranchen)) {
      // Sackgasse als virtueller Endpunkt, nur reachable nach explizitem Submit
    }
    list.push("kanton", "objektart", "bewohnt", "baurecht", "taetigkeit", "weiss_modell");
    if (answers.weiss_modell === true) {
      list.push("modell");
      if (answers.modell === "festzins" || answers.modell === "saron-rahmen") {
        list.push("laufzeit");
      }
    }
    list.push("end_path", "contact");
    return list;
  }, [answers.tranchen, answers.weiss_modell, answers.modell]);

  const currentIndex = flow.indexOf(step);
  const total = flow.length;
  const progressPct = step === "success" || step === "sackgasse"
    ? 100
    : currentIndex >= 0
    ? Math.round(((currentIndex + 1) / total) * 100)
    : 0;

  function goNext() {
    setError(null);
    // Validation pro Step
    switch (step) {
      case "tranchen": {
        const valid = answers.tranchen.every(
          (tr) => tr.betrag && Number(tr.betrag.replace(/['\s]/g, "")) > 0 && tr.modell && (tr.modell === "variable" || tr.faelligkeit)
        );
        if (!valid) { setError(t.invalidBetrag); return; }
        if (!isAbloesbarLocal(answers.tranchen)) {
          setStep("sackgasse"); return;
        }
        setStep("kanton"); return;
      }
      case "kanton": if (!answers.kanton) { setError(t.fieldRequired); return; } break;
      case "objektart": if (!answers.objektart) { setError(t.fieldRequired); return; } break;
      case "bewohnt": if (!answers.bewohnt) { setError(t.fieldRequired); return; } break;
      case "baurecht": if (answers.baurecht === null) { setError(t.fieldRequired); return; } break;
      case "taetigkeit": if (!answers.taetigkeit) { setError(t.fieldRequired); return; } break;
      case "weiss_modell":
        if (answers.weiss_modell === null) { setError(t.fieldRequired); return; }
        break;
      case "modell": if (!answers.modell) { setError(t.fieldRequired); return; } break;
      case "laufzeit": if (!answers.laufzeit_jahre) { setError(t.fieldRequired); return; } break;
      case "end_path": if (!answers.end_path) { setError(t.fieldRequired); return; } break;
    }
    const next = flow[currentIndex + 1];
    if (next) setStep(next);
  }

  function goBack() {
    if (step === "sackgasse") { setStep("tranchen"); return; }
    if (currentIndex > 0) setStep(flow[currentIndex - 1]);
  }

  async function submitAll() {
    if (!answers.first_name.trim() || !answers.last_name.trim() || !answers.email.trim()) {
      setError(t.fieldRequired); return;
    }
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(answers.email)) {
      setError(t.invalidEmail); return;
    }
    setSubmitting(true);
    setError(null);
    try {
      const res = await fetch("/api/public/abloesung", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          ...answers,
          tranchen: answers.tranchen.map((tr) => ({
            ...tr,
            betrag: Number(tr.betrag.replace(/['\s]/g, "")),
          })),
          lang,
        }),
      });
      if (!res.ok) {
        const j = await res.json().catch(() => ({}));
        throw new Error(j.error || t.serverError);
      }
      setStep("success");
    } catch (err: any) {
      setError(err.message || t.serverError);
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <div style={{ background: "#f7f5f2", minHeight: "calc(100vh - 200px)", padding: "60px 20px" }}>
      <div style={{ maxWidth: 720, margin: "0 auto" }}>
        {step !== "success" && step !== "sackgasse" && (
          <>
            <div style={{ textAlign: "center", marginBottom: 30 }}>
              <span style={{ display: "inline-block", padding: "5px 14px", fontSize: 11, fontWeight: 600, letterSpacing: "0.12em", textTransform: "uppercase", color: ACCENT, border: `1px solid ${ACCENT}66`, borderRadius: 0, marginBottom: 16, background: `${ACCENT}0d` }}>
                {t.badge}
              </span>
              <h1 style={{ fontSize: "clamp(28px, 4vw, 42px)", fontWeight: 600, lineHeight: 1.15, color: "#1a1a1a", margin: 0 }}>
                {t.titlePre} <span style={{ color: ACCENT }}>{t.titleHl}</span>
              </h1>
            </div>
            <div style={{ marginBottom: 24 }}>
              <div style={{ display: "flex", justifyContent: "space-between", fontSize: 12, color: "#888", marginBottom: 6 }}>
                <span>{t.progress.replace("{current}", String(currentIndex + 1)).replace("{total}", String(total))}</span>
                <span>{progressPct}%</span>
              </div>
              <div style={{ height: 6, background: "#e5e5e5", borderRadius: 0, overflow: "hidden" }}>
                <div style={{ height: "100%", width: `${progressPct}%`, background: ACCENT, transition: "width 0.3s" }} />
              </div>
            </div>
          </>
        )}

        <div style={{ background: "#fff", borderRadius: 0, padding: "32px 28px", border: "1px solid #e5e5e5", boxShadow: "0 1px 3px rgba(0,0,0,0.04)" }}>
          {step === "tranchen" && <TranchenStep t={t} answers={answers} setAnswers={setAnswers} />}
          {step === "sackgasse" && <SackgasseStep t={t} />}
          {step === "kanton" && <KantonStep t={t} value={answers.kanton} setValue={(v) => up("kanton", v)} />}
          {step === "objektart" && <RadioStep t={t} title={t.qObjektart} value={answers.objektart} setValue={(v) => up("objektart", v as any)} options={[
            { val: "efh", label: t.optEfh, desc: t.optEfhDesc },
            { val: "stwe", label: t.optStwe, desc: t.optStweDesc },
            { val: "2fh", label: t.opt2fh, desc: t.opt2fhDesc },
          ]} />}
          {step === "bewohnt" && <RadioStep t={t} title={t.qBewohnt} value={answers.bewohnt} setValue={(v) => up("bewohnt", v as any)} options={[
            { val: "100", label: t.optBewohnt100, desc: t.optBewohnt100Desc },
            { val: "teilvermietet", label: t.optBewohntMixed, desc: t.optBewohntMixedDesc },
          ]} />}
          {step === "baurecht" && <RadioStep t={t} title={t.qBaurecht} desc={t.qBaurechtDesc} value={answers.baurecht === null ? "" : answers.baurecht ? "yes" : "no"} setValue={(v) => up("baurecht", v === "yes")} options={[
            { val: "yes", label: t.yes },
            { val: "no", label: t.no },
          ]} />}
          {step === "taetigkeit" && <RadioStep t={t} title={t.qTaetigkeit} value={answers.taetigkeit} setValue={(v) => up("taetigkeit", v as any)} options={[
            { val: "angestellt", label: t.optAngestellt },
            { val: "selbstaendig", label: t.optSelbstaendig },
            { val: "pensioniert", label: t.optPensioniert },
          ]} />}
          {step === "weiss_modell" && <RadioStep t={t} title={t.qWeissModell} value={answers.weiss_modell === null ? "" : answers.weiss_modell ? "yes" : "no"} setValue={(v) => up("weiss_modell", v === "yes")} options={[
            { val: "yes", label: t.optWeissModellJa },
            { val: "no", label: t.optWeissModellNein },
          ]} />}
          {step === "modell" && <RadioStep t={t} title={t.qModell} value={answers.modell} setValue={(v) => up("modell", v as any)} options={[
            { val: "festzins", label: t.optModellFestzins, desc: t.optModellFestzinsDesc },
            { val: "saron-rahmen", label: t.optModellSaronRahmen, desc: t.optModellSaronRahmenDesc },
            { val: "saron-frei", label: t.optModellSaronFrei, desc: t.optModellSaronFreiDesc },
          ]} />}
          {step === "laufzeit" && <LaufzeitStep t={t} value={answers.laufzeit_jahre} setValue={(v) => up("laufzeit_jahre", v)} max={answers.modell === "saron-rahmen" ? 5 : 15} />}
          {step === "end_path" && <RadioStep t={t} title={t.qEndPath} value={answers.end_path} setValue={(v) => up("end_path", v as any)} options={[
            { val: "offerten", label: t.optEndOfferten, desc: t.optEndOffertenDesc },
            { val: "termin", label: t.optEndTermin, desc: t.optEndTerminDesc },
          ]} />}
          {step === "contact" && <ContactStep t={t} answers={answers} setAnswers={setAnswers} />}
          {step === "success" && <SuccessStep t={t} endPath={answers.end_path} lang={lang} />}

          {error && (
            <div style={{ marginTop: 16, padding: "10px 14px", background: "rgba(239,68,68,0.08)", color: "#c00", borderRadius: 0, fontSize: 13 }}>{error}</div>
          )}

          {step !== "success" && step !== "sackgasse" && (
            <div style={{ display: "flex", justifyContent: "space-between", marginTop: 28, gap: 12 }}>
              {currentIndex > 0 ? (
                <button type="button" onClick={goBack} style={{ padding: "10px 16px", background: "transparent", color: "#666", border: "1px solid #ddd", borderRadius: 0, fontSize: 14, cursor: "pointer", fontFamily: "inherit" }}>{t.back}</button>
              ) : <div />}
              {step === "contact" ? (
                <button type="button" onClick={submitAll} disabled={submitting} style={{ padding: "12px 24px", background: ACCENT, color: "#fff", border: "none", borderRadius: 0, fontSize: 14, fontWeight: 600, cursor: submitting ? "wait" : "pointer", fontFamily: "inherit", opacity: submitting ? 0.7 : 1 }}>
                  {submitting ? t.submitting : t.submit}
                </button>
              ) : (
                <button type="button" onClick={goNext} style={{ padding: "12px 24px", background: ACCENT, color: "#fff", border: "none", borderRadius: 0, fontSize: 14, fontWeight: 600, cursor: "pointer", fontFamily: "inherit" }}>{t.next}</button>
              )}
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

// === STEP COMPONENTS ===

function StepHeader({ title, desc }: { title: string; desc?: string }) {
  return (
    <div style={{ marginBottom: 24 }}>
      <h2 style={{ fontSize: 22, fontWeight: 600, color: "#1a1a1a", margin: 0, lineHeight: 1.3 }}>{title}</h2>
      {desc && <p style={{ fontSize: 14, color: "#666", marginTop: 8, marginBottom: 0, lineHeight: 1.5 }}>{desc}</p>}
    </div>
  );
}

function TranchenStep({ t, answers, setAnswers }: { t: any; answers: Answers; setAnswers: (a: Answers) => void }) {
  function update(idx: number, k: keyof Tranche, v: string) {
    const next = [...answers.tranchen];
    next[idx] = { ...next[idx], [k]: v };
    setAnswers({ ...answers, tranchen: next });
  }
  function addRow() {
    setAnswers({ ...answers, tranchen: [...answers.tranchen, { betrag: "", modell: "", faelligkeit: "" }] });
  }
  function removeRow(idx: number) {
    setAnswers({ ...answers, tranchen: answers.tranchen.filter((_, i) => i !== idx) });
  }
  return (
    <>
      <StepHeader title={t.qTranchen} desc={t.qTranchenDesc} />
      <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
        {answers.tranchen.map((tr, i) => (
          <div key={i} style={{ background: "#fafafa", borderRadius: 0, padding: 16, border: "1px solid #ececec" }}>
            <div className="tranche-grid">
              <div>
                <label style={lbl}>{t.fieldBetrag} ({t.chf})</label>
                <input value={tr.betrag} onChange={(e) => update(i, "betrag", formatChfInput(e.target.value))} placeholder={t.placeholderBetrag} style={inp} inputMode="numeric" />
              </div>
              <div>
                <label style={lbl}>{t.fieldModell}</label>
                <select value={tr.modell} onChange={(e) => update(i, "modell", e.target.value)} style={inp}>
                  <option value="">,</option>
                  <option value="festzins">{t.festzins}</option>
                  <option value="saron">{t.saron}</option>
                  <option value="variable">{t.variable}</option>
                </select>
              </div>
              <div>
                <label style={lbl}>{t.fieldFaelligkeit}</label>
                <input type="date" value={tr.faelligkeit} onChange={(e) => update(i, "faelligkeit", e.target.value)} className="tranche-date" style={inp} disabled={tr.modell === "variable"} />
              </div>
            </div>
            {answers.tranchen.length > 1 && (
              <button type="button" onClick={() => removeRow(i)} style={{ marginTop: 8, padding: "4px 10px", background: "transparent", color: "#c00", border: "none", fontSize: 12, cursor: "pointer", fontFamily: "inherit" }}>× {t.removeTranche}</button>
            )}
          </div>
        ))}
      </div>
      <button type="button" onClick={addRow} style={{ marginTop: 12, padding: "8px 14px", background: "transparent", color: ACCENT, border: `1px dashed ${ACCENT}66`, borderRadius: 0, fontSize: 13, cursor: "pointer", fontFamily: "inherit", width: "100%" }}>+ {t.addTranche}</button>
      <style>{`
        .tranche-grid {
          display: grid;
          grid-template-columns: 1fr 1fr 1fr;
          gap: 10px;
        }
        @media (max-width: 720px) {
          .tranche-grid {
            grid-template-columns: 1fr;
            gap: 12px;
          }
        }
        /* iOS Safari rendert <input type="date"> rechtsbuendig wenn leer.
           Wir zwingen Linksausrichtung damit der Inhalt links steht und
           der Calendar-Picker rechts klein bleibt. */
        .tranche-date {
          text-align: left;
          -webkit-appearance: none;
          appearance: none;
          min-height: 44px;
        }
        .tranche-date::-webkit-date-and-time-value {
          text-align: left;
        }
        .tranche-date::-webkit-calendar-picker-indicator {
          margin-left: 4px;
        }
        /* Wenn leer: zeigt iOS gar nichts an. Mit ::before-Pseudo ein
           Format-Hint einblenden damit der Nutzer weiss was rein soll. */
        .tranche-date:not(:focus):in-range::-webkit-datetime-edit-fields-wrapper { color: #1a1a1a; }
      `}</style>
    </>
  );
}

function SackgasseStep({ t }: { t: any }) {
  return (
    <div style={{ textAlign: "center", padding: "20px 0" }}>
      <div style={{ width: 56, height: 56, borderRadius: 0, background: "#fef3c7", color: "#92400e", display: "inline-flex", alignItems: "center", justifyContent: "center", fontSize: 28, marginBottom: 16 }}>!</div>
      <h2 style={{ fontSize: 24, fontWeight: 600, color: "#1a1a1a", marginBottom: 12 }}>{t.sackgasseTitle}</h2>
      <p style={{ fontSize: 15, color: "#555", lineHeight: 1.7, maxWidth: 520, margin: "0 auto 24px" }}>{t.sackgasseBody}</p>
      <div style={{ display: "flex", gap: 12, justifyContent: "center", flexWrap: "wrap" }}>
        <Link href="/termin" style={{ padding: "12px 24px", background: ACCENT, color: "#fff", borderRadius: 0, fontSize: 14, fontWeight: 600, textDecoration: "none" }}>{t.sackgasseCta}</Link>
        <Link href="/" style={{ padding: "12px 24px", background: "#fff", color: "#666", border: "1px solid #ddd", borderRadius: 0, fontSize: 14, textDecoration: "none" }}>{t.sackgasseHome}</Link>
      </div>
    </div>
  );
}

function KantonStep({ t, value, setValue }: { t: any; value: string; setValue: (v: string) => void }) {
  return (
    <>
      <StepHeader title={t.qKanton} desc={t.qKantonDesc} />
      <select value={value} onChange={(e) => setValue(e.target.value)} style={{ ...inp, fontSize: 16 }}>
        <option value="">{t.selectKanton}</option>
        {KANTONE.map(([code, name]) => <option key={code} value={code}>{name}</option>)}
      </select>
    </>
  );
}

function RadioStep({ t, title, desc, value, setValue, options }: { t: any; title: string; desc?: string; value: string; setValue: (v: string) => void; options: { val: string; label: string; desc?: string }[] }) {
  return (
    <>
      <StepHeader title={title} desc={desc} />
      <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
        {options.map((o) => {
          const active = value === o.val;
          return (
            <button key={o.val} type="button" onClick={() => setValue(o.val)}
              style={{ textAlign: "left", padding: "14px 16px", background: active ? `${ACCENT}0d` : "#fff", border: `2px solid ${active ? ACCENT : "#e5e5e5"}`, borderRadius: 0, cursor: "pointer", fontFamily: "inherit", transition: "all 0.15s" }}>
              <div style={{ fontSize: 15, fontWeight: 600, color: "#1a1a1a" }}>{o.label}</div>
              {o.desc && <div style={{ fontSize: 13, color: "#666", marginTop: 4 }}>{o.desc}</div>}
            </button>
          );
        })}
      </div>
    </>
  );
}

function LaufzeitStep({ t, value, setValue, max }: { t: any; value: number | null; setValue: (v: number) => void; max: number }) {
  return (
    <>
      <StepHeader title={t.qLaufzeit} desc={t.qLaufzeitDesc} />
      <select value={value ?? ""} onChange={(e) => setValue(Number(e.target.value))} style={{ ...inp, fontSize: 16 }}>
        <option value="">{t.selectLaufzeit}</option>
        {Array.from({ length: max }, (_, i) => i + 1).map((y) => (
          <option key={y} value={y}>{y} {y === 1 ? t.yearOne : t.yearMany}</option>
        ))}
      </select>
    </>
  );
}

function ContactStep({ t, answers, setAnswers }: { t: any; answers: Answers; setAnswers: (a: Answers) => void }) {
  return (
    <>
      <StepHeader title={t.qContact} desc={t.qContactDesc} />
      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 10, marginBottom: 10 }}>
        <div>
          <label style={lbl}>{t.firstName}</label>
          <input value={answers.first_name} onChange={(e) => setAnswers({ ...answers, first_name: e.target.value })} style={inp} />
        </div>
        <div>
          <label style={lbl}>{t.lastName}</label>
          <input value={answers.last_name} onChange={(e) => setAnswers({ ...answers, last_name: e.target.value })} style={inp} />
        </div>
      </div>
      <div style={{ marginBottom: 10 }}>
        <label style={lbl}>{t.email}</label>
        <input type="email" value={answers.email} onChange={(e) => setAnswers({ ...answers, email: e.target.value })} style={inp} />
      </div>
      <div>
        <label style={lbl}>{t.phone}</label>
        <input type="tel" value={answers.phone} onChange={(e) => setAnswers({ ...answers, phone: e.target.value })} style={inp} />
      </div>
      <p style={{ fontSize: 12, color: "#888", marginTop: 14, lineHeight: 1.5 }}>{t.privacy}</p>
    </>
  );
}

function SuccessStep({ t, endPath, lang }: { t: any; endPath: string; lang: Lang }) {
  return (
    <div style={{ padding: "10px 0" }}>
      <div style={{ textAlign: "center" }}>
        <div style={{ width: 56, height: 56, borderRadius: 0, background: "#dcfce7", color: "#166534", display: "inline-flex", alignItems: "center", justifyContent: "center", fontSize: 28, marginBottom: 16 }}>✓</div>
        <h2 style={{ fontSize: 24, fontWeight: 600, color: "#1a1a1a", marginBottom: 12 }}>{t.successTitle}</h2>
        <p style={{ fontSize: 15, color: "#555", lineHeight: 1.7, maxWidth: 520, margin: "0 auto 12px" }}>
          {endPath === "termin" ? t.successTerminDesc : t.successSubmittedDesc}
        </p>
        <p style={{ fontSize: 12, color: "#888", margin: "0 auto 24px", maxWidth: 480 }}>{t.successCheckEmail}</p>
        <div style={{ display: "flex", gap: 12, justifyContent: "center", flexWrap: "wrap" }}>
          {endPath === "termin" && (
            <Link href="/termin" style={{ padding: "12px 24px", background: ACCENT, color: "#fff", borderRadius: 0, fontSize: 14, fontWeight: 600, textDecoration: "none" }}>{t.successCalendarBtn}</Link>
          )}
        </div>
      </div>

      {/* Vorlagen zum Download, Vollmacht etc., dynamisch aus DB */}
      <VorlagenDownloadBlock kategorie="abloesung" lang={lang} variant="card" />

      {/* Naechster-Schritt Card: Kuendigungsvorlage, gehoert logisch in den Abloesungs-Workflow */}
      <div style={{ marginTop: 24, padding: 20, background: "#fafafa", border: `1px solid ${ACCENT}33`, borderRadius: 0 }}>
        <div style={{ display: "flex", alignItems: "flex-start", gap: 14, flexWrap: "wrap" }}>
          <div style={{ width: 40, height: 40, borderRadius: 0, background: `${ACCENT}1a`, color: ACCENT, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 18, fontWeight: 700, flexShrink: 0 }}>2</div>
          <div style={{ flex: 1, minWidth: 200 }}>
            <h3 style={{ fontSize: 16, fontWeight: 700, color: "#1a1a1a", margin: "0 0 6px" }}>{t.nextStepTitle}</h3>
            <p style={{ fontSize: 13, color: "#555", lineHeight: 1.6, margin: "0 0 12px" }}>{t.nextStepBody}</p>
            <Link href="/kuendigung" style={{ display: "inline-block", padding: "10px 18px", background: ACCENT, color: "#fff", borderRadius: 0, fontSize: 13, fontWeight: 600, textDecoration: "none" }}>{t.nextStepCta}</Link>
          </div>
        </div>
      </div>

      <div style={{ textAlign: "center", marginTop: 20 }}>
        <Link href="/" style={{ fontSize: 13, color: "#999", textDecoration: "none" }}>{t.successHomeBtn}</Link>
      </div>
    </div>
  );
}

const lbl: React.CSSProperties = { display: "block", fontSize: 12, fontWeight: 600, color: "#444", marginBottom: 4 };
const inp: React.CSSProperties = { width: "100%", padding: "10px 12px", fontSize: 16, border: "1px solid #ddd", borderRadius: 0, fontFamily: "inherit", background: "#fff", boxSizing: "border-box" };
