"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import Header from "@/components/layout/Header";
import Footer from "@/components/layout/Footer";
import WhatsAppButton from "@/components/layout/WhatsAppButton";
import Link from "next/link";
import ScrollReveal, { StaggerContainer, StaggerItem } from "@/components/ui/ScrollReveal";
import { useI18n } from "@/i18n/context";
import { suggestEmail, type EmailSuggestion } from "@/lib/email-suggest";

const WEEKDAYS_DE = ["So", "Mo", "Di", "Mi", "Do", "Fr", "Sa"];
const WEEKDAYS_EN = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];
const MONTHS_DE = ["Januar", "Februar", "März", "April", "Mai", "Juni", "Juli", "August", "September", "Oktober", "November", "Dezember"];
const MONTHS_EN = ["January", "February", "March", "April", "May", "June", "July", "August", "September", "October", "November", "December"];

function getCalendarDays(year: number, month: number) {
  const firstDay = new Date(year, month, 1).getDay();
  const daysInMonth = new Date(year, month + 1, 0).getDate();
  const days: (number | null)[] = [];
  for (let i = 0; i < firstDay; i++) days.push(null);
  for (let i = 1; i <= daysInMonth; i++) days.push(i);
  return days;
}

export default function TerminPage() {
  const { t, lang } = useI18n();
  const router = useRouter();

  // Zugriffs-Check: wenn die Terminseite vom Admin ausgeblendet wurde, duerfen
  // nur Workflow-Buchungen (mit prefill-Token aus dem Fragebogen) rein. Direkte
  // Aufrufe werden auf /dienstleistungen umgeleitet.
  const [accessAllowed, setAccessAllowed] = useState<boolean | null>(null);

  const [step, setStep] = useState<"date" | "time" | "form" | "success">("date");
  const [prefillTokenFromUrl, setPrefillTokenFromUrl] = useState<string | null>(null);
  const [currentMonth, setCurrentMonth] = useState(new Date().getMonth());
  const [currentYear, setCurrentYear] = useState(new Date().getFullYear());
  const [selectedDate, setSelectedDate] = useState<string | null>(null);
  const [selectedTime, setSelectedTime] = useState<string | null>(null);
  const [slots, setSlots] = useState<string[]>([]);
  const [loadingSlots, setLoadingSlots] = useState(false);
  const [formData, setFormData] = useState({ first_name: "", last_name: "", email: "", phone: "", notes: "" });
  const [activeDays, setActiveDays] = useState<number[]>([1, 2, 3, 4, 5]);
  const [blockedDates, setBlockedDates] = useState<string[]>([]);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [emailSuggestion, setEmailSuggestion] = useState<EmailSuggestion | null>(null);
  const [prefilled, setPrefilled] = useState(false);

  // Zugriffs-Check beim Laden: Terminseite-Sichtbarkeit + Workflow-Ausnahme.
  useEffect(() => {
    if (typeof window === "undefined") return;
    const hasToken = !!new URLSearchParams(window.location.search).get("prefill");
    if (hasToken) {
      // Workflow-Buchung: immer erlaubt, unabhaengig vom Sichtbarkeits-Schalter.
      setAccessAllowed(true);
      return;
    }
    fetch("/api/public/settings")
      .then((r) => (r.ok ? r.json() : null))
      .then((d) => {
        if (d && d.termin_page_visible === false) {
          router.replace("/dienstleistungen");
        } else {
          setAccessAllowed(true);
        }
      })
      .catch(() => setAccessAllowed(true));
  }, [router]);

  // Auto-Fill via Prefill-Token (?prefill=<32-hex>)
  // Verwendet window.location statt useSearchParams um Suspense-Boundary zu vermeiden
  useEffect(() => {
    if (typeof window === "undefined") return;
    const params = new URLSearchParams(window.location.search);
    const token = params.get("prefill");
    if (!token) return;
    setPrefillTokenFromUrl(token);
    fetch(`/api/public/prefill?token=${encodeURIComponent(token)}`)
      .then((r) => (r.ok ? r.json() : null))
      .then((data) => {
        if (data && data.email) {
          setFormData((prev) => ({
            ...prev,
            first_name: data.first_name || "",
            last_name: data.last_name || "",
            email: data.email || "",
            phone: data.phone || "",
          }));
          setPrefilled(true);
        }
      })
      .catch(() => {});
  }, []);

  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const days = getCalendarDays(currentYear, currentMonth);

  const WEEKDAYS = lang === "de" ? WEEKDAYS_DE : WEEKDAYS_EN;
  const MONTHS = lang === "de" ? MONTHS_DE : MONTHS_EN;

  const labels = {
    de: {
      heroLabel: "Terminbuchung",
      heroTitle: { before: "Kostenlose ", bold: "Beratung buchen." },
      heroDesc: "Vereinbaren Sie ein unverbindliches Onlinegespräch, bequem von zu Hause aus.",
      step1: "1. Datum wählen",
      step2: "2. Uhrzeit wählen",
      step3: "3. Angaben",
      selectDay: "Wählen Sie einen verfügbaren Werktag",
      back: "← Zurück",
      loadingSlots: "Verfügbare Zeiten werden geladen...",
      noSlots: "An diesem Tag sind leider keine Termine mehr verfügbar.",
      otherDate: "Anderes Datum wählen",
      timeNote: "Alle Zeiten in MEZ · Dauer: ca. 60 Minuten",
      firstName: "Vorname",
      lastName: "Nachname",
      email: "E-Mail",
      phone: "Telefon",
      notes: "Anliegen / Bemerkungen",
      notesPlaceholder: "Optional: Beschreiben Sie kurz Ihr Anliegen",
      submitting: "Wird gebucht...",
      submitBtn: "Termin buchen",
      successTitle: "Termin erfolgreich gebucht!",
      successDesc: "Wir werden uns in Kürze bei Ihnen melden, um den Termin zu bestätigen.",
      backHome: "Zurück zur Startseite",
      consultLabel: "Ihr Beratungsgespräch",
      consultTitle: { before: "Was Sie ", bold: "erwartet." },
      consultSteps: [
        { step: "1", title: "Persönliche Analyse", desc: "Wir besprechen Ihre aktuelle Situation, Ihre Wünsche und Ihre finanziellen Rahmenbedingungen, vertraulich und unverbindlich." },
        { step: "2", title: "Marktvergleich", desc: "Basierend auf Ihren Angaben holen wir die attraktivsten Angebote unserer Partnerbanken, Versicherungen und Pensionskassen ein." },
        { step: "3", title: "Ihre Entscheidung", desc: "Wir präsentieren Ihnen die besten Optionen übersichtlich aufbereitet. Sie wählen, ohne Druck, ohne Kosten." },
      ],
      ctaTitle: { before: "Lieber ", bold: "schriftlich?" },
      ctaDesc: "Senden Sie uns Ihre Anfrage über unser Kontaktformular. Wir melden uns innerhalb von 24 Stunden bei Ihnen.",
      ctaBtn: "Kontaktformular öffnen",
    },
    en: {
      heroLabel: "Appointment booking",
      heroTitle: { before: "Book a free ", bold: "consultation." },
      heroDesc: "Schedule a non-binding online meeting, conveniently from home.",
      step1: "1. Choose date",
      step2: "2. Choose time",
      step3: "3. Your details",
      selectDay: "Select an available weekday",
      back: "← Back",
      loadingSlots: "Loading available times...",
      noSlots: "Unfortunately, no appointments are available on this day.",
      otherDate: "Choose another date",
      timeNote: "All times in CET · Duration: approx. 60 minutes",
      firstName: "First name",
      lastName: "Last name",
      email: "Email",
      phone: "Phone",
      notes: "Concerns / Notes",
      notesPlaceholder: "Optional: Briefly describe your concern",
      submitting: "Booking...",
      submitBtn: "Book appointment",
      successTitle: "Appointment successfully booked!",
      successDesc: "We will contact you shortly to confirm the appointment.",
      backHome: "Back to homepage",
      consultLabel: "Your consultation",
      consultTitle: { before: "What to ", bold: "expect." },
      consultSteps: [
        { step: "1", title: "Personal analysis", desc: "We discuss your current situation, your wishes and your financial framework, confidentially and without obligation." },
        { step: "2", title: "Market comparison", desc: "Based on your information, we obtain the most attractive offers from our partner banks, insurance companies and pension funds." },
        { step: "3", title: "Your decision", desc: "We present you the best options clearly prepared. You choose, no pressure, no costs." },
      ],
      ctaTitle: { before: "Prefer ", bold: "writing?" },
      ctaDesc: "Send us your request via our contact form. We will get back to you within 24 hours.",
      ctaBtn: "Open contact form",
    },
  };

  const l = labels[lang];

  useEffect(() => {
    let cancelled = false;

    function loadAvailability() {
      fetch("/api/public/availability", { cache: "no-store" })
        .then((r) => r.json())
        .then((data) => {
          if (cancelled) return;
          if (Array.isArray(data.activeDays)) setActiveDays(data.activeDays);
          if (Array.isArray(data.blockedDays)) setBlockedDates(data.blockedDays);
        })
        .catch(() => {});
    }

    loadAvailability();

    // Realtime-Refresh: bei Tab-Focus neu laden und alle 30s pollen, solange Tab aktiv ist
    const onVisibility = () => {
      if (document.visibilityState === "visible") loadAvailability();
    };
    document.addEventListener("visibilitychange", onVisibility);

    const poll = setInterval(() => {
      if (document.visibilityState === "visible") loadAvailability();
    }, 30000);

    return () => {
      cancelled = true;
      document.removeEventListener("visibilitychange", onVisibility);
      clearInterval(poll);
    };
  }, []);

  useEffect(() => {
    if (selectedDate) {
      setLoadingSlots(true);
      fetch(`/api/booking?date=${selectedDate}`, { cache: "no-store" })
        .then((r) => r.json())
        .then((data) => {
          setSlots(data.slots || []);
          setLoadingSlots(false);
        })
        .catch(() => setLoadingSlots(false));
    }
  }, [selectedDate]);

  function selectDate(day: number) {
    const d = new Date(currentYear, currentMonth, day);
    if (d < today) return;
    if (!activeDays.includes(d.getDay())) return;
    const dateStr = `${currentYear}-${(currentMonth + 1).toString().padStart(2, "0")}-${day.toString().padStart(2, "0")}`;
    if (blockedDates.includes(dateStr)) return;
    setSelectedDate(dateStr);
    setSelectedTime(null);
    setStep("time");
  }

  function selectTime(time: string) {
    setSelectedTime(time);
    setStep("form");
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setSubmitting(true);
    setError(null);

    // Client-side Mailcheck als letzter Schutz vor Submit
    const sug = suggestEmail(formData.email);
    if (sug && !emailSuggestion) {
      setEmailSuggestion(sug);
      setSubmitting(false);
      return;
    }

    try {
      const res = await fetch("/api/booking", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          date: selectedDate,
          time: selectedTime,
          ...formData,
          lang,
          prefillToken: prefillTokenFromUrl,
        }),
      });

      if (!res.ok) {
        const data = await res.json();
        if (data.emailIssue) {
          // Server hat Email als ungueltig identifiziert (Format/Disposable/no_mx)
          setError(
            lang === "de"
              ? `Email-Problem: ${data.error}. Bitte prüfen Sie Ihre Email-Adresse.`
              : `Email problem: ${data.error}. Please check your email address.`
          );
        } else {
          throw new Error(data.error || (lang === "de" ? "Fehler bei der Buchung" : "Booking error"));
        }
        return;
      }

      setStep("success");
    } catch (err: any) {
      setError(err.message);
    } finally {
      setSubmitting(false);
    }
  }

  function prevMonth() {
    if (currentMonth === 0) {
      setCurrentMonth(11);
      setCurrentYear(currentYear - 1);
    } else {
      setCurrentMonth(currentMonth - 1);
    }
  }

  function nextMonth() {
    if (currentMonth === 11) {
      setCurrentMonth(0);
      setCurrentYear(currentYear + 1);
    } else {
      setCurrentMonth(currentMonth + 1);
    }
  }

  const selectedDateObj = selectedDate ? new Date(selectedDate + "T00:00:00") : null;
  const formattedDate = selectedDateObj
    ? selectedDateObj.toLocaleDateString("de-CH", { day: "2-digit", month: "2-digit", year: "numeric" })
    : "";

  const inputStyle = {
    border: "1px solid #e5e5e5",
    transition: "border-color 0.2s",
  };

  // Solange der Zugriffs-Check laeuft (oder ein Redirect ansteht): nur Header +
  // leerer Main, damit die Buchungsmaske nicht kurz aufblitzt.
  if (accessAllowed === null) {
    return (
      <>
        <Header />
        <main style={{ minHeight: "60vh" }} />
        <Footer />
      </>
    );
  }

  return (
    <>
      <Header />
      <main>
        {/* HERO */}
        <section className="bg-white">
          <div className="max-w-[1400px] mx-auto px-6 lg:px-10 pt-12 lg:pt-20 pb-16 lg:pb-24">
            <ScrollReveal>
              <p className="text-sm uppercase tracking-[0.15em] font-medium mb-4" style={{ color: "#6b6b6b" }}>
                {l.heroLabel}
              </p>
              <h1 className="text-4xl sm:text-5xl md:text-6xl lg:text-7xl leading-[1.05] max-w-3xl" style={{ fontWeight: 300, color: "#1a1a1a" }}>
                {l.heroTitle.before}<span style={{ fontWeight: 600 }}>{l.heroTitle.bold}</span>
              </h1>
              <p className="text-lg mt-4 max-w-2xl" style={{ color: "#6b6b6b" }}>
                {l.heroDesc}
              </p>
            </ScrollReveal>
          </div>
        </section>

        {/* BOOKING WIDGET */}
        <section className="pb-24 lg:pb-32">
          <div className="max-w-[900px] mx-auto px-6 lg:px-10">
            <ScrollReveal>
              {step === "success" ? (
                <div className="p-16 text-center" style={{ backgroundColor: "#f5f5f3" }}>
                  <svg className="w-16 h-16 mx-auto mb-6" fill="none" stroke="#22c55e" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                  </svg>
                  <h3 className="text-xl font-semibold mb-2" style={{ color: "#1a1a1a" }}>{l.successTitle}</h3>
                  <p className="text-sm mb-2" style={{ color: "#6b6b6b" }}>
                    {formattedDate} {lang === "de" ? "um" : "at"} {selectedTime} {lang === "de" ? "Uhr" : ""}
                  </p>
                  <p className="text-sm mb-8" style={{ color: "#6b6b6b" }}>
                    {l.successDesc}
                  </p>
                  <Link
                    href="/"
                    className="inline-flex items-center px-7 py-3.5 text-sm font-medium transition-colors"
                    style={{ backgroundColor: "#000", color: "#fff" }}
                  >
                    {l.backHome}
                  </Link>
                </div>
              ) : (
                <div style={{ border: "1px solid #e5e5e5", borderRadius: 16, overflow: "hidden" }}>
                  {/* Progress Steps */}
                  <div style={{ display: "flex", borderBottom: "1px solid #e5e5e5", background: "#fafafa" }}>
                    {[
                      { key: "date", label: l.step1 },
                      { key: "time", label: l.step2 },
                      { key: "form", label: l.step3 },
                    ].map((s, i) => (
                      <div
                        key={s.key}
                        style={{
                          flex: 1,
                          padding: "14px 16px",
                          fontSize: 13,
                          fontWeight: step === s.key ? 600 : 400,
                          color: step === s.key ? "#1a1a1a" : "#999",
                          borderBottom: step === s.key ? "2px solid #c8553d" : "2px solid transparent",
                          textAlign: "center",
                          cursor: i === 0 ? "pointer" : "default",
                          transition: "all 0.2s",
                        }}
                        onClick={() => { if (i === 0) { setStep("date"); setSelectedDate(null); setSelectedTime(null); } }}
                      >
                        {s.label}
                      </div>
                    ))}
                  </div>

                  <div style={{ padding: 32 }}>
                    {/* STEP 1: DATE */}
                    {step === "date" && (
                      <div>
                        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 24 }}>
                          <button onClick={prevMonth} style={{ background: "none", border: "1px solid #e5e5e5", borderRadius: 8, padding: "8px 14px", cursor: "pointer", fontSize: 14 }}>←</button>
                          <h3 style={{ fontSize: 16, fontWeight: 600, margin: 0 }}>
                            {MONTHS[currentMonth]} {currentYear}
                          </h3>
                          <button onClick={nextMonth} style={{ background: "none", border: "1px solid #e5e5e5", borderRadius: 8, padding: "8px 14px", cursor: "pointer", fontSize: 14 }}>→</button>
                        </div>

                        <div style={{ display: "grid", gridTemplateColumns: "repeat(7, 1fr)", gap: 4, textAlign: "center" }}>
                          {WEEKDAYS.map((d) => (
                            <div key={d} style={{ fontSize: 12, fontWeight: 600, color: "#999", padding: 8 }}>{d}</div>
                          ))}
                          {days.map((day, i) => {
                            if (day === null) return <div key={`empty-${i}`} />;
                            const d = new Date(currentYear, currentMonth, day);
                            const isPast = d < today;
                            const dayStr = `${currentYear}-${(currentMonth + 1).toString().padStart(2, "0")}-${day.toString().padStart(2, "0")}`;
                            const isInactive = !activeDays.includes(d.getDay());
                            const isBlocked = blockedDates.includes(dayStr);
                            const isDisabled = isPast || isInactive || isBlocked;
                            const isToday = d.toDateString() === today.toDateString();

                            return (
                              <button
                                key={day}
                                disabled={isDisabled}
                                onClick={() => selectDate(day)}
                                style={{
                                  width: "100%",
                                  aspectRatio: "1",
                                  display: "flex",
                                  alignItems: "center",
                                  justifyContent: "center",
                                  fontSize: 14,
                                  fontWeight: isToday ? 600 : 400,
                                  border: isToday ? "2px solid #c8553d" : "1px solid transparent",
                                  borderRadius: 8,
                                  background: isDisabled ? "transparent" : "#fff",
                                  color: isDisabled ? "#ddd" : "#1a1a1a",
                                  cursor: isDisabled ? "default" : "pointer",
                                  transition: "all 0.15s",
                                }}
                                onMouseEnter={(e) => { if (!isDisabled) { e.currentTarget.style.background = "#f5f5f3"; e.currentTarget.style.borderColor = "#c8553d"; } }}
                                onMouseLeave={(e) => { if (!isDisabled) { e.currentTarget.style.background = "#fff"; e.currentTarget.style.borderColor = isToday ? "#c8553d" : "transparent"; } }}
                              >
                                {day}
                              </button>
                            );
                          })}
                        </div>

                        <p className="text-center mt-6" style={{ fontSize: 12, color: "#999" }}>
                          {l.selectDay}
                        </p>
                      </div>
                    )}

                    {/* STEP 2: TIME */}
                    {step === "time" && (
                      <div>
                        <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 24 }}>
                          <button
                            onClick={() => { setStep("date"); setSelectedDate(null); }}
                            style={{ background: "none", border: "none", fontSize: 14, color: "#c8553d", cursor: "pointer", padding: 0 }}
                          >
                            {l.back}
                          </button>
                          <span style={{ color: "#ddd" }}>|</span>
                          <span style={{ fontSize: 14, fontWeight: 500 }}>{formattedDate}</span>
                        </div>

                        {loadingSlots ? (
                          <div style={{ textAlign: "center", padding: 40 }}>
                            <p style={{ fontSize: 14, color: "#888" }}>{l.loadingSlots}</p>
                          </div>
                        ) : slots.length === 0 ? (
                          <div style={{ textAlign: "center", padding: 40 }}>
                            <p style={{ fontSize: 14, color: "#888", marginBottom: 16 }}>
                              {l.noSlots}
                            </p>
                            <button
                              onClick={() => { setStep("date"); setSelectedDate(null); }}
                              style={{ fontSize: 14, color: "#c8553d", background: "none", border: "none", cursor: "pointer", fontWeight: 500 }}
                            >
                              {l.otherDate}
                            </button>
                          </div>
                        ) : (
                          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(100px, 1fr))", gap: 8 }}>
                            {slots.map((time) => (
                              <button
                                key={time}
                                onClick={() => selectTime(time)}
                                style={{
                                  padding: "14px 8px",
                                  fontSize: 15,
                                  fontWeight: 500,
                                  border: "1px solid #e5e5e5",
                                  borderRadius: 8,
                                  background: "#fff",
                                  color: "#1a1a1a",
                                  cursor: "pointer",
                                  transition: "all 0.15s",
                                }}
                                onMouseEnter={(e) => { e.currentTarget.style.borderColor = "#c8553d"; e.currentTarget.style.color = "#c8553d"; }}
                                onMouseLeave={(e) => { e.currentTarget.style.borderColor = "#e5e5e5"; e.currentTarget.style.color = "#1a1a1a"; }}
                              >
                                {time}
                              </button>
                            ))}
                          </div>
                        )}

                        <p className="text-center mt-6" style={{ fontSize: 12, color: "#999" }}>
                          {l.timeNote}
                        </p>
                      </div>
                    )}

                    {/* STEP 3: FORM */}
                    {step === "form" && (
                      <div>
                        <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 24 }}>
                          <button
                            onClick={() => setStep("time")}
                            style={{ background: "none", border: "none", fontSize: 14, color: "#c8553d", cursor: "pointer", padding: 0 }}
                          >
                            {l.back}
                          </button>
                          <span style={{ color: "#ddd" }}>|</span>
                          <span style={{ fontSize: 14, fontWeight: 500 }}>{formattedDate}, {selectedTime} {lang === "de" ? "Uhr" : ""}</span>
                        </div>

                        {prefilled && (
                          <div style={{ background: "#f0fdf4", border: "1px solid #bbf7d0", borderRadius: 8, padding: 12, marginBottom: 20 }}>
                            <p style={{ fontSize: 13, color: "#166534", margin: 0 }}>
                              {lang === "de"
                                ? "Ihre Daten aus dem Fragebogen wurden übernommen. Sie können sie unten anpassen."
                                : "Your data from the questionnaire has been applied. You can adjust it below."}
                            </p>
                          </div>
                        )}

                        {error && (
                          <div style={{ background: "#fef2f2", border: "1px solid #fecaca", borderRadius: 8, padding: 12, marginBottom: 20 }}>
                            <p style={{ fontSize: 13, color: "#ef4444", margin: 0 }}>{error}</p>
                          </div>
                        )}

                        <form onSubmit={handleSubmit} className="space-y-5">
                          <div className="grid sm:grid-cols-2 gap-5">
                            <div>
                              <label className="block text-xs uppercase tracking-widest font-medium mb-2" style={{ color: "#6b6b6b" }}>{l.firstName} *</label>
                              <input
                                type="text"
                                required
                                value={formData.first_name}
                                onChange={(e) => setFormData({ ...formData, first_name: e.target.value })}
                                className="w-full px-4 py-3 text-sm outline-none focus:border-[#1a1a1a]"
                                style={inputStyle}
                              />
                            </div>
                            <div>
                              <label className="block text-xs uppercase tracking-widest font-medium mb-2" style={{ color: "#6b6b6b" }}>{l.lastName} *</label>
                              <input
                                type="text"
                                required
                                value={formData.last_name}
                                onChange={(e) => setFormData({ ...formData, last_name: e.target.value })}
                                className="w-full px-4 py-3 text-sm outline-none focus:border-[#1a1a1a]"
                                style={inputStyle}
                              />
                            </div>
                          </div>
                          <div className="grid sm:grid-cols-2 gap-5">
                            <div>
                              <label className="block text-xs uppercase tracking-widest font-medium mb-2" style={{ color: "#6b6b6b" }}>{l.email} *</label>
                              <input
                                type="email"
                                required
                                value={formData.email}
                                onChange={(e) => {
                                  const v = e.target.value;
                                  setFormData({ ...formData, email: v });
                                  setEmailSuggestion(null);
                                }}
                                onBlur={(e) => {
                                  const s = suggestEmail(e.target.value);
                                  setEmailSuggestion(s);
                                }}
                                className="w-full px-4 py-3 text-sm outline-none focus:border-[#1a1a1a]"
                                style={inputStyle}
                              />
                              {emailSuggestion && (
                                <div
                                  style={{
                                    marginTop: 8,
                                    padding: "10px 12px",
                                    background: "#fef3c7",
                                    border: "1px solid #fde68a",
                                    fontSize: 13,
                                    color: "#92400e",
                                    display: "flex",
                                    alignItems: "center",
                                    gap: 8,
                                    flexWrap: "wrap",
                                  }}
                                >
                                  <span>
                                    {lang === "de" ? "Meinten Sie" : "Did you mean"}{" "}
                                    <strong>{emailSuggestion.full}</strong>?
                                  </span>
                                  <button
                                    type="button"
                                    onClick={() => {
                                      setFormData((prev) => ({ ...prev, email: emailSuggestion.full }));
                                      setEmailSuggestion(null);
                                    }}
                                    style={{
                                      background: "#c8553d",
                                      color: "#fff",
                                      border: "none",
                                      padding: "4px 10px",
                                      fontSize: 12,
                                      fontWeight: 600,
                                      cursor: "pointer",
                                    }}
                                  >
                                    {lang === "de" ? "Übernehmen" : "Apply"}
                                  </button>
                                  <button
                                    type="button"
                                    onClick={() => setEmailSuggestion(null)}
                                    style={{
                                      background: "transparent",
                                      color: "#92400e",
                                      border: "none",
                                      fontSize: 12,
                                      cursor: "pointer",
                                      textDecoration: "underline",
                                    }}
                                  >
                                    {lang === "de" ? "Ignorieren" : "Dismiss"}
                                  </button>
                                </div>
                              )}
                            </div>
                            <div>
                              <label className="block text-xs uppercase tracking-widest font-medium mb-2" style={{ color: "#6b6b6b" }}>{l.phone}</label>
                              <input
                                type="tel"
                                value={formData.phone}
                                onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                                className="w-full px-4 py-3 text-sm outline-none focus:border-[#1a1a1a]"
                                style={inputStyle}
                              />
                            </div>
                          </div>
                          <div>
                            <label className="block text-xs uppercase tracking-widest font-medium mb-2" style={{ color: "#6b6b6b" }}>{l.notes}</label>
                            <textarea
                              rows={3}
                              value={formData.notes}
                              onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
                              className="w-full px-4 py-3 text-sm outline-none focus:border-[#1a1a1a] resize-none"
                              style={inputStyle}
                              placeholder={l.notesPlaceholder}
                            />
                          </div>
                          <button
                            type="submit"
                            disabled={submitting}
                            className="inline-flex items-center px-8 py-4 text-sm font-medium transition-colors disabled:opacity-50"
                            style={{ backgroundColor: "#000", color: "#fff" }}
                          >
                            {submitting ? l.submitting : l.submitBtn}
                            {!submitting && (
                              <svg className="w-4 h-4 ml-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 8l4 4m0 0l-4 4m4-4H3" />
                              </svg>
                            )}
                          </button>
                        </form>
                      </div>
                    )}
                  </div>
                </div>
              )}
            </ScrollReveal>
          </div>
        </section>

        {/* WAS ERWARTET SIE */}
        <section className="py-24 lg:py-32" style={{ backgroundColor: "#f5f5f3" }}>
          <div className="max-w-[1400px] mx-auto px-6 lg:px-10">
            <ScrollReveal>
              <p className="text-sm uppercase tracking-[0.15em] font-medium mb-4" style={{ color: "#6b6b6b" }}>
                {l.consultLabel}
              </p>
              <h2 className="text-4xl md:text-5xl leading-[1.1] mb-16 max-w-2xl" style={{ fontWeight: 300 }}>
                {l.consultTitle.before}<span style={{ fontWeight: 600 }}>{l.consultTitle.bold}</span>
              </h2>
            </ScrollReveal>

            <StaggerContainer className="grid md:grid-cols-3 gap-12 max-w-5xl" staggerDelay={0.1}>
              {l.consultSteps.map((item) => (
                <StaggerItem key={item.step}>
                  <div className="text-center">
                    <div className="w-16 h-16 mx-auto mb-6 flex items-center justify-center" style={{ border: "2px solid #000", borderRadius: "50%" }}>
                      <span className="text-xl font-semibold">{item.step}</span>
                    </div>
                    <h3 className="text-lg font-semibold mb-3">{item.title}</h3>
                    <p className="text-sm leading-relaxed" style={{ color: "#6b6b6b" }}>{item.desc}</p>
                  </div>
                </StaggerItem>
              ))}
            </StaggerContainer>
          </div>
        </section>

        {/* CTA */}
        <section className="py-24 lg:py-32 text-white" style={{ backgroundColor: "#000" }}>
          <div className="max-w-3xl mx-auto px-6 lg:px-10 text-center">
            <ScrollReveal>
              <h2 className="text-4xl md:text-5xl leading-[1.15] mb-6" style={{ fontWeight: 300 }}>
                {l.ctaTitle.before}<span style={{ fontWeight: 600 }}>{l.ctaTitle.bold}</span>
              </h2>
              <p className="text-base mb-10 max-w-lg mx-auto leading-relaxed" style={{ color: "#888" }}>
                {l.ctaDesc}
              </p>
              <Link
                href="/kontakt"
                className="inline-flex items-center justify-center px-8 py-4 text-sm font-medium transition-colors"
                style={{ backgroundColor: "#fff", color: "#000" }}
              >
                {l.ctaBtn}
              </Link>
            </ScrollReveal>
          </div>
        </section>
      </main>
      <Footer />
      <WhatsAppButton />
    </>
  );
}
