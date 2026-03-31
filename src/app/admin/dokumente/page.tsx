"use client";

import { useEffect, useState } from "react";

export default function DokumentePage() {
  const [leads, setLeads] = useState<any[]>([]);

  useEffect(() => {
    fetch("/api/admin/leads").then((r) => r.json()).then((d) => Array.isArray(d) && setLeads(d));
  }, []);

  return (
    <div>
      <p style={{ fontSize: 14, color: "#888", marginBottom: 24 }}>Dokumenten-Upload kommt in der nächsten Phase</p>

      <div style={{ background: "#fff", borderRadius: 12, border: "1px solid #e5e5e5", padding: 40, textAlign: "center" }}>
        <div style={{ fontSize: 48, marginBottom: 16 }}>📁</div>
        <h3 style={{ fontSize: 18, fontWeight: 600, marginBottom: 8 }}>Dokumenten-Verwaltung</h3>
        <p style={{ fontSize: 14, color: "#888", maxWidth: 400, margin: "0 auto 24px" }}>
          Hier können Sie bald Dokumente pro Kunde hochladen und verwalten — Lohnabrechnungen, Kaufverträge, Grundbuchauszüge etc.
        </p>
        <div style={{ display: "flex", gap: 16, justifyContent: "center", flexWrap: "wrap" }}>
          {["Lohnabrechnungen", "Kaufvertrag", "Grundbuchauszug", "Steuererklärung", "Bankbelege"].map((doc) => (
            <span key={doc} style={{ fontSize: 12, padding: "6px 14px", background: "#f5f5f5", borderRadius: 20, color: "#555" }}>{doc}</span>
          ))}
        </div>
      </div>

      {leads.length > 0 && (
        <div style={{ marginTop: 24 }}>
          <h4 style={{ fontSize: 14, fontWeight: 600, marginBottom: 12 }}>Kontakte ({leads.length})</h4>
          <div style={{ display: "grid", gap: 8 }}>
            {leads.map((lead) => (
              <div key={lead.id} style={{ background: "#fff", borderRadius: 8, border: "1px solid #e5e5e5", padding: 14, display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                <div>
                  <p style={{ fontSize: 14, fontWeight: 500, margin: 0 }}>{lead.first_name} {lead.last_name}</p>
                  <p style={{ fontSize: 12, color: "#888", margin: 0 }}>Noch keine Dokumente</p>
                </div>
                <span style={{ fontSize: 12, color: "#ccc" }}>0 Dateien</span>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
