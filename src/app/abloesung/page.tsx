import type { Metadata } from "next";
import { cookies } from "next/headers";
import Header from "@/components/layout/Header";
import Footer from "@/components/layout/Footer";
import AbloesungForm from "./AbloesungForm";

export const dynamic = "force-dynamic";

async function readLang(): Promise<"de" | "en"> {
  const c = await cookies();
  const v = c.get("hyponova-lang")?.value;
  return v === "en" ? "en" : "de";
}

export async function generateMetadata(): Promise<Metadata> {
  const lang = await readLang();
  if (lang === "en") {
    return {
      title: "Refinance your mortgage | HYPONOVA",
      description:
        "Compare new offers for your mortgage refinancing. Free, independent and transparent.",
    };
  }
  return {
    title: "Hypothek ablösen | HYPONOVA",
    description:
      "Vergleichen Sie neue Offerten für Ihre Hypothekarablösung. Kostenlos, unabhängig und transparent.",
  };
}

export default async function AbloesungPage() {
  const lang = await readLang();
  return (
    <>
      <Header />
      <main>
        <AbloesungForm initialLang={lang} />
      </main>
      <Footer />
    </>
  );
}
