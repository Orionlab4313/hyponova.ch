"use client";

import { useEffect, useState } from "react";
import { useConfirm } from "@/components/ui/ConfirmDialog";
import { useToast } from "@/components/ui/Toast";

interface Message {
  id: string;
  first_name: string;
  last_name: string;
  email: string;
  phone: string | null;
  subject: string;
  message: string;
  created_at: string;
  lang: "de" | "en";
}

interface Reply {
  id: string;
  message_id: string;
  reply_text: string;
  sent_at: string;
}

// Subject-Labels nach Sprache der Originalnachricht, wird sowohl in der
// UI als auch im Reply-Subject verwendet, damit EN-Kunden auch eine
// englische "Re: ..." Zeile sehen.
const SUBJECT_LABELS: Record<"de" | "en", Record<string, string>> = {
  de: {
    neukauf: "Eigenheim kaufen",
    abloesung: "Hypothek ablösen",
    beratung: "Allgemeine Beratung",
    sonstiges: "Sonstiges",
  },
  en: {
    neukauf: "Buy a property",
    abloesung: "Refinance mortgage",
    beratung: "General consultation",
    sonstiges: "Other",
  },
};

function subjectLabel(key: string, lang: "de" | "en"): string {
  return SUBJECT_LABELS[lang]?.[key] || key;
}

export default function NachrichtenPage() {
  const [messages, setMessages] = useState<Message[]>([]);
  const [selected, setSelected] = useState<Message | null>(null);
  const [replies, setReplies] = useState<Reply[]>([]);
  const [showReply, setShowReply] = useState(false);
  const [replyText, setReplyText] = useState("");
  const [sending, setSending] = useState(false);
  const [sent, setSent] = useState(false);
  const [showReplyPopup, setShowReplyPopup] = useState<Reply | null>(null);
  const confirm = useConfirm();
  const toast = useToast();

  useEffect(() => {
    fetchMessages();
  }, []);

  async function fetchMessages() {
    const [msgRes, repRes] = await Promise.all([
      fetch("/api/admin/messages"),
      fetch("/api/admin/replies"),
    ]);
    const msgData = await msgRes.json();
    const repData = await repRes.json();
    if (Array.isArray(msgData)) setMessages(msgData);
    if (Array.isArray(repData)) setReplies(repData);
  }

  function getRepliesForMessage(msgId: string): Reply[] {
    return replies.filter((r) => r.message_id === msgId).sort((a, b) => b.sent_at.localeCompare(a.sent_at));
  }

  function hasReply(msgId: string): boolean {
    return replies.some((r) => r.message_id === msgId);
  }

  async function deleteMessage(id: string) {
    const msg = messages.find((m) => m.id === id);
    const ok = await confirm({
      title: "Nachricht löschen?",
      body: msg
        ? `Die Nachricht von «${msg.first_name} ${msg.last_name}» wird endgültig entfernt.`
        : "Die Nachricht wird endgültig entfernt.",
      confirmLabel: "Löschen",
      cancelLabel: "Abbrechen",
      danger: true,
    });
    if (!ok) return;
    const res = await fetch("/api/admin/messages", {
      method: "DELETE",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ id }),
    });
    if (res.ok) {
      toast({ type: "success", message: "Nachricht gelöscht." });
      setSelected(null);
      fetchMessages();
    } else {
      toast({ type: "error", message: "Löschen fehlgeschlagen." });
    }
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
        notes: `Betreff: ${subjectLabel(msg.subject, msg.lang || "de")}\n\n${msg.message}`,
      }),
    });
    toast({ type: "success", message: `${msg.first_name} ${msg.last_name} wurde als Kontakt angelegt.` });
  }

  return (
    <div>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 12 }}>
        <p style={{ fontSize: 12, color: "#888", margin: 0 }}>
          {messages.length} Nachricht{messages.length !== 1 ? "en" : ""} total
        </p>
      </div>

      <div className="admin-grid-2col" style={{ display: "grid", gridTemplateColumns: selected ? "minmax(0, 2fr) minmax(0, 3fr)" : "1fr", gap: 12 }}>
        {/* Messages List */}
        <div style={{ display: "grid", gap: 6 }}>
          {messages.length === 0 ? (
            <div style={{ background: "#fff", borderRadius: 8, border: "1px solid #e5e5e5", padding: 24, textAlign: "center" }}>
              <svg style={{ width: 36, height: 36, margin: "0 auto 10px", display: "block" }} fill="none" stroke="#ccc" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
              </svg>
              <p style={{ fontSize: 13, color: "#999" }}>Noch keine Nachrichten eingegangen</p>
            </div>
          ) : (
            messages.map((msg) => (
              <div
                key={msg.id}
                onClick={() => { setSelected(msg); setShowReply(false); setReplyText(""); setSent(false); }}
                style={{
                  background: selected?.id === msg.id ? "#f8f8f8" : "#fff",
                  borderRadius: 8,
                  border: `1px solid ${selected?.id === msg.id ? "#c8553d" : "#e5e5e5"}`,
                  padding: "10px 12px",
                  cursor: "pointer",
                  transition: "all 0.15s",
                }}
              >
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: 3 }}>
                  <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
                    <p style={{ fontSize: 13, fontWeight: 600, margin: 0 }}>
                      {msg.first_name} {msg.last_name}
                    </p>
                    {hasReply(msg.id) && (
                      <span
                        title="Beantwortet"
                        onClick={(e) => { e.stopPropagation(); setShowReplyPopup(getRepliesForMessage(msg.id)[0]); }}
                        style={{ cursor: "pointer", display: "flex", alignItems: "center" }}
                      >
                        <svg style={{ width: 14, height: 14 }} fill="#22c55e" viewBox="0 0 24 24">
                          <path d="M9 16.17L4.83 12l-1.42 1.41L9 19 21 7l-1.41-1.41L9 16.17z" />
                        </svg>
                      </span>
                    )}
                  </div>
                  <span style={{ fontSize: 10, color: "#999", whiteSpace: "nowrap" }}>
                    {new Date(msg.created_at).toLocaleDateString("de-CH", { day: "2-digit", month: "2-digit", year: "numeric", hour: "2-digit", minute: "2-digit" })}
                  </span>
                </div>
                <p style={{ fontSize: 11, color: "#c8553d", margin: "0 0 2px", fontWeight: 500 }}>
                  {subjectLabel(msg.subject, msg.lang || "de")}
                </p>
                <p style={{ fontSize: 12, color: "#666", margin: 0, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
                  {msg.message}
                </p>
              </div>
            ))
          )}
        </div>

        {/* Message Detail */}
        {selected && (
          <div style={{ background: "#fff", borderRadius: 8, border: "1px solid #e5e5e5", padding: "14px 16px", position: "sticky", top: 64 }}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: 12 }}>
              <div>
                <h3 style={{ fontSize: 15, fontWeight: 600, margin: "0 0 2px" }}>
                  {selected.first_name} {selected.last_name}
                </h3>
                <p style={{ fontSize: 12, color: "#c8553d", margin: 0, fontWeight: 500 }}>
                  {subjectLabel(selected.subject, selected.lang || "de")}
                </p>
              </div>
              <button
                onClick={() => setSelected(null)}
                style={{ background: "none", border: "none", fontSize: 18, color: "#999", cursor: "pointer", padding: 0, lineHeight: 1 }}
              >
                ×
              </button>
            </div>

            <div style={{ display: "grid", gap: 6, marginBottom: 12 }}>
              <div style={{ display: "flex", gap: 6, alignItems: "center" }}>
                <svg style={{ width: 14, height: 14, flexShrink: 0 }} fill="none" stroke="#888" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                </svg>
                <a href={`mailto:${selected.email}`} style={{ fontSize: 12, color: "#3b82f6", textDecoration: "none" }}>{selected.email}</a>
              </div>
              {selected.phone && (
                <div style={{ display: "flex", gap: 6, alignItems: "center" }}>
                  <svg style={{ width: 14, height: 14, flexShrink: 0 }} fill="none" stroke="#888" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" />
                  </svg>
                  <a href={`tel:${selected.phone}`} style={{ fontSize: 12, color: "#3b82f6", textDecoration: "none" }}>{selected.phone}</a>
                </div>
              )}
              <div style={{ display: "flex", gap: 6, alignItems: "center" }}>
                <svg style={{ width: 14, height: 14, flexShrink: 0 }} fill="none" stroke="#888" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
                <span style={{ fontSize: 12, color: "#666" }}>
                  {new Date(selected.created_at).toLocaleDateString("de-CH", { day: "2-digit", month: "2-digit", year: "numeric", hour: "2-digit", minute: "2-digit" })}
                </span>
              </div>
            </div>

            <div style={{ background: "#f9f9f9", borderRadius: 6, padding: 12, marginBottom: 12 }}>
              <p style={{ fontSize: 13, lineHeight: 1.6, margin: 0, whiteSpace: "pre-wrap", color: "#333" }}>
                {selected.message}
              </p>
            </div>

            {/* Reply Form */}
            {showReply ? (
              <div style={{ marginBottom: 8 }}>
                <div style={{ background: "#f9f9f9", borderRadius: 6, padding: 10, marginBottom: 8 }}>
                  <p style={{ fontSize: 11, color: "#888", margin: "0 0 2px" }}>An: {selected.email}</p>
                  <p style={{ fontSize: 11, color: "#888", margin: 0 }}>{(selected.lang || "de") === "en" ? "Subject" : "Betreff"}: Re: {subjectLabel(selected.subject, selected.lang || "de")}, HYPONOVA</p>
                </div>
                <textarea
                  value={replyText}
                  onChange={(e) => setReplyText(e.target.value)}
                  rows={5}
                  autoFocus
                  placeholder="Ihre Antwort schreiben..."
                  style={{ width: "100%", padding: "10px 12px", fontSize: 13, border: "1px solid #ddd", borderRadius: 6, outline: "none", resize: "vertical", boxSizing: "border-box", lineHeight: 1.5 }}
                />
                <div style={{ display: "flex", gap: 6, marginTop: 6 }}>
                  <button
                    onClick={async () => {
                      if (!replyText.trim()) return;
                      setSending(true);
                      try {
                        const res = await fetch("https://dqryxcdwvuborlayjain.supabase.co/functions/v1/on-booking", {
                          method: "POST",
                          headers: { "Content-Type": "application/json" },
                          body: JSON.stringify({
                            action: "reply",
                            to: selected.email,
                            subject: `Re: ${subjectLabel(selected.subject, selected.lang || "de")}, HYPONOVA`,
                            message: replyText,
                            firstName: selected.first_name,
                            lastName: selected.last_name,
                          }),
                        });
                        const data = await res.json();
                        if (data.results?.email === "sent") {
                          // Save reply to DB
                          await fetch("/api/admin/replies", {
                            method: "POST",
                            headers: { "Content-Type": "application/json" },
                            body: JSON.stringify({ message_id: selected.id, reply_text: replyText }),
                          });
                          setSent(true);
                          setReplyText("");
                          fetchMessages();
                          setTimeout(() => { setSent(false); setShowReply(false); }, 2000);
                        } else {
                          toast({ type: "error", message: "Fehler beim Senden: " + (data.results?.email || "Unbekannt") });
                        }
                      } catch { toast({ type: "error", message: "Fehler beim Senden der Antwort." }); }
                      setSending(false);
                    }}
                    disabled={sending || !replyText.trim()}
                    style={{ flex: 1, padding: "8px 12px", fontSize: 12, fontWeight: 500, background: sent ? "#22c55e" : "#1a1a1a", color: "#fff", border: "none", borderRadius: 6, cursor: "pointer", opacity: sending || !replyText.trim() ? 0.5 : 1, transition: "background 0.2s" }}
                  >
                    {sent ? "✓ Gesendet" : sending ? "Wird gesendet..." : "Absenden"}
                  </button>
                  <button
                    onClick={() => { setShowReply(false); setReplyText(""); }}
                    style={{ padding: "8px 12px", fontSize: 12, background: "#f5f5f5", border: "1px solid #ddd", borderRadius: 6, cursor: "pointer" }}
                  >
                    Abbrechen
                  </button>
                </div>
              </div>
            ) : null}

            <div style={{ display: "flex", gap: 6, flexWrap: "wrap" }}>
              {!showReply && (
                <button
                  onClick={() => setShowReply(true)}
                  style={{ flex: 1, display: "flex", alignItems: "center", justifyContent: "center", gap: 5, padding: "8px 12px", fontSize: 12, fontWeight: 500, background: "#1a1a1a", color: "#fff", borderRadius: 6, border: "none", cursor: "pointer", minWidth: 0 }}
                >
                  <svg style={{ width: 12, height: 12, flexShrink: 0 }} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 10l9 6 9-6M3 10v8a2 2 0 002 2h14a2 2 0 002-2v-8" />
                  </svg>
                  Antworten
                </button>
              )}
              <button
                onClick={() => createLeadFromMessage(selected)}
                style={{ padding: "8px 12px", fontSize: 12, fontWeight: 500, background: "#f0fdf4", color: "#22c55e", border: "1px solid #bbf7d0", borderRadius: 6, cursor: "pointer", whiteSpace: "nowrap" }}
              >
                Als Kontakt
              </button>
              <button
                onClick={() => deleteMessage(selected.id)}
                style={{ padding: "8px 12px", fontSize: 12, color: "#ef4444", background: "#fef2f2", border: "1px solid #fecaca", borderRadius: 6, cursor: "pointer" }}
              >
                Löschen
              </button>
            </div>
          </div>
        )}
      </div>

      {/* Reply Popup */}
      {showReplyPopup && (
        <div style={{ position: "fixed", inset: 0, background: "rgba(0,0,0,0.4)", display: "flex", alignItems: "center", justifyContent: "center", zIndex: 100 }}>
          <div className="admin-modal" style={{ background: "#fff", borderRadius: 10, padding: 20, width: "100%", maxWidth: "min(500px, calc(100vw - 32px))" }}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 12 }}>
              <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
                <svg style={{ width: 16, height: 16 }} fill="#22c55e" viewBox="0 0 24 24">
                  <path d="M9 16.17L4.83 12l-1.42 1.41L9 19 21 7l-1.41-1.41L9 16.17z" />
                </svg>
                <h3 style={{ fontSize: 14, fontWeight: 600, margin: 0 }}>Gesendete Antwort</h3>
              </div>
              <button onClick={() => setShowReplyPopup(null)} style={{ background: "none", border: "none", fontSize: 18, color: "#999", cursor: "pointer" }}>×</button>
            </div>
            <p style={{ fontSize: 11, color: "#888", margin: "0 0 8px" }}>
              Gesendet am {new Date(showReplyPopup.sent_at).toLocaleDateString("de-CH", { day: "2-digit", month: "2-digit", year: "numeric", hour: "2-digit", minute: "2-digit" })}
            </p>
            <div style={{ background: "#f9f9f9", borderRadius: 6, padding: 12 }}>
              <p style={{ fontSize: 13, lineHeight: 1.6, margin: 0, whiteSpace: "pre-wrap", color: "#333" }}>
                {showReplyPopup.reply_text}
              </p>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
