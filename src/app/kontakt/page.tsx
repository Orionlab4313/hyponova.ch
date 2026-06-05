"use client";

import { useState } from "react";
import Header from "@/components/layout/Header";
import Footer from "@/components/layout/Footer";
import WhatsAppButton from "@/components/layout/WhatsAppButton";
import Link from "next/link";
import ScrollReveal from "@/components/ui/ScrollReveal";
import { useI18n } from "@/i18n/context";

export default function KontaktPage() {
  const { t, lang } = useI18n();

  const [formData, setFormData] = useState({
    firstName: "",
    lastName: "",
    email: "",
    phone: "",
    subject: "",
    message: "",
  });
  const [status, setStatus] = useState<"idle" | "sending" | "success" | "error">("idle");

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    setFormData((prev) => ({ ...prev, [e.target.name]: e.target.value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setStatus("sending");
    try {
      const res = await fetch("/api/contact", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          first_name: formData.firstName,
          last_name: formData.lastName,
          email: formData.email,
          phone: formData.phone,
          subject: formData.subject,
          message: formData.message,
          lang,
        }),
      });
      if (!res.ok) throw new Error("Fehler beim Senden");
      setStatus("success");
    } catch {
      setStatus("error");
    }
  };

  const inputStyle = {
    border: "1px solid #e5e5e5",
    transition: "border-color 0.2s",
  };

  const heroHeading = {
    de: { before: "Sprechen Sie ", bold: "mit uns." },
    en: { before: "Get in ", bold: "touch." },
  };

  const heroDesc = {
    de: "Haben Sie Fragen zu Ihrer Hypothek? Wir sind für Sie da, kostenlos und unverbindlich.",
    en: "Have questions about your mortgage? We are here for you, free and non-binding.",
  };

  const successTitle = {
    de: "Vielen Dank für Ihre Nachricht.",
    en: "Thank you for your message.",
  };

  const successDesc = {
    de: "Wir melden uns innerhalb von 24 Stunden bei Ihnen.",
    en: "We will get back to you within 24 hours.",
  };

  const errorTitle = {
    de: "Ein Fehler ist aufgetreten.",
    en: "An error occurred.",
  };

  const errorDesc = {
    de: "Bitte versuchen Sie es erneut oder kontaktieren Sie uns telefonisch.",
    en: "Please try again or contact us by phone.",
  };

  const retryLabel = {
    de: "Erneut versuchen",
    en: "Try again",
  };

  const sendingLabel = {
    de: "Wird gesendet...",
    en: "Sending...",
  };

  const subjectPlaceholder = {
    de: "Bitte wählen",
    en: "Please select",
  };

  const subjectOptions = {
    de: [
      { value: "neukauf", label: "Eigenheim kaufen" },
      { value: "abloesung", label: "Hypothek ablösen" },
      { value: "beratung", label: "Allgemeine Beratung" },
      { value: "sonstiges", label: "Sonstiges" },
    ],
    en: [
      { value: "neukauf", label: "Buy a property" },
      { value: "abloesung", label: "Refinance mortgage" },
      { value: "beratung", label: "General consultation" },
      { value: "sonstiges", label: "Other" },
    ],
  };

  const addressLabel = {
    de: "Adresse",
    en: "Address",
  };

  const emailLabel = {
    de: "E-Mail",
    en: "Email",
  };

  const phoneLabel = {
    de: "Telefon",
    en: "Phone",
  };

  const preferPersonal = {
    de: "Bevorzugen Sie ein persönliches Gespräch? Buchen Sie direkt einen kostenlosen Beratungstermin.",
    en: "Prefer a personal conversation? Book a free consultation appointment directly.",
  };

  return (
    <>
      <Header />
      <main>
        {/* -- HERO -- */}
        <section className="bg-white">
          <div className="max-w-[1400px] mx-auto px-6 lg:px-10 pt-12 lg:pt-20 pb-16 lg:pb-24">
            <ScrollReveal>
              <p className="text-sm uppercase tracking-[0.15em] font-medium mb-4" style={{ color: "#6b6b6b" }}>
                {t.contact.title}
              </p>
              <h1 className="text-4xl sm:text-5xl md:text-6xl lg:text-7xl leading-[1.05] max-w-3xl" style={{ fontWeight: 300, color: "#1a1a1a" }}>
                {heroHeading[lang].before}<span style={{ fontWeight: 600 }}>{heroHeading[lang].bold}</span>
              </h1>
              <p className="text-lg mt-4 max-w-2xl" style={{ color: "#6b6b6b" }}>
                {heroDesc[lang]}
              </p>
            </ScrollReveal>
          </div>
        </section>

        {/* -- FORM + INFO -- */}
        <section className="pb-24 lg:pb-32">
          <div className="max-w-[1400px] mx-auto px-6 lg:px-10">
            <div className="grid lg:grid-cols-3 gap-16">
              {/* Form */}
              <div className="lg:col-span-2">
                <ScrollReveal>
                  {status === "success" ? (
                    <div className="p-12 text-center" style={{ backgroundColor: "#f5f5f3" }}>
                      <svg className="w-12 h-12 mx-auto mb-4" fill="none" stroke="#4ade80" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                      </svg>
                      <h3 className="text-xl font-semibold mb-2">{successTitle[lang]}</h3>
                      <p className="text-sm" style={{ color: "#6b6b6b" }}>
                        {successDesc[lang]}
                      </p>
                    </div>
                  ) : status === "error" ? (
                    <div className="p-12 text-center" style={{ backgroundColor: "#fef2f2" }}>
                      <svg className="w-12 h-12 mx-auto mb-4" fill="none" stroke="#ef4444" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                      </svg>
                      <h3 className="text-xl font-semibold mb-2">{errorTitle[lang]}</h3>
                      <p className="text-sm mb-4" style={{ color: "#6b6b6b" }}>
                        {errorDesc[lang]}
                      </p>
                      <button
                        onClick={() => setStatus("idle")}
                        className="text-sm font-medium"
                        style={{ color: "#c8553d" }}
                      >
                        {retryLabel[lang]}
                      </button>
                    </div>
                  ) : (
                    <form onSubmit={handleSubmit} className="space-y-6">
                      <div className="grid sm:grid-cols-2 gap-6">
                        <div>
                          <label className="block text-xs uppercase tracking-widest font-medium mb-2" style={{ color: "#6b6b6b" }}>
                            {t.contact.firstName} *
                          </label>
                          <input
                            type="text"
                            name="firstName"
                            required
                            value={formData.firstName}
                            onChange={handleChange}
                            className="w-full px-4 py-3 text-sm outline-none focus:border-[#1a1a1a]"
                            style={inputStyle}
                          />
                        </div>
                        <div>
                          <label className="block text-xs uppercase tracking-widest font-medium mb-2" style={{ color: "#6b6b6b" }}>
                            {t.contact.lastName} *
                          </label>
                          <input
                            type="text"
                            name="lastName"
                            required
                            value={formData.lastName}
                            onChange={handleChange}
                            className="w-full px-4 py-3 text-sm outline-none focus:border-[#1a1a1a]"
                            style={inputStyle}
                          />
                        </div>
                      </div>
                      <div className="grid sm:grid-cols-2 gap-6">
                        <div>
                          <label className="block text-xs uppercase tracking-widest font-medium mb-2" style={{ color: "#6b6b6b" }}>
                            {t.contact.email} *
                          </label>
                          <input
                            type="email"
                            name="email"
                            required
                            value={formData.email}
                            onChange={handleChange}
                            className="w-full px-4 py-3 text-sm outline-none focus:border-[#1a1a1a]"
                            style={inputStyle}
                          />
                        </div>
                        <div>
                          <label className="block text-xs uppercase tracking-widest font-medium mb-2" style={{ color: "#6b6b6b" }}>
                            {t.contact.phone}
                          </label>
                          <input
                            type="tel"
                            name="phone"
                            value={formData.phone}
                            onChange={handleChange}
                            className="w-full px-4 py-3 text-sm outline-none focus:border-[#1a1a1a]"
                            style={inputStyle}
                          />
                        </div>
                      </div>
                      <div>
                        <label className="block text-xs uppercase tracking-widest font-medium mb-2" style={{ color: "#6b6b6b" }}>
                          {t.contact.subject} *
                        </label>
                        <select
                          name="subject"
                          required
                          value={formData.subject}
                          onChange={handleChange}
                          className="w-full px-4 py-3 text-sm outline-none focus:border-[#1a1a1a] bg-white"
                          style={inputStyle}
                        >
                          <option value="">{subjectPlaceholder[lang]}</option>
                          {subjectOptions[lang].map((opt) => (
                            <option key={opt.value} value={opt.value}>{opt.label}</option>
                          ))}
                        </select>
                      </div>
                      <div>
                        <label className="block text-xs uppercase tracking-widest font-medium mb-2" style={{ color: "#6b6b6b" }}>
                          {t.contact.message} *
                        </label>
                        <textarea
                          name="message"
                          required
                          rows={5}
                          value={formData.message}
                          onChange={handleChange}
                          className="w-full px-4 py-3 text-sm outline-none focus:border-[#1a1a1a] resize-none"
                          style={inputStyle}
                        />
                      </div>
                      <button
                        type="submit"
                        disabled={status === "sending"}
                        className="inline-flex items-center px-8 py-4 text-sm font-medium transition-colors disabled:opacity-50"
                        style={{ backgroundColor: "#000", color: "#fff" }}
                      >
                        {status === "sending" ? sendingLabel[lang] : t.contact.send}
                        {status !== "sending" && (
                          <svg className="w-4 h-4 ml-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 8l4 4m0 0l-4 4m4-4H3" />
                          </svg>
                        )}
                      </button>
                    </form>
                  )}
                </ScrollReveal>
              </div>

              {/* Contact Info */}
              <div>
                <ScrollReveal delay={0.2}>
                  <div className="space-y-10">
                    <div>
                      <p className="text-xs uppercase tracking-widest font-medium mb-3" style={{ color: "#999" }}>
                        {addressLabel[lang]}
                      </p>
                      <p className="text-base font-semibold">{t.footer.company}</p>
                      <p className="text-sm leading-relaxed mt-1" style={{ color: "#6b6b6b" }}>
                        Dahlienweg 22<br />
                        4313 Möhlin<br />
                        {lang === "de" ? "Schweiz" : "Switzerland"}
                      </p>
                    </div>
                    <div>
                      <p className="text-xs uppercase tracking-widest font-medium mb-3" style={{ color: "#999" }}>
                        {emailLabel[lang]}
                      </p>
                      <p className="text-sm" style={{ color: "#6b6b6b" }}>
                        info@hyponova.ch
                      </p>
                    </div>
                    <div>
                      <p className="text-xs uppercase tracking-widest font-medium mb-3" style={{ color: "#999" }}>
                        {phoneLabel[lang]}
                      </p>
                      <a href="tel:+41791307000" className="text-sm hover:text-[#c8553d] transition-colors" style={{ color: "#6b6b6b" }}>
                        +41 79 130 70 00
                      </a>
                    </div>
                    <div style={{ borderTop: "1px solid #e5e5e5", paddingTop: "2rem" }}>
                      <p className="text-sm leading-relaxed mb-4" style={{ color: "#6b6b6b" }}>
                        {preferPersonal[lang]}
                      </p>
                      <Link
                        href="/termin"
                        className="inline-flex items-center gap-1 text-sm font-medium hover:gap-2 transition-all"
                        style={{ color: "#c8553d" }}
                      >
                        {t.booking.title}
                        <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 8l4 4m0 0l-4 4m4-4H3" />
                        </svg>
                      </Link>
                    </div>
                  </div>
                </ScrollReveal>
              </div>
            </div>
          </div>
        </section>
      </main>
      <Footer />
      <WhatsAppButton />
    </>
  );
}
