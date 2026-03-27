"use client";

import { useState } from "react";
import Header from "@/components/layout/Header";
import Footer from "@/components/layout/Footer";
import WhatsAppButton from "@/components/layout/WhatsAppButton";
import Link from "next/link";
import ScrollReveal from "@/components/ui/ScrollReveal";

export default function KontaktPage() {
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
    // TODO: Supabase integration
    await new Promise((resolve) => setTimeout(resolve, 1000));
    setStatus("success");
  };

  const inputStyle = {
    border: "1px solid #e5e5e5",
    transition: "border-color 0.2s",
  };

  return (
    <>
      <Header />
      <main>
        {/* ── HERO ── */}
        <section className="bg-white">
          <div className="max-w-[1400px] mx-auto px-6 lg:px-10 pt-12 lg:pt-20 pb-16 lg:pb-24">
            <ScrollReveal>
              <p className="text-sm uppercase tracking-[0.15em] font-medium mb-4" style={{ color: "#6b6b6b" }}>
                Kontakt
              </p>
              <h1 className="text-4xl sm:text-5xl md:text-6xl lg:text-7xl leading-[1.05] max-w-3xl" style={{ fontWeight: 300, color: "#1a1a1a" }}>
                Sprechen Sie <span style={{ fontWeight: 600 }}>mit uns.</span>
              </h1>
              <p className="text-lg mt-4 max-w-2xl" style={{ color: "#6b6b6b" }}>
                Haben Sie Fragen zu Ihrer Hypothek? Wir sind für Sie da — kostenlos und unverbindlich.
              </p>
            </ScrollReveal>
          </div>
        </section>

        {/* ── FORM + INFO ── */}
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
                      <h3 className="text-xl font-semibold mb-2">Vielen Dank für Ihre Nachricht.</h3>
                      <p className="text-sm" style={{ color: "#6b6b6b" }}>
                        Wir melden uns innerhalb von 24 Stunden bei Ihnen.
                      </p>
                    </div>
                  ) : (
                    <form onSubmit={handleSubmit} className="space-y-6">
                      <div className="grid sm:grid-cols-2 gap-6">
                        <div>
                          <label className="block text-xs uppercase tracking-widest font-medium mb-2" style={{ color: "#6b6b6b" }}>
                            Vorname *
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
                            Nachname *
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
                            E-Mail *
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
                            Telefon
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
                          Betreff *
                        </label>
                        <select
                          name="subject"
                          required
                          value={formData.subject}
                          onChange={handleChange}
                          className="w-full px-4 py-3 text-sm outline-none focus:border-[#1a1a1a] bg-white"
                          style={inputStyle}
                        >
                          <option value="">Bitte wählen</option>
                          <option value="neukauf">Eigenheim kaufen</option>
                          <option value="abloesung">Hypothek ablösen</option>
                          <option value="beratung">Allgemeine Beratung</option>
                          <option value="sonstiges">Sonstiges</option>
                        </select>
                      </div>
                      <div>
                        <label className="block text-xs uppercase tracking-widest font-medium mb-2" style={{ color: "#6b6b6b" }}>
                          Nachricht *
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
                        {status === "sending" ? "Wird gesendet..." : "Nachricht senden"}
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
                        Adresse
                      </p>
                      <p className="text-base font-semibold">HYPONOVA GmbH</p>
                      <p className="text-sm leading-relaxed mt-1" style={{ color: "#6b6b6b" }}>
                        Dahlienweg 22<br />
                        4313 Möhlin<br />
                        Schweiz
                      </p>
                    </div>
                    <div>
                      <p className="text-xs uppercase tracking-widest font-medium mb-3" style={{ color: "#999" }}>
                        E-Mail
                      </p>
                      <p className="text-sm" style={{ color: "#6b6b6b" }}>
                        info@hyponova.ch
                      </p>
                    </div>
                    <div>
                      <p className="text-xs uppercase tracking-widest font-medium mb-3" style={{ color: "#999" }}>
                        Telefon
                      </p>
                      <p className="text-sm" style={{ color: "#6b6b6b" }}>
                        Wird noch ergänzt
                      </p>
                    </div>
                    <div style={{ borderTop: "1px solid #e5e5e5", paddingTop: "2rem" }}>
                      <p className="text-sm leading-relaxed mb-4" style={{ color: "#6b6b6b" }}>
                        Bevorzugen Sie ein persönliches Gespräch? Buchen Sie direkt einen kostenlosen Beratungstermin.
                      </p>
                      <Link
                        href="/termin"
                        className="inline-flex items-center gap-1 text-sm font-medium hover:gap-2 transition-all"
                        style={{ color: "#c8553d" }}
                      >
                        Termin buchen
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
