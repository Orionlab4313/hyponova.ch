import { createServiceClient } from "@/lib/supabase";

export type SubmissionType = "abloesung" | "neukauf";
export type SubmissionStatus = "submitted" | "reviewing" | "done" | "rejected";
export type EndPath = "offerten" | "termin";
export type Lang = "de" | "en";

/**
 * Antworten-Schema fuer den Abloesungs-Fragebogen.
 * Alle Felder optional damit wir Teil-Submissions speichern koennen
 * wenn der User abbricht.
 */
export interface AbloesungAnswers {
  tranchen?: Array<{
    betrag: number;
    modell: "saron" | "festzins" | "variable";
    faelligkeit: string; // ISO-date YYYY-MM-DD
  }>;
  ist_abloesbar?: boolean;
  kanton?: string;
  objektart?: "efh" | "stwe" | "2fh";
  bewohnt?: "100" | "teilvermietet";
  baurecht?: boolean;
  taetigkeit?: "angestellt" | "selbstaendig" | "pensioniert";
  weiss_modell?: boolean;
  modell?: "festzins" | "saron-rahmen" | "saron-frei";
  laufzeit_jahre?: number;
}

export interface NeukaufAnswers {
  kanton?: string;
  objektart?: "efh" | "stwe" | "2fh";
  status?: "bestehend" | "neubau";
  taetigkeit?: "angestellt" | "selbstaendig" | "pensioniert";
}

export type AnswersByType<T extends SubmissionType> = T extends "abloesung"
  ? AbloesungAnswers
  : NeukaufAnswers;

export interface QuestionnaireSubmission<T extends SubmissionType = SubmissionType> {
  id: string;
  lead_id: string | null;
  type: T;
  answers: AnswersByType<T>;
  status: SubmissionStatus;
  lang: Lang;
  end_path: EndPath | null;
  created_at: string;
  updated_at: string;
}

export interface CreateSubmissionInput<T extends SubmissionType> {
  lead_id: string;
  type: T;
  answers: AnswersByType<T>;
  lang: Lang;
  end_path?: EndPath | null;
}

export async function createSubmission<T extends SubmissionType>(
  input: CreateSubmissionInput<T>
): Promise<QuestionnaireSubmission<T>> {
  const sb = createServiceClient();
  const { data, error } = await sb
    .from("questionnaire_submissions")
    .insert({
      lead_id: input.lead_id,
      type: input.type,
      answers: input.answers,
      lang: input.lang,
      end_path: input.end_path ?? null,
    })
    .select()
    .single();

  if (error) throw new Error(`createSubmission: ${error.message}`);
  return data as QuestionnaireSubmission<T>;
}

export async function getSubmission(id: string): Promise<QuestionnaireSubmission | null> {
  const sb = createServiceClient();
  const { data, error } = await sb
    .from("questionnaire_submissions")
    .select("*")
    .eq("id", id)
    .maybeSingle();
  if (error) {
    console.error("getSubmission:", error.message);
    return null;
  }
  return (data as QuestionnaireSubmission) || null;
}

export async function listSubmissionsForLead(
  leadId: string
): Promise<QuestionnaireSubmission[]> {
  const sb = createServiceClient();
  const { data, error } = await sb
    .from("questionnaire_submissions")
    .select("*")
    .eq("lead_id", leadId)
    .order("created_at", { ascending: false });
  if (error) {
    console.error("listSubmissionsForLead:", error.message);
    return [];
  }
  return (data || []) as QuestionnaireSubmission[];
}

/**
 * Geschaeftslogik: Hypothek ist abloesbar wenn mindestens eine Tranche
 * innerhalb der naechsten 24 Monate faellig ist (oder bereits ueberfaellig).
 *
 * Variable Hypotheken sind jederzeit kuendbar, also immer abloesbar.
 */
export function isAbloesbar(tranchen: AbloesungAnswers["tranchen"]): boolean {
  if (!tranchen || tranchen.length === 0) return false;
  const now = new Date();
  const cutoff = new Date(now.getFullYear() + 2, now.getMonth(), now.getDate());
  return tranchen.some((t) => {
    if (t.modell === "variable") return true;
    const d = new Date(t.faelligkeit);
    if (isNaN(d.getTime())) return false;
    return d <= cutoff;
  });
}

/**
 * Welche Dokument-Kategorien soll der Kunde liefern?
 * 1:1 nach Simons offiziellen Excel-Checklisten ("Checklisten Ablösung.xlsx" /
 * "Checklisten Neukauf.xlsx"). Modular aufgebaut: Basis + Taetigkeit + Workflow
 * + Objektart + (Neukauf) Bestand/Neubau + (EFH) Baurecht.
 */
export function requiredDocumentCategories(
  type: SubmissionType,
  answers: AbloesungAnswers | NeukaufAnswers
): string[] {
  const base: string[] = [];

  // ---------- Persoenliche Unterlagen — bei allen ----------
  base.push(
    "mandatsvereinbarung",
    "ausweis",
    "steuererklaerung",
    "konto_wertschriften",
    "leasing_kreditvertrag",
    "betreibungsregister",
  );

  // ---------- Taetigkeitsabhaengig ----------
  switch (answers.taetigkeit) {
    case "angestellt":
      base.push("lohnausweis_aktuell", "saeule_3a", "lebensversicherung");
      break;
    case "selbstaendig":
      base.push("geschaeftsabschluesse_3j", "saeule_3a", "lebensversicherung");
      break;
    case "pensioniert":
      base.push("rentennachweis");
      break;
  }

  // ---------- Workflow-spezifisch ----------
  if (type === "abloesung") {
    base.push("hypothekarvertrag");
  } else {
    base.push("aufstellung_eigenmittel");
  }

  // ---------- Liegenschaft ----------
  if (type === "abloesung") {
    const a = answers as AbloesungAnswers;
    // Beide Objektarten: Grundbuch + Gebaeudeversicherung + Fotos + Renovations-Fragebogen
    base.push("grundbuchauszug", "gebaeudeversicherung", "fotos_liegenschaft", "fragebogen_renovationen");

    if (a.objektart === "stwe") {
      base.push("grundrissplaene_wohnflaeche", "erneuerungsfonds");
    } else {
      // EFH (Default)
      base.push("grundrissplaene", "katasterplan");
      if (a.baurecht === true) base.push("baurechtsvertrag");
    }
  }

  if (type === "neukauf") {
    const a = answers as NeukaufAnswers;
    base.push("gebaeudeversicherung", "fotos_liegenschaft");

    if (a.status === "neubau") {
      // Neubau: Werkvertrag/Architekturvertrag, SIA, Baubeschrieb, Plaene, Bewilligung
      base.push(
        "kaufvertrag_werkvertrag",
        "kubische_berechnung",
        "baubeschrieb",
        "grundriss_fassadenplaene",
        "katasterplan",
        "baubewilligung",
        "verkaufsdokumentation",
        "zahlungsplan_oder_kostenvoranschlag",
      );
    } else {
      // Bestehende Liegenschaft
      base.push("kaufvertrag_entwurf", "grundrissplaene", "verkaufsdokumentation");
    }

    // STWE-spezifisch: Erneuerungsfonds-Nachweis (analog Abloesung)
    if (a.objektart === "stwe") {
      base.push("erneuerungsfonds");
    }

    // TODO: Baurecht-Frage gibts im Neukauf-Fragebogen noch nicht — sobald
    // sie hinzukommt, hier "baurechtsvertrag" pushen wenn EFH + baurecht=true
  }

  return Array.from(new Set(base));
}

/* ---------- Admin Display Helpers ---------- */

const KANTON_NAMES: Record<string, string> = {
  AG: "Aargau", AI: "Appenzell Innerrhoden", AR: "Appenzell Ausserrhoden",
  BE: "Bern", BL: "Basel-Landschaft", BS: "Basel-Stadt",
  FR: "Freiburg / Fribourg", GE: "Genf / Genève", GL: "Glarus",
  GR: "Graubünden", JU: "Jura", LU: "Luzern", NE: "Neuenburg / Neuchâtel",
  NW: "Nidwalden", OW: "Obwalden", SG: "St. Gallen", SH: "Schaffhausen",
  SO: "Solothurn", SZ: "Schwyz", TG: "Thurgau", TI: "Tessin / Ticino",
  UR: "Uri", VD: "Waadt / Vaud", VS: "Wallis / Valais",
  ZG: "Zug", ZH: "Zürich",
};

const OBJEKTART_LABELS: Record<string, string> = {
  efh: "Einfamilienhaus",
  stwe: "Eigentumswohnung (STWE)",
  "2fh": "Zweifamilienhaus",
};

const BEWOHNT_LABELS: Record<string, string> = {
  "100": "100% selbstbewohnt",
  teilvermietet: "Teilweise vermietet",
};

const TAETIGKEIT_LABELS: Record<string, string> = {
  angestellt: "Angestellt",
  selbstaendig: "Selbständig",
  pensioniert: "Pensioniert",
};

const MODELL_LABELS: Record<string, string> = {
  festzins: "Festzinshypothek",
  saron: "SARON",
  variable: "Variable Hypothek",
  "saron-rahmen": "SARON mit Rahmenlaufzeit",
  "saron-frei": "SARON ohne Rahmenlaufzeit",
};

const STATUS_LABELS: Record<string, string> = {
  bestehend: "Bestehende Liegenschaft",
  neubau: "Neubau",
};

const END_PATH_LABELS: Record<string, string> = {
  offerten: "Offerten-Vergleich von Hyponova",
  termin: "Beratungstermin",
};

function formatChf(n: number): string {
  return new Intl.NumberFormat("de-CH", { maximumFractionDigits: 0 }).format(n).replace(/,/g, "'");
}

function formatDate(iso: string): string {
  const d = new Date(iso);
  if (isNaN(d.getTime())) return iso;
  return d.toLocaleDateString("de-CH", { day: "2-digit", month: "2-digit", year: "numeric" });
}

export interface FormattedAnswer {
  label: string;
  value: string;
  multi?: string[]; // fuer Listen (z.B. Tranchen)
}

/**
 * Wandelt das Antwort-JSON in eine lesbare Liste fuer das Admin-UI.
 * Reihenfolge folgt der Logik des Fragebogens.
 */
export function formatSubmissionAnswers(
  type: SubmissionType,
  answers: AbloesungAnswers | NeukaufAnswers
): FormattedAnswer[] {
  const out: FormattedAnswer[] = [];

  if (type === "abloesung") {
    const a = answers as AbloesungAnswers;

    if (a.tranchen && a.tranchen.length > 0) {
      const lines = a.tranchen.map((tr, i) => {
        const modell = MODELL_LABELS[tr.modell] || tr.modell;
        const datum = tr.modell === "variable" ? "jederzeit kündbar" : `fällig ${formatDate(tr.faelligkeit)}`;
        return `${i + 1}. CHF ${formatChf(tr.betrag)} — ${modell} (${datum})`;
      });
      out.push({ label: "Hypothekartranchen", value: `${a.tranchen.length} Tranche${a.tranchen.length === 1 ? "" : "n"}`, multi: lines });
    }

    if (typeof a.ist_abloesbar === "boolean") {
      out.push({ label: "Ablösbar", value: a.ist_abloesbar ? "Ja" : "Nein" });
    }
  }

  if (answers.kanton) {
    out.push({ label: "Kanton", value: KANTON_NAMES[answers.kanton] || answers.kanton });
  }
  if (answers.objektart) {
    out.push({ label: "Objektart", value: OBJEKTART_LABELS[answers.objektart] || answers.objektart });
  }

  if (type === "abloesung") {
    const a = answers as AbloesungAnswers;
    if (a.bewohnt) out.push({ label: "Selbstbewohnt", value: BEWOHNT_LABELS[a.bewohnt] || a.bewohnt });
    if (typeof a.baurecht === "boolean") out.push({ label: "Baurecht", value: a.baurecht ? "Ja" : "Nein" });
  }

  if (type === "neukauf") {
    const a = answers as NeukaufAnswers;
    if (a.status) out.push({ label: "Objekt-Status", value: STATUS_LABELS[a.status] || a.status });
  }

  if (answers.taetigkeit) {
    out.push({ label: "Tätigkeit", value: TAETIGKEIT_LABELS[answers.taetigkeit] || answers.taetigkeit });
  }

  if (type === "abloesung") {
    const a = answers as AbloesungAnswers;
    if (typeof a.weiss_modell === "boolean") {
      out.push({ label: "Weiss schon Modell + Laufzeit", value: a.weiss_modell ? "Ja" : "Nein" });
    }
    if (a.modell) out.push({ label: "Gewünschtes Modell", value: MODELL_LABELS[a.modell] || a.modell });
    if (a.laufzeit_jahre) out.push({ label: "Gewünschte Laufzeit", value: `${a.laufzeit_jahre} Jahre` });
  }

  return out;
}

export function formatEndPath(endPath: string | null): string {
  if (!endPath) return "—";
  return END_PATH_LABELS[endPath] || endPath;
}

/**
 * Wandelt Lead-Source und Document-Category Schluessel in lesbare deutsche
 * Labels. Akzeptiert sowohl alte (machine_keys) als auch neue (lesbare) Werte.
 */
export const SOURCE_LABELS: Record<string, string> = {
  website: "Website",
  "abloesung-fragebogen": "Ablösung (Fragebogen)",
  "neukauf-fragebogen": "Neukauf (Fragebogen)",
  "Ablösung (Fragebogen)": "Ablösung (Fragebogen)",
  "Neukauf (Fragebogen)": "Neukauf (Fragebogen)",
  "kontaktformular": "Kontaktformular",
  "termin-buchung": "Terminbuchung",
};

export function formatSource(source: string | null | undefined): string {
  if (!source) return "—";
  return SOURCE_LABELS[source] || source.replace(/_/g, " ").replace(/-/g, " ");
}

/**
 * Liefert das deutsche Label fuer einen Document-Category-Key.
 * Fallback: Key mit Underscores zu Leerzeichen.
 */
export function formatCategory(key: string | null | undefined, lang: "de" | "en" = "de"): string {
  if (!key) return "—";
  return DOCUMENT_CATEGORY_LABELS[key]?.[lang] || key.replace(/_/g, " ").replace(/-/g, " ");
}

export function formatUploadedVia(via: string | null | undefined): string {
  if (via === "customer") return "Kunde";
  if (via === "admin") return "Admin";
  return via || "—";
}

export const DOCUMENT_CATEGORY_LABELS: Record<string, { de: string; en: string }> = {
  // ----- Persoenliche Unterlagen -----
  mandatsvereinbarung: { de: "Mandatsvereinbarung HYPONOVA GmbH", en: "Mandate agreement HYPONOVA GmbH" },
  ausweis: { de: "Ausweiskopie (Pass oder ID)", en: "ID copy (passport or ID card)" },
  steuererklaerung: { de: "Steuererklärung", en: "Tax return" },
  konto_wertschriften: { de: "Konto- und Wertschriftenauszüge (≤ 6 Monate)", en: "Bank and securities statements (≤ 6 months)" },
  leasing_kreditvertrag: { de: "Leasing- und/oder Kreditvertrag (sofern vorhanden)", en: "Leasing and/or credit agreement (if applicable)" },
  betreibungsregister: { de: "Betreibungsregisterauszug", en: "Debt enforcement register extract" },

  // ----- Taetigkeit -----
  lohnausweis_aktuell: { de: "Lohnausweis (aktuelles Jahr) und letzte Monatsabrechnung", en: "Salary certificate (current year) and latest pay slip" },
  geschaeftsabschluesse_3j: { de: "Jahresabschlüsse der letzten 3 Jahre (Bilanz & Erfolgsrechnung)", en: "Last 3 annual statements (balance sheet & income statement)" },
  rentennachweis: { de: "Rentennachweis (AHV, Pensionskasse, Leibrente)", en: "Pension certificate (AHV, pension fund, annuity)" },
  saeule_3a: { de: "Säule 3a Konto- oder Policennachweis (≤ 6 Monate)", en: "Pillar 3a account or policy proof (≤ 6 months)" },
  lebensversicherung: { de: "Lebensversicherungspolicen", en: "Life insurance policies" },

  // ----- Workflow-spezifisch -----
  hypothekarvertrag: { de: "Hypothekarvertrag inkl. Produktübersicht (Fälligkeiten ersichtlich)", en: "Mortgage contract incl. product overview (with maturities)" },
  aufstellung_eigenmittel: { de: "Aufstellung Eigenmittel", en: "Statement of equity" },

  // ----- Liegenschaft (gemeinsam) -----
  grundbuchauszug: { de: "Grundbuchauszug", en: "Land register extract" },
  gebaeudeversicherung: { de: "Gebäudeversicherungsanzeige (inkl. Volumen m³ und Baujahr)", en: "Building insurance notice (incl. volume m³ and year built)" },
  fotos_liegenschaft: { de: "Fotos der Liegenschaft (Wohnzimmer, Küche, Bad/WC, Aussicht, Fassade)", en: "Property photos (living room, kitchen, bathroom, view, façade)" },
  fragebogen_renovationen: { de: "Fragebogen zu Renovationen", en: "Renovation questionnaire" },
  baurechtsvertrag: { de: "Baurechtsvertrag und -zinsabrechnung", en: "Building lease contract and ground rent statement" },

  // ----- EFH-spezifisch -----
  grundrissplaene: { de: "Grundrisspläne", en: "Floor plans" },
  katasterplan: { de: "Kataster- oder Situationsplan", en: "Cadastral or site plan" },

  // ----- STWE-spezifisch -----
  grundrissplaene_wohnflaeche: { de: "Grundrisspläne inkl. Brutto-/Nettowohnfläche", en: "Floor plans incl. gross/net living area" },
  erneuerungsfonds: { de: "Nachweis Erneuerungsfonds (STWE-Reglement oder Jahresabrechnung)", en: "Renovation fund proof (STWE regulations or annual statement)" },

  // ----- Neukauf bestehend -----
  kaufvertrag_entwurf: { de: "Kaufvertragsentwurf", en: "Draft purchase agreement" },
  verkaufsdokumentation: { de: "Verkaufsdokumentation (sofern vorhanden)", en: "Sales documentation (if available)" },

  // ----- Neukauf Neubau -----
  kaufvertrag_werkvertrag: { de: "Kaufvertragsentwurf inkl. Werkvertrag / Architekturvertrag", en: "Draft purchase agreement incl. construction/architect contract" },
  kubische_berechnung: { de: "Kubische Berechnung (SIA)", en: "Cubic calculation (SIA)" },
  baubeschrieb: { de: "Baubeschrieb", en: "Building specification" },
  grundriss_fassadenplaene: { de: "Grundriss- und Fassadenpläne", en: "Floor and façade plans" },
  baubewilligung: { de: "Baubewilligung", en: "Building permit" },
  zahlungsplan_oder_kostenvoranschlag: { de: "Zahlungsplan (GU) oder Kostenvoranschlag (Architekt)", en: "Payment plan (GC) or cost estimate (architect)" },

  // ----- Legacy-Keys (Backwards-Compat fuer alte documents) -----
  // damit alte Uploads im Admin lesbar bleiben
  bankauszug_eigenkapital: { de: "Bankauszug (Eigenkapital-Nachweis)", en: "Bank statement (equity proof)" },
  lohnausweis: { de: "Lohnausweis", en: "Salary certificate" },
  lohnabrechnungen_3mt: { de: "Lohnabrechnungen 3 Mt.", en: "Pay slips last 3 months" },
  geschaeftsabschluss_3j: { de: "Geschäftsabschlüsse 3 Jahre", en: "Business statements 3 years" },
  ahv_bescheinigung: { de: "AHV-Bescheinigung", en: "AHV certificate" },
  rentenausweis: { de: "Rentenausweis", en: "Pension certificate" },
  saeule_3a_auszug: { de: "Säule 3a-Auszug", en: "Pillar 3a statement" },
  steuererklaerung_letzte: { de: "Letzte Steuererklärung", en: "Latest tax return" },
  steuerveranlagung_letzte: { de: "Letzte Steuerveranlagung", en: "Latest tax assessment" },
  pensionskassenausweis: { de: "Pensionskassenausweis", en: "Pension fund statement" },
  aktueller_hypothekvertrag: { de: "Aktueller Hypothekarvertrag", en: "Current mortgage contract" },
  liegenschaftsschaetzung: { de: "Liegenschaftsschätzung", en: "Property valuation" },
  liegenschaftsbeschrieb: { de: "Liegenschaftsbeschrieb", en: "Property description" },
  mietvertraege: { de: "Mietverträge", en: "Lease agreements" },
};
