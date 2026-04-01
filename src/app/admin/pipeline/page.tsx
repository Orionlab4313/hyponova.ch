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
      <p style={{ fontSize: 12, color: "#888", marginBottom: 12, marginTop: 0 }}>Ziehen Sie Kontakte zwischen den Spalten um den Status zu ändern</p>

      <div className="admin-grid-5col" style={{ display: "grid", gridTemplateColumns: `repeat(${columns.length}, minmax(0, 1fr))`, gap: 8, overflowX: "auto" }}>
        {columns.map((col) => {
          const colLeads = leads.filter((l) => l.status === col.id);
          return (
            <div
              key={col.id}
              onDragOver={(e) => e.preventDefault()}
              onDrop={(e) => handleDrop(e, col.id)}
              style={{ background: "#f5f5f5", borderRadius: 8, padding: 8, minHeight: 200 }}
            >
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 8, padding: "0 2px" }}>
                <div style={{ display: "flex", alignItems: "center", gap: 5 }}>
                  <div style={{ width: 7, height: 7, borderRadius: "50%", background: col.color }} />
                  <span style={{ fontSize: 11, fontWeight: 600 }}>{col.label}</span>
                </div>
                <span style={{ fontSize: 10, color: "#888", background: "#e5e5e5", borderRadius: 8, padding: "1px 6px" }}>{colLeads.length}</span>
              </div>

              <div style={{ display: "grid", gap: 5 }}>
                {colLeads.map((lead) => (
                  <div
                    key={lead.id}
                    draggable
                    onDragStart={() => setDragId(lead.id)}
                    onDragEnd={() => setDragId(null)}
                    style={{
                      background: "#fff",
                      borderRadius: 6,
                      padding: "8px 10px",
                      border: "1px solid #e5e5e5",
                      cursor: "grab",
                      opacity: dragId === lead.id ? 0.5 : 1,
                      transition: "opacity 0.15s",
                    }}
                  >
                    <p style={{ fontSize: 12, fontWeight: 500, margin: 0 }}>{lead.first_name} {lead.last_name}</p>
                    {lead.email && <p style={{ fontSize: 11, color: "#888", margin: "2px 0 0" }}>{lead.email}</p>}
                    {lead.phone && <p style={{ fontSize: 11, color: "#888", margin: "1px 0 0" }}>{lead.phone}</p>}
                    {lead.notes && <p style={{ fontSize: 10, color: "#aaa", margin: "3px 0 0", fontStyle: "italic", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{lead.notes.slice(0, 50)}{lead.notes.length > 50 ? "..." : ""}</p>}
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
