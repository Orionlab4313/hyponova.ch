import { createServiceClient } from "@/lib/supabase";

export type LegalPageId = "impressum" | "agb" | "datenschutz";

export interface LegalPage {
  id: LegalPageId;
  title_de: string;
  title_en: string;
  title_highlight_de: string;
  title_highlight_en: string;
  content_html_de: string;
  content_html_en: string;
  meta_description_de: string;
  meta_description_en: string;
  created_at: string;
  updated_at: string;
}

export const LEGAL_PAGE_META: Record<LegalPageId, { label_de: string; label_en: string; path: string }> = {
  impressum: { label_de: "Impressum", label_en: "Imprint", path: "/impressum" },
  agb: { label_de: "AGB", label_en: "Terms", path: "/agb" },
  datenschutz: { label_de: "Datenschutz", label_en: "Privacy", path: "/datenschutz" },
};

/**
 * Liefert eine Legal-Page nach ID. Tolerant: falls Tabelle noch nicht existiert
 * oder Zeile fehlt, kommt null zurueck damit die oeffentliche Seite nicht crasht.
 */
export async function getLegalPage(id: LegalPageId): Promise<LegalPage | null> {
  try {
    const supabase = createServiceClient();
    const { data, error } = await supabase
      .from("legal_pages")
      .select("*")
      .eq("id", id)
      .maybeSingle();

    if (error) {
      console.error("getLegalPage error:", error.message);
      return null;
    }
    return (data as LegalPage) || null;
  } catch (err) {
    console.error("getLegalPage threw:", err);
    return null;
  }
}

export async function getAllLegalPages(): Promise<LegalPage[]> {
  try {
    const supabase = createServiceClient();
    const { data, error } = await supabase
      .from("legal_pages")
      .select("*")
      .order("id", { ascending: true });

    if (error) {
      console.error("getAllLegalPages error:", error.message);
      return [];
    }
    return (data || []) as LegalPage[];
  } catch (err) {
    console.error("getAllLegalPages threw:", err);
    return [];
  }
}

/**
 * Waehlt die Inhalte fuer die aktuelle Sprache. Fallback: wenn EN leer ist,
 * wird DE angezeigt. Wenn DE leer ist (sollte nicht vorkommen), bleibt es leer.
 */
export function pickLegalContent(page: LegalPage, lang: "de" | "en") {
  const useEn = lang === "en" && page.content_html_en.trim().length > 0;
  return {
    title: useEn ? page.title_en : page.title_de,
    title_highlight: useEn ? page.title_highlight_en : page.title_highlight_de,
    content_html: useEn ? page.content_html_en : page.content_html_de,
    meta_description: useEn ? page.meta_description_en : page.meta_description_de,
    is_fallback: lang === "en" && !useEn,
  };
}
