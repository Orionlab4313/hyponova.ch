"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useI18n } from "@/i18n/context";

const COOKIE_KEY = "hyponova-cookie-consent";

const COPY = {
  de: {
    text: "Wir verwenden technisch notwendige Cookies (Sprachauswahl, Login-Sitzung). Es werden keine Tracking- oder Werbe-Cookies gesetzt.",
    privacy: "Datenschutz",
    accept: "Verstanden",
  },
  en: {
    text: "We use technically necessary cookies (language selection, login session). No tracking or advertising cookies are set.",
    privacy: "Privacy policy",
    accept: "Got it",
  },
} as const;

export default function CookieBanner() {
  const { lang } = useI18n();
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    if (typeof document === "undefined") return;
    const consent = document.cookie.match(/hyponova-cookie-consent=([^;]+)/)?.[1];
    if (!consent) {
      const timer = setTimeout(() => setVisible(true), 600);
      return () => clearTimeout(timer);
    }
  }, []);

  function accept() {
    document.cookie = `${COOKIE_KEY}=1;path=/;max-age=${60 * 60 * 24 * 365};samesite=lax`;
    setVisible(false);
  }

  if (!visible) return null;
  const t = COPY[lang];

  return (
    <div
      role="dialog"
      aria-label={lang === "en" ? "Cookie notice" : "Cookie-Hinweis"}
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
        <p style={{ margin: 0, fontSize: 13, lineHeight: 1.5, color: "rgba(255,255,255,0.85)", flex: 1, minWidth: 240 }}>
          {t.text}{" "}
          <Link href="/datenschutz" style={{ color: "#f4a896", textDecoration: "underline", textUnderlineOffset: 2 }}>
            {t.privacy}
          </Link>
        </p>
        <button
          type="button"
          onClick={accept}
          style={{
            padding: "10px 22px",
            background: "#fff",
            color: "#0a0a0a",
            border: "none",
            fontSize: 13,
            fontWeight: 600,
            cursor: "pointer",
            fontFamily: "inherit",
            flexShrink: 0,
          }}
        >
          {t.accept}
        </button>
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
