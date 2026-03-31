"use client";

import { useEffect, useState } from "react";

interface Lead {
  id: string;
  first_name: string;
  last_name: string;
  email: string;
  phone: string;
  status: string;
  notes: string;
  created_at: string;
}

const columns = [
  { id: "neu", label: "Neue Anfragen", color: "#3b82f6" },
  { id: "kontaktiert", label: "Kontaktiert", color: "#f59e0b" },
  { id: "beratung", label: "In Beratung", color: "#8b5cf6" },
  { id: "offerte", label: "Offerte", color: "#f97316" },
  { id: "abgeschlossen", label: "Abgeschlossen", color: "#22c55e" },
];

export default function PipelinePage() {
  const [leads, setLeads] = useState<Lead[]>([]);
  const [dragId, setDragId] = useState<string | null>(null);

  useEffect(() => {
    fetch("/api/admin/leads").then((r) => r.json()).then((d) => Array.isArray(d) && setLeads(d));
  }, []);

  async function moveToStatus(leadId: string, newStatus: string) {
    await fetch("/api/admin/leads", {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ id: leadId, status: newStatus }),
    });
    setLeads((prev) => prev.map((l) => l.id === leadId ? { ...l, status: newStatus } : l));
  }

  function handleDrop(e: React.DragEvent, status: string) {
    e.preventDefault();
    if (dragId) {
      moveToStatus(dragId, status);
      setDragId(null);
    }
  }

  return (
    <div>
      <p style={{ fontSize: 14, color: "#888", marginBottom: 24 }}>Ziehen Sie Kontakte zwischen den Spalten um den Status zu ändern</p>

      <div style={{ display: "grid", gridTemplateColumns: `repeat(${columns.length}, 1fr)`, gap: 16, minHeight: 500 }}>
        {columns.map((col) => {
          const colLeads = leads.filter((l) => l.status === col.id);
          return (
            <div
              key={col.id}
              onDragOver={(e) => e.preventDefault()}
              onDrop={(e) => handleDrop(e, col.id)}
              style={{ background: "#f5f5f5", borderRadius: 12, padding: 12, minHeight: 400 }}
            >
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 12, padding: "0 4px" }}>
                <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                  <div style={{ width: 8, height: 8, borderRadius: "50%", background: col.color }} />
                  <span style={{ fontSize: 13, fontWeight: 600 }}>{col.label}</span>
                </div>
                <span style={{ fontSize: 12, color: "#888", background: "#e5e5e5", borderRadius: 10, padding: "2px 8px" }}>{colLeads.length}</span>
              </div>

              <div style={{ display: "grid", gap: 8 }}>
                {colLeads.map((lead) => (
                  <div
                    key={lead.id}
                    draggable
                    onDragStart={() => setDragId(lead.id)}
                    onDragEnd={() => setDragId(null)}
                    style={{
                      background: "#fff",
                      borderRadius: 8,
                      padding: 12,
                      border: "1px solid #e5e5e5",
                      cursor: "grab",
                      opacity: dragId === lead.id ? 0.5 : 1,
                      transition: "opacity 0.15s",
                    }}
                  >
                    <p style={{ fontSize: 14, fontWeight: 500, margin: 0 }}>{lead.first_name} {lead.last_name}</p>
                    {lead.email && <p style={{ fontSize: 12, color: "#888", margin: "4px 0 0" }}>{lead.email}</p>}
                    {lead.phone && <p style={{ fontSize: 12, color: "#888", margin: "2px 0 0" }}>{lead.phone}</p>}
                    {lead.notes && <p style={{ fontSize: 11, color: "#aaa", margin: "6px 0 0", fontStyle: "italic" }}>{lead.notes.slice(0, 50)}{lead.notes.length > 50 ? "..." : ""}</p>}
                  </div>
                ))}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
