import Link from "next/link";
import type { Metadata } from "next";
import Header from "@/components/layout/Header";
import Footer from "@/components/layout/Footer";

export const metadata: Metadata = {
  title: "Seite nicht gefunden – HYPONOVA",
  robots: { index: false, follow: false },
};

const ACCENT = "#c8553d";

export default function NotFound() {
  return (
    <>
      <Header />
      <main style={{ minHeight: "calc(100vh - 320px)", display: "flex", alignItems: "center", justifyContent: "center", padding: "80px 24px" }}>
        <div style={{ maxWidth: 560, width: "100%", textAlign: "center" }}>
          <p style={{ fontSize: 13, fontWeight: 600, letterSpacing: "0.15em", textTransform: "uppercase", color: ACCENT, marginBottom: 20 }}>
            Fehler 404
          </p>
          <h1 style={{ fontSize: "clamp(36px, 6vw, 60px)", fontWeight: 300, lineHeight: 1.1, color: "#1a1a1a", margin: "0 0 20px" }}>
            Diese Seite konnten wir <span style={{ fontWeight: 600 }}>leider nicht finden.</span>
          </h1>
          <p style={{ fontSize: 16, color: "#666", lineHeight: 1.6, margin: "0 auto 36px", maxWidth: 460 }}>
            Die Seite wurde verschoben oder existiert nicht. Vielleicht hilft Ihnen einer dieser Links weiter.
          </p>

          <div style={{ display: "flex", gap: 12, justifyContent: "center", flexWrap: "wrap", marginBottom: 48 }}>
            <Link href="/" style={{ padding: "14px 28px", background: ACCENT, color: "#fff", fontSize: 14, fontWeight: 600, textDecoration: "none" }}>
              Zur Startseite
            </Link>
            <Link href="/kontakt" style={{ padding: "14px 28px", background: "#fff", color: "#333", border: "1px solid #ddd", fontSize: 14, textDecoration: "none" }}>
              Kontakt aufnehmen
            </Link>
          </div>

          <div style={{ borderTop: "1px solid #eee", paddingTop: 32, textAlign: "left", maxWidth: 480, margin: "0 auto" }}>
            <p style={{ fontSize: 13, fontWeight: 600, color: "#444", marginBottom: 14, textTransform: "uppercase", letterSpacing: "0.05em" }}>
              Häufig besucht
            </p>
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "10px 20px", fontSize: 14 }}>
              <Link href="/dienstleistungen" style={{ color: "#1a1a1a", textDecoration: "none" }} className="nf-link">Dienstleistungen</Link>
              <Link href="/abloesung" style={{ color: "#1a1a1a", textDecoration: "none" }} className="nf-link">Hypothek ablösen</Link>
              <Link href="/neukauf" style={{ color: "#1a1a1a", textDecoration: "none" }} className="nf-link">Eigenheim kaufen</Link>
              <Link href="/rechner" style={{ color: "#1a1a1a", textDecoration: "none" }} className="nf-link">Hypothekenrechner</Link>
              <Link href="/termin" style={{ color: "#1a1a1a", textDecoration: "none" }} className="nf-link">Beratungstermin</Link>
              <Link href="/blog" style={{ color: "#1a1a1a", textDecoration: "none" }} className="nf-link">Ratgeber</Link>
            </div>
          </div>
        </div>
      </main>
      <Footer />

      <style>{`
        .nf-link:hover {
          color: ${ACCENT} !important;
          text-decoration: underline !important;
          text-underline-offset: 4px;
        }
      `}</style>
    </>
  );
}
