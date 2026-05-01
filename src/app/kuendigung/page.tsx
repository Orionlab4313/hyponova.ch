import type { Metadata } from "next";
import { cookies } from "next/headers";
import Header from "@/components/layout/Header";
import Footer from "@/components/layout/Footer";
import KuendigungForm from "./KuendigungForm";

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
      title: "Mortgage cancellation template | HYPONOVA",
      description: "Generate your mortgage cancellation letter as PDF in 2 minutes.",
    };
  }
  return {
    title: "Kündigungsvorlage Hypothek | HYPONOVA",
    description: "Erstellen Sie Ihr vorsorgliches Kündigungsschreiben für die Hypothek als PDF in 2 Minuten.",
  };
}

export default async function KuendigungPage() {
  const lang = await readLang();
  return (
    <>
      <Header />
      <main>
        <KuendigungForm initialLang={lang} />
      </main>
      <Footer />
    </>
  );
}
