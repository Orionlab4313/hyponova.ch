"use client";

import { useEffect, useState } from "react";

interface Message {
  id: string;
  first_name: string;
  last_name: string;
  email: string;
  phone: string | null;
  subject: string;
  message: string;
  created_at: string;
}

const subjectLabels: Record<string, string> = {
  neukauf: "Eigenheim kaufen",
  abloesung: "Hypothek ablösen",
  beratung: "Allgemeine Beratung",
  sonstiges: "Sonstiges",
};

export default function NachrichtenPage() {
  const [messages, setMessages] = useState<Message[]>([]);
  const [selected, setSelected] = useState<Message | null>(null);

  useEffect(() => {
    fetchMessages();
  }, []);

  async function fetchMessages() {
    const res = await fetch("/api/admin/messages");
    const data = await res.json();
    if (Array.isArray(data)) setMessages(data);
  }

  async function deleteMessage(id: string) {
    if (!confirm("Nachricht wirklich löschen?")) return;
    await fetch("/api/admin/messages", {
      method: "DELETE",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ id }),
    });
    setSelected(null);
    fetchMessages();
  }

  async function createLeadFromMessage(msg: Message) {
    await fetch("/api/admin/leads", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        first_name: msg.first_name,
        last_name: msg.last_name,
        email: msg.email,
        phone: msg.phone || "",
        status: "neu",
        source: "website",
        notes: `Betreff: ${subjectLabels[msg.subject] || msg.subject}\n\n${msg.message}`,
      }),
    });
    alert(`${msg.first_name} ${msg.last_name} wurde als Kontakt angelegt.`);
  }

  return (
    <div>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 24 }}>
        <p style={{ fontSize: 14, color: "#888", margin: 0 }}>
          {messages.length} Nachricht{messages.length !== 1 ? "en" : ""} total
        </p>
      </div>

      <div style={{ display: "grid", gridTemplateColumns: selected ? "1fr 1fr" : "1fr", gap: 24 }}>
        {/* Messages List */}
        <div style={{ display: "grid", gap: 8 }}>
          {messages.length === 0 ? (
            <div style={{ background: "#fff", borderRadius: 12, border: "1px solid #e5e5e5", padding: 40, textAlign: "center" }}>
              <svg style={{ width: 48, height: 48, margin: "0 auto 16px", display: "block" }} fill="none" stroke="#ccc" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
              </svg>
              <p style={{ fontSize: 14, color: "#999" }}>Noch keine Nachrichten eingegangen</p>
            </div>
          ) : (
            messages.map((msg) => (
              <div
                key={msg.id}
                onClick={() => setSelected(msg)}
                style={{
                  background: selected?.id === msg.id ? "#f8f8f8" : "#fff",
                  borderRadius: 12,
                  border: `1px solid ${selected?.id === msg.id ? "#c8553d" : "#e5e5e5"}`,
                  padding: 16,
                  cursor: "pointer",
                  transition: "all 0.15s",
                }}
              >
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: 6 }}>
                  <p style={{ fontSize: 14, fontWeight: 600, margin: 0 }}>
                    {msg.first_name} {msg.last_name}
                  </p>
                  <span style={{ fontSize: 11, color: "#999", whiteSpace: "nowrap" }}>
                    {new Date(msg.created_at).toLocaleDateString("de-CH", { day: "2-digit", month: "2-digit", year: "numeric", hour: "2-digit", minute: "2-digit" })}
                  </span>
                </div>
                <p style={{ fontSize: 12, color: "#c8553d", margin: "0 0 4px", fontWeight: 500 }}>
                  {subjectLabels[msg.subject] || msg.subject}
                </p>
                <p style={{ fontSize: 13, color: "#666", margin: 0, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
                  {msg.message}
                </p>
              </div>
            ))
          )}
        </div>

        {/* Message Detail */}
        {selected && (
          <div style={{ background: "#fff", borderRadius: 12, border: "1px solid #e5e5e5", padding: 24, position: "sticky", top: 80 }}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: 20 }}>
              <div>
                <h3 style={{ fontSize: 18, fontWeight: 600, margin: "0 0 4px" }}>
                  {selected.first_name} {selected.last_name}
                </h3>
                <p style={{ fontSize: 13, color: "#c8553d", margin: 0, fontWeight: 500 }}>
                  {subjectLabels[selected.subject] || selected.subject}
                </p>
              </div>
              <button
                onClick={() => setSelected(null)}
                style={{ background: "none", border: "none", fontSize: 20, color: "#999", cursor: "pointer" }}
              >
                ×
              </button>
            </div>

            <div style={{ display: "grid", gap: 12, marginBottom: 20 }}>
              <div style={{ display: "flex", gap: 8, alignItems: "center" }}>
                <svg style={{ width: 16, height: 16, flexShrink: 0 }} fill="none" stroke="#888" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                </svg>
                <a href={`mailto:${selected.email}`} style={{ fontSize: 13, color: "#3b82f6", textDecoration: "none" }}>{selected.email}</a>
              </div>
              {selected.phone && (
                <div style={{ display: "flex", gap: 8, alignItems: "center" }}>
                  <svg style={{ width: 16, height: 16, flexShrink: 0 }} fill="none" stroke="#888" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" />
                  </svg>
                  <a href={`tel:${selected.phone}`} style={{ fontSize: 13, color: "#3b82f6", textDecoration: "none" }}>{selected.phone}</a>
                </div>
              )}
              <div style={{ display: "flex", gap: 8, alignItems: "center" }}>
                <svg style={{ width: 16, height: 16, flexShrink: 0 }} fill="none" stroke="#888" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
                <span style={{ fontSize: 13, color: "#666" }}>
                  {new Date(selected.created_at).toLocaleDateString("de-CH", { weekday: "long", day: "2-digit", month: "long", year: "numeric", hour: "2-digit", minute: "2-digit" })}
                </span>
              </div>
            </div>

            <div style={{ background: "#f9f9f9", borderRadius: 8, padding: 16, marginBottom: 20 }}>
              <p style={{ fontSize: 14, lineHeight: 1.7, margin: 0, whiteSpace: "pre-wrap", color: "#333" }}>
                {selected.message}
              </p>
            </div>

            <div style={{ display: "flex", gap: 8 }}>
              <button
                onClick={() => {
                  const subject = encodeURIComponent(`Re: ${subjectLabels[selected.subject] || selected.subject} — HYPONOVA`);
                  const body = encodeURIComponent(`Guten Tag ${selected.first_name} ${selected.last_name},\n\nVielen Dank für Ihre Nachricht.\n\n\n\nFreundliche Grüsse\nSimon Topalli\nHYPONOVA GmbH\n+41 79 249 70 90`);
                  window.open(`https://ksuite.infomaniak.com/1745676/mail/?to=${encodeURIComponent(selected.email)}&subject=${subject}&body=${body}`, "_blank");
                }}
                style={{ flex: 1, display: "flex", alignItems: "center", justifyContent: "center", gap: 6, padding: 12, fontSize: 13, fontWeight: 500, background: "#1a1a1a", color: "#fff", borderRadius: 8, border: "none", cursor: "pointer" }}
              >
                <svg style={{ width: 14, height: 14 }} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 10l9 6 9-6M3 10v8a2 2 0 002 2h14a2 2 0 002-2v-8" />
                </svg>
                Per E-Mail antworten
              </button>
              <button
                onClick={() => createLeadFromMessage(selected)}
                style={{ padding: "12px 16px", fontSize: 13, fontWeight: 500, background: "#f0fdf4", color: "#22c55e", border: "1px solid #bbf7d0", borderRadius: 8, cursor: "pointer" }}
              >
                Als Kontakt anlegen
              </button>
              <button
                onClick={() => deleteMessage(selected.id)}
                style={{ padding: "12px 16px", fontSize: 13, color: "#ef4444", background: "#fef2f2", border: "1px solid #fecaca", borderRadius: 8, cursor: "pointer" }}
              >
                Löschen
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
