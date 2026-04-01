"use client";

import { useEffect, useState } from "react";

export default function DokumentePage() {
  const [leads, setLeads] = useState<any[]>([]);

  useEffect(() => {
    fetch("/api/admin/leads").then((r) => r.json()).then((d) => Array.isArray(d) && setLeads(d));
  }, []);

  return (
    <div>
      <p style={{ fontSize: 12, color: "#888", marginBottom: 12, marginTop: 0 }}>Dokumenten-Upload kommt in der nächsten Phase</p>

      <div style={{ background: "#fff", borderRadius: 8, border: "1px solid #e5e5e5", padding: "24px 16px", textAlign: "center" }}>
        <div style={{ fontSize: 36, marginBottom: 8 }}>📁</div>
        <h3 style={{ fontSize: 15, fontWeight: 600, marginBottom: 6, marginTop: 0 }}>Dokumenten-Verwaltung</h3>
        <p style={{ fontSize: 12, color: "#888", maxWidth: 380, margin: "0 auto 16px", lineHeight: 1.5 }}>
          Hier können Sie bald Dokumente pro Kunde hochladen und verwalten — Lohnabrechnungen, Kaufverträge, Grundbuchauszüge etc.
        </p>
        <div style={{ display: "flex", gap: 8, justifyContent: "center", flexWrap: "wrap" }}>
          {["Lohnabrechnungen", "Kaufvertrag", "Grundbuchauszug", "Steuererklärung", "Bankbelege"].map((doc) => (
            <span key={doc} style={{ fontSize: 11, padding: "4px 10px", background: "#f5f5f5", borderRadius: 14, color: "#555" }}>{doc}</span>
          ))}
        </div>
      </div>

      {leads.length > 0 && (
        <div style={{ marginTop: 12 }}>
          <h4 style={{ fontSize: 12, fontWeight: 600, marginBottom: 8 }}>Kontakte ({leads.length})</h4>
          <div style={{ display: "grid", gap: 4 }}>
            {leads.map((lead) => (
              <div key={lead.id} style={{ background: "#fff", borderRadius: 6, border: "1px solid #e5e5e5", padding: "8px 12px", display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                <div>
                  <p style={{ fontSize: 12, fontWeight: 500, margin: 0 }}>{lead.first_name} {lead.last_name}</p>
                  <p style={{ fontSize: 11, color: "#888", margin: 0 }}>Noch keine Dokumente</p>
                </div>
                <span style={{ fontSize: 11, color: "#ccc" }}>0 Dateien</span>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
