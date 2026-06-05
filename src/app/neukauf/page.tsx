import type { Metadata } from "next";
import { cookies } from "next/headers";
import Header from "@/components/layout/Header";
import Footer from "@/components/layout/Footer";
import NeukaufForm from "./NeukaufForm";

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
      title: "Buy a property | HYPONOVA",
      description: "Plan your property purchase with HYPONOVA. Free initial consultation, independent comparison.",
    };
  }
  return {
    title: "Eigenheim kaufen | HYPONOVA",
    description: "Planen Sie Ihren Liegenschaftskauf mit HYPONOVA. Kostenloses Erstgespräch, unabhängiger Vergleich.",
  };
}

export default async function NeukaufPage() {
  const lang = await readLang();
  return (
    <>
      <Header />
      <main>
        <NeukaufForm initialLang={lang} />
      </main>
      <Footer />
    </>
  );
}
