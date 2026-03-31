"use client";

import { useEffect, useState } from "react";
import Link from "next/link";

interface Stats {
  totalLeads: number;
  newLeads: number;
  appointments: number;
  conversionRate: number;
  messages: number;
}

const statusColors: Record<string, string> = {
  neu: "#3b82f6",
  kontaktiert: "#f59e0b",
  beratung: "#8b5cf6",
  offerte: "#f97316",
  abgeschlossen: "#22c55e",
  verloren: "#ef4444",
};

export default function AdminDashboard() {
  const [stats, setStats] = useState<Stats>({ totalLeads: 0, newLeads: 0, appointments: 0, conversionRate: 0, messages: 0 });
  const [recentLeads, setRecentLeads] = useState<any[]>([]);
  const [recentMessages, setRecentMessages] = useState<any[]>([]);
  const [upcomingAppointments, setUpcomingAppointments] = useState<any[]>([]);

  useEffect(() => {
    fetchData();
  }, []);

  async function fetchData() {
    const [leadsRes, apptRes, msgRes] = await Promise.all([
      fetch("/api/admin/leads"),
      fetch("/api/admin/appointments"),
      fetch("/api/admin/messages"),
    ]);
    const leads = await leadsRes.json();
    const appointments = await apptRes.json();
    const messages = await msgRes.json();

    if (Array.isArray(leads)) {
      const newCount = leads.filter((l: any) => l.status === "neu").length;
      const closedCount = leads.filter((l: any) => l.status === "abgeschlossen").length;
      setStats({
        totalLeads: leads.length,
        newLeads: newCount,
        appointments: Array.isArray(appointments) ? appointments.length : 0,
        conversionRate: leads.length > 0 ? Math.round((closedCount / leads.length) * 100) : 0,
        messages: Array.isArray(messages) ? messages.length : 0,
      });
      setRecentLeads(leads.slice(0, 5));
    }

    if (Array.isArray(messages)) {
      setRecentMessages(messages.slice(0, 5));
    }

    if (Array.isArray(appointments)) {
      const today = new Date().toISOString().split("T")[0];
      setUpcomingAppointments(appointments.filter((a: any) => a.date >= today).slice(0, 5));
    }
  }

  const subjectLabels: Record<string, string> = {
    neukauf: "Eigenheim kaufen",
    abloesung: "Hypothek ablösen",
    beratung: "Beratung",
    sonstiges: "Sonstiges",
  };

  const statCards = [
    { label: "Nachrichten", value: stats.messages, color: "#c8553d", href: "/admin/nachrichten" },
    { label: "Kontakte Total", value: stats.totalLeads, color: "#3b82f6", href: "/admin/leads" },
    { label: "Neue Anfragen", value: stats.newLeads, color: "#f59e0b", href: "/admin/leads" },
    { label: "Termine", value: stats.appointments, color: "#8b5cf6", href: "/admin/kalender" },
    { label: "Abschlussrate", value: `${stats.conversionRate}%`, color: "#22c55e", href: "/admin/pipeline" },
  ];

  return (
    <div>
      {/* Stats Grid */}
      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(180px, 1fr))", gap: 16, marginBottom: 32 }}>
        {statCards.map((stat) => (
          <Link key={stat.label} href={stat.href} style={{ textDecoration: "none" }}>
            <div style={{ background: "#fff", borderRadius: 12, padding: 20, border: "1px solid #e5e5e5", transition: "box-shadow 0.2s" }}
              onMouseEnter={(e) => { e.currentTarget.style.boxShadow = "0 2px 8px rgba(0,0,0,0.06)"; }}
              onMouseLeave={(e) => { e.currentTarget.style.boxShadow = "none"; }}
            >
              <p style={{ fontSize: 12, color: "#888", textTransform: "uppercase", letterSpacing: "0.05em", margin: 0 }}>{stat.label}</p>
              <p style={{ fontSize: 32, fontWeight: 600, color: stat.color, margin: "8px 0 0" }}>{stat.value}</p>
            </div>
          </Link>
        ))}
      </div>

      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 24 }}>
        {/* Recent Messages */}
        <div style={{ background: "#fff", borderRadius: 12, border: "1px solid #e5e5e5", padding: 20 }}>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 16 }}>
            <h3 style={{ fontSize: 15, fontWeight: 600, margin: 0 }}>Neue Nachrichten</h3>
            <Link href="/admin/nachrichten" style={{ fontSize: 12, color: "#c8553d", textDecoration: "none" }}>Alle anzeigen →</Link>
          </div>
          {recentMessages.length === 0 ? (
            <p style={{ fontSize: 13, color: "#999" }}>Noch keine Nachrichten eingegangen</p>
          ) : (
            recentMessages.map((msg: any) => (
              <div key={msg.id} style={{ padding: "10px 0", borderBottom: "1px solid #f0f0f0" }}>
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                  <p style={{ fontSize: 14, fontWeight: 500, margin: 0 }}>{msg.first_name} {msg.last_name}</p>
                  <span style={{ fontSize: 11, color: "#999" }}>
                    {new Date(msg.created_at).toLocaleDateString("de-CH")}
                  </span>
                </div>
                <p style={{ fontSize: 12, color: "#c8553d", margin: "2px 0", fontWeight: 500 }}>
                  {subjectLabels[msg.subject] || msg.subject}
                </p>
                <p style={{ fontSize: 12, color: "#888", margin: 0, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
                  {msg.message}
                </p>
              </div>
            ))
          )}
        </div>

        {/* Upcoming Appointments */}
        <div style={{ background: "#fff", borderRadius: 12, border: "1px solid #e5e5e5", padding: 20 }}>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 16 }}>
            <h3 style={{ fontSize: 15, fontWeight: 600, margin: 0 }}>Nächste Termine</h3>
            <Link href="/admin/kalender" style={{ fontSize: 12, color: "#c8553d", textDecoration: "none" }}>Alle anzeigen →</Link>
          </div>
          {upcomingAppointments.length === 0 ? (
            <p style={{ fontSize: 13, color: "#999" }}>Keine bevorstehenden Termine</p>
          ) : (
            upcomingAppointments.map((appt: any) => (
              <div key={appt.id} style={{ display: "flex", justifyContent: "space-between", alignItems: "center", padding: "10px 0", borderBottom: "1px solid #f0f0f0" }}>
                <div>
                  <p style={{ fontSize: 14, fontWeight: 500, margin: 0 }}>{appt.title}</p>
                  <p style={{ fontSize: 12, color: "#888", margin: "2px 0 0" }}>
                    {appt.leads?.first_name} {appt.leads?.last_name}
                  </p>
                </div>
                <div style={{ textAlign: "right" }}>
                  <p style={{ fontSize: 13, fontWeight: 500, margin: 0 }}>{new Date(appt.date).toLocaleDateString("de-CH")}</p>
                  <p style={{ fontSize: 12, color: "#888", margin: "2px 0 0" }}>{appt.time_start?.slice(0, 5)}</p>
                </div>
              </div>
            ))
          )}
        </div>

        {/* Recent Leads */}
        <div style={{ background: "#fff", borderRadius: 12, border: "1px solid #e5e5e5", padding: 20, gridColumn: "1 / -1" }}>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 16 }}>
            <h3 style={{ fontSize: 15, fontWeight: 600, margin: 0 }}>Letzte Kontakte</h3>
            <Link href="/admin/leads" style={{ fontSize: 12, color: "#c8553d", textDecoration: "none" }}>Alle anzeigen →</Link>
          </div>
          {recentLeads.length === 0 ? (
            <p style={{ fontSize: 13, color: "#999" }}>Noch keine Kontakte vorhanden</p>
          ) : (
            <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(250px, 1fr))", gap: 12 }}>
              {recentLeads.map((lead: any) => (
                <div key={lead.id} style={{ padding: 12, borderRadius: 8, border: "1px solid #f0f0f0" }}>
                  <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                    <p style={{ fontSize: 14, fontWeight: 500, margin: 0 }}>{lead.first_name} {lead.last_name}</p>
                    <span style={{
                      fontSize: 11,
                      padding: "3px 8px",
                      borderRadius: 12,
                      background: `${statusColors[lead.status] || "#888"}20`,
                      color: statusColors[lead.status] || "#888",
                      fontWeight: 500,
                    }}>
                      {lead.status}
                    </span>
                  </div>
                  <p style={{ fontSize: 12, color: "#888", margin: "4px 0 0" }}>{lead.email || lead.phone}</p>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
