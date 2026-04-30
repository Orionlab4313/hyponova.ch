import type { Metadata } from "next";
import { cookies } from "next/headers";
import { getLegalPage, pickLegalContent } from "@/lib/legal-pages";
import LegalPageView from "@/components/legal/LegalPageView";

export const dynamic = "force-dynamic";
export const revalidate = 0;

async function readLang(): Promise<"de" | "en"> {
  const c = await cookies();
  const v = c.get("hyponova-lang")?.value;
  return v === "en" ? "en" : "de";
}

export async function generateMetadata(): Promise<Metadata> {
  const page = await getLegalPage("datenschutz");
  const lang = await readLang();
  if (!page) return { title: "Datenschutz – HYPONOVA" };
  const picked = pickLegalContent(page, lang);
  const fallbackTitle =
    lang === "en" ? "Privacy Policy – HYPONOVA" : "Datenschutz – HYPONOVA";
  return {
    title:
      [picked.title, picked.title_highlight].filter(Boolean).join(" ").trim() +
        " – HYPONOVA" || fallbackTitle,
    description:
      picked.meta_description ||
      "Datenschutzerklärung der HYPONOVA GmbH gemäss dem Schweizer Datenschutzgesetz (nDSG).",
  };
}

export default async function DatenschutzPage() {
  const page = await getLegalPage("datenschutz");
  if (!page) {
    return (
      <main style={{ padding: 60, textAlign: "center", color: "#888" }}>
        Inhalte werden geladen.
      </main>
    );
  }
  return <LegalPageView page={page} />;
}
