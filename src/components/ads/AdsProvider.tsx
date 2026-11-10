"use client";

import { createContext, useCallback, useContext, useEffect, useState, ReactNode } from "react";
import { usePathname } from "next/navigation";
import { CONSENT_COOKIE, ConsentValue, isAdsExcludedPath, isValidGoogleTagId } from "@/lib/ads";

/**
 * Lädt den Google Tag (Google Ads), wenn Simon ihn unter /admin/werbung
 * aktiviert hat. Google Consent Mode v2:
 *  - Der Tag ist auf jeder öffentlichen Seite eingebunden (Google Ads erkennt ihn).
 *  - Werbe-Cookies werden erst nach "Akzeptieren" im Cookie-Banner gesetzt.
 *  - ad_personalization und analytics_storage bleiben immer aus: wir messen
 *    Anzeigen-Erfolg, wir bauen keine Profile und kein Remarketing.
 * Nie auf /admin und /upload (Token-Links von Kunden).
 */

type GtagWindow = Window & {
  dataLayer?: unknown[];
  gtag?: (...args: unknown[]) => void;
  __hyponovaGtagId?: string;
};

interface AdsContextType {
  /** true, sobald die Settings geladen sind (egal mit welchem Ergebnis). */
  ready: boolean;
  /** true, wenn ein Werbe-Tag aktiv ist und der Banner eine Wahl anbieten muss. */
  adsActive: boolean;
  consent: ConsentValue | null;
  setConsent: (value: ConsentValue) => void;
}

const AdsContext = createContext<AdsContextType>({
  ready: false,
  adsActive: false,
  consent: null,
  setConsent: () => {},
});

export function useAds() {
  return useContext(AdsContext);
}

function readConsent(): ConsentValue | null {
  if (typeof document === "undefined") return null;
  const value = document.cookie.match(/(?:^|;\s*)hyponova-cookie-consent=([^;]+)/)?.[1];
  return value === "all" || value === "necessary" ? value : null;
}

function consentState(value: ConsentValue | null) {
  const granted = value === "all" ? "granted" : "denied";
  return {
    ad_storage: granted,
    ad_user_data: granted,
    ad_personalization: "denied",
    analytics_storage: "denied",
  };
}

/** URL ohne Einmal-Token, damit nie ein Kunden-Token bei Google landet. */
function safePageLocation(): string {
  const url = new URL(window.location.href);
  url.searchParams.delete("prefill");
  url.searchParams.delete("token");
  return url.toString();
}

function bootGoogleTag(tagId: string, consent: ConsentValue | null) {
  const w = window as GtagWindow;
  if (w.__hyponovaGtagId) return;
  w.__hyponovaGtagId = tagId;

  w.dataLayer = w.dataLayer || [];
  // gtag.js erwartet das arguments-Objekt, kein Array. Deshalb keine Rest-Parameter.
  w.gtag = function gtag() {
    // eslint-disable-next-line prefer-rest-params
    w.dataLayer!.push(arguments);
  };

  w.gtag("consent", "default", consentState(null));
  if (consent === "all") w.gtag("consent", "update", consentState("all"));
  w.gtag("js", new Date());
  w.gtag("config", tagId, { page_location: safePageLocation() });

  const script = document.createElement("script");
  script.async = true;
  script.src = `https://www.googletagmanager.com/gtag/js?id=${encodeURIComponent(tagId)}`;
  document.head.appendChild(script);
}

/** Entfernt Google-Ads-Cookies, wenn jemand die Einwilligung zurückzieht. */
function clearAdCookies() {
  const names = document.cookie
    .split(";")
    .map((c) => c.split("=")[0].trim())
    .filter((n) => n.startsWith("_gcl_") || n === "_gac" || n.startsWith("_gac_"));
  const host = window.location.hostname;
  const domains = ["", host, `.${host.replace(/^www\./, "")}`];
  for (const name of names) {
    for (const domain of domains) {
      document.cookie = `${name}=;path=/;max-age=0${domain ? `;domain=${domain}` : ""}`;
    }
  }
}

export function AdsProvider({ children }: { children: ReactNode }) {
  const pathname = usePathname() || "/";
  const [ready, setReady] = useState(false);
  const [tagId, setTagId] = useState<string | null>(null);
  const [consent, setConsentState] = useState<ConsentValue | null>(null);

  useEffect(() => {
    setConsentState(readConsent());
    let cancelled = false;
    fetch("/api/public/settings")
      .then((r) => (r.ok ? r.json() : null))
      .then((d) => {
        if (cancelled) return;
        setTagId(d && isValidGoogleTagId(d.google_tag_id) ? d.google_tag_id : null);
      })
      .catch(() => {})
      .finally(() => {
        if (!cancelled) setReady(true);
      });
    return () => {
      cancelled = true;
    };
  }, []);

  const excluded = isAdsExcludedPath(pathname);

  useEffect(() => {
    if (!tagId || excluded) return;
    bootGoogleTag(tagId, readConsent());
  }, [tagId, excluded]);

  const setConsent = useCallback((value: ConsentValue) => {
    document.cookie = `${CONSENT_COOKIE}=${value};path=/;max-age=${60 * 60 * 24 * 365};samesite=lax`;
    setConsentState(value);
    const w = window as GtagWindow;
    if (w.gtag && w.__hyponovaGtagId) {
      w.gtag("consent", "update", consentState(value));
    }
    if (value === "necessary") clearAdCookies();
  }, []);

  return (
    <AdsContext.Provider value={{ ready, adsActive: !!tagId && !excluded, consent, setConsent }}>
      {children}
    </AdsContext.Provider>
  );
}
