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
 * Basis-Set + abhaengig von Taetigkeit + Objektart + Submission-Typ.
 */
export function requiredDocumentCategories(
  type: SubmissionType,
  answers: AbloesungAnswers | NeukaufAnswers
): string[] {
  const base = ["ausweis", "bankauszug_eigenkapital"];

  // Tätigkeitsabhaengig
  switch (answers.taetigkeit) {
    case "angestellt":
      base.push("lohnausweis", "lohnabrechnungen_3mt");
      break;
    case "selbstaendig":
      base.push("geschaeftsabschluss_3j", "ahv_bescheinigung");
      break;
    case "pensioniert":
      base.push("rentenausweis", "saeule_3a_auszug");
      break;
  }

  // Steuern: bei allen
  base.push("steuererklaerung_letzte", "steuerveranlagung_letzte");

  // Vorsorge
  base.push("pensionskassenausweis");

  // Liegenschafts-Dokumente
  if (type === "abloesung") {
    const a = answers as AbloesungAnswers;
    base.push("aktueller_hypothekvertrag", "grundbuchauszug", "liegenschaftsschaetzung");
    if (a.bewohnt === "teilvermietet") {
      base.push("mietvertraege");
    }
  }

  if (type === "neukauf") {
    const a = answers as NeukaufAnswers;
    if (a.status === "neubau") {
      base.push("baubeschrieb", "kaufvertrag_entwurf", "baubewilligung");
    } else {
      base.push("kaufvertrag_entwurf", "grundbuchauszug", "liegenschaftsbeschrieb");
    }
  }

  return Array.from(new Set(base));
}

export const DOCUMENT_CATEGORY_LABELS: Record<string, { de: string; en: string }> = {
  ausweis: { de: "Personalausweis / Pass", en: "ID / Passport" },
  bankauszug_eigenkapital: { de: "Bankauszug (Eigenkapital-Nachweis)", en: "Bank statement (equity proof)" },
  lohnausweis: { de: "Lohnausweis (letztes Jahr)", en: "Salary certificate (last year)" },
  lohnabrechnungen_3mt: { de: "Lohnabrechnungen letzte 3 Monate", en: "Pay slips last 3 months" },
  geschaeftsabschluss_3j: { de: "Geschäftsabschlüsse letzte 3 Jahre", en: "Business statements last 3 years" },
  ahv_bescheinigung: { de: "AHV-Bescheinigung", en: "AHV certificate" },
  rentenausweis: { de: "Rentenausweis (1./2./3. Säule)", en: "Pension certificate (Pillar 1/2/3)" },
  saeule_3a_auszug: { de: "Säule 3a-Auszug", en: "Pillar 3a statement" },
  steuererklaerung_letzte: { de: "Letzte Steuererklärung", en: "Latest tax return" },
  steuerveranlagung_letzte: { de: "Letzte Steuerveranlagung", en: "Latest tax assessment" },
  pensionskassenausweis: { de: "Pensionskassenausweis (aktuell)", en: "Pension fund statement (current)" },
  aktueller_hypothekvertrag: { de: "Aktueller Hypothekarvertrag", en: "Current mortgage contract" },
  grundbuchauszug: { de: "Grundbuchauszug", en: "Land register extract" },
  liegenschaftsschaetzung: { de: "Liegenschaftsschätzung", en: "Property valuation" },
  liegenschaftsbeschrieb: { de: "Liegenschaftsbeschrieb", en: "Property description" },
  mietvertraege: { de: "Mietverträge (vermietete Teile)", en: "Lease agreements (rented parts)" },
  baubeschrieb: { de: "Baubeschrieb", en: "Building specification" },
  kaufvertrag_entwurf: { de: "Kaufvertrag-Entwurf", en: "Draft purchase agreement" },
  baubewilligung: { de: "Baubewilligung", en: "Building permit" },
};
