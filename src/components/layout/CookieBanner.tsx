"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useI18n } from "@/i18n/context";
import { useAds } from "@/components/ads/AdsProvider";
import { CONSENT_COOKIE, OPEN_CONSENT_EVENT } from "@/lib/ads";

/**
 * Zwei Varianten:
 *  - Kein Werbe-Tag aktiv: reiner Hinweis auf technisch notwendige Cookies ("Verstanden").
 *  - Werbe-Tag aktiv (/admin/werbung): echte Wahl "Nur notwendige" / "Akzeptieren".
 *    Wer früher nur "Verstanden" geklickt hat, wird neu gefragt, weil das keine
 *    Einwilligung in Werbe-Cookies war.
 */
const COPY = {
  de: {
    text: "Wir verwenden technisch notwendige Cookies (Sprachauswahl, Login-Sitzung). Es werden keine Tracking- oder Werbe-Cookies gesetzt.",
    adsText:
      "Wir verwenden technisch notwendige Cookies. Mit Ihrer Zustimmung setzen wir zusätzlich Cookies von Google Ads ein, um den Erfolg unserer Anzeigen zu messen. Ihre Wahl können Sie jederzeit im Footer ändern.",
    privacy: "Datenschutz",
    accept: "Verstanden",
    acceptAll: "Akzeptieren",
    necessary: "Nur notwendige",
    label: "Cookie-Hinweis",
  },
  en: {
    text: "We use technically necessary cookies (language selection, login session). No tracking or advertising cookies are set.",
    adsText:
      "We use technically necessary cookies. With your consent we also set Google Ads cookies to measure how our ads perform. You can change your choice at any time in the footer.",
    privacy: "Privacy policy",
    accept: "Got it",
    acceptAll: "Accept",
    necessary: "Necessary only",
    label: "Cookie notice",
  },
} as const;

export default function CookieBanner() {
  const { lang } = useI18n();
  const { ready, adsActive, consent, setConsent } = useAds();
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    if (!ready) return;
    const hasAnyChoice = /(?:^|;\s*)hyponova-cookie-consent=/.test(document.cookie);
    const needsChoice = adsActive ? consent === null : !hasAnyChoice;
    if (!needsChoice) {
      setVisible(false);
      return;
    }
    const timer = setTimeout(() => setVisible(true), 600);
    return () => clearTimeout(timer);
  }, [ready, adsActive, consent]);

  // Footer-Link "Cookie-Einstellungen" öffnet den Banner erneut.
  useEffect(() => {
    const open = () => setVisible(true);
    window.addEventListener(OPEN_CONSENT_EVENT, open);
    return () => window.removeEventListener(OPEN_CONSENT_EVENT, open);
  }, []);

  function acknowledge() {
    document.cookie = `${CONSENT_COOKIE}=1;path=/;max-age=${60 * 60 * 24 * 365};samesite=lax`;
    setVisible(false);
  }

  function choose(value: "all" | "necessary") {
    setConsent(value);
    setVisible(false);
  }

  if (!visible) return null;
  const t = COPY[lang];

  const buttonBase = {
    padding: "10px 22px",
    fontSize: 13,
    fontWeight: 600,
    cursor: "pointer",
    fontFamily: "inherit",
    flex: "1 1 auto",
    whiteSpace: "nowrap",
  } as const;

  return (
    <div
      role="dialog"
      aria-label={t.label}
      style={{
        position: "fixed",
        bottom: 0, left: 0, right: 0,
        background: "#0a0a0a",
        color: "#fff",
        padding: "16px 20px",
        boxShadow: "0 -4px 24px rgba(0,0,0,0.25)",
        zIndex: 9999,
        animation: "cookieBannerSlideUp 0.35s ease-out",
      }}
    >
      <div style={{
        maxWidth: 1200,
        margin: "0 auto",
        display: "flex",
        alignItems: "center",
        justifyContent: "space-between",
        gap: 20,
        flexWrap: "wrap",
      }}>
        <p style={{ margin: 0, fontSize: 13, lineHeight: 1.5, color: "rgba(255,255,255,0.85)", flex: "1 1 240px", minWidth: 0 }}>
          {adsActive ? t.adsText : t.text}{" "}
          <Link href="/datenschutz" style={{ color: "#f4a896", textDecoration: "underline", textUnderlineOffset: 2 }}>
            {t.privacy}
          </Link>
        </p>
        {adsActive ? (
          <div style={{ display: "flex", gap: 10, flexWrap: "wrap", flex: "1 1 280px", maxWidth: 360 }}>
            <button
              type="button"
              onClick={() => choose("necessary")}
              style={{ ...buttonBase, background: "transparent", color: "#fff", border: "1px solid rgba(255,255,255,0.55)" }}
            >
              {t.necessary}
            </button>
            <button
              type="button"
              onClick={() => choose("all")}
              style={{ ...buttonBase, background: "#fff", color: "#0a0a0a", border: "1px solid #fff" }}
            >
              {t.acceptAll}
            </button>
          </div>
        ) : (
          <button
            type="button"
            onClick={acknowledge}
            style={{ ...buttonBase, flex: "0 0 auto", background: "#fff", color: "#0a0a0a", border: "none" }}
          >
            {t.accept}
          </button>
        )}
      </div>
      <style>{`
        @keyframes cookieBannerSlideUp {
          from { transform: translateY(100%); opacity: 0; }
          to { transform: translateY(0); opacity: 1; }
        }
      `}</style>
    </div>
  );
}
