"use client";

import { useEffect, useState } from "react";
import Link from "next/link";

interface Stats {
  totalLeads: number;
  newLeads: number;
  appointments: number;
  conversionRate: number;
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
  const [stats, setStats] = useState<Stats>({ totalLeads: 0, newLeads: 0, appointments: 0, conversionRate: 0 });
  const [recentLeads, setRecentLeads] = useState<any[]>([]);
  const [upcomingAppointments, setUpcomingAppointments] = useState<any[]>([]);

  useEffect(() => {
    fetchData();
  }, []);

  async function fetchData() {
    const [leadsRes, apptRes] = await Promise.all([
      fetch("/api/admin/leads"),
      fetch("/api/admin/appointments"),
    ]);
    const leads = await leadsRes.json();
    const appointments = await apptRes.json();

    if (Array.isArray(leads)) {
      const newCount = leads.filter((l: any) => l.status === "neu").length;
      const closedCount = leads.filter((l: any) => l.status === "abgeschlossen").length;
      setStats({
        totalLeads: leads.length,
        newLeads: newCount,
        appointments: Array.isArray(appointments) ? appointments.length : 0,
        conversionRate: leads.length > 0 ? Math.round((closedCount / leads.length) * 100) : 0,
      });
      setRecentLeads(leads.slice(0, 5));
    }

    if (Array.isArray(appointments)) {
      const today = new Date().toISOString().split("T")[0];
      setUpcomingAppointments(appointments.filter((a: any) => a.date >= today).slice(0, 5));
    }
  }

  const statCards = [
    { label: "Kontakte Total", value: stats.totalLeads, color: "#3b82f6" },
    { label: "Neue Anfragen", value: stats.newLeads, color: "#f59e0b" },
    { label: "Termine", value: stats.appointments, color: "#8b5cf6" },
    { label: "Abschlussrate", value: `${stats.conversionRate}%`, color: "#22c55e" },
  ];

  return (
    <div>
      {/* Stats Grid */}
      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(200px, 1fr))", gap: 16, marginBottom: 32 }}>
        {statCards.map((stat) => (
          <div key={stat.label} style={{ background: "#fff", borderRadius: 12, padding: 20, border: "1px solid #e5e5e5" }}>
            <p style={{ fontSize: 12, color: "#888", textTransform: "uppercase", letterSpacing: "0.05em", margin: 0 }}>{stat.label}</p>
            <p style={{ fontSize: 32, fontWeight: 600, color: stat.color, margin: "8px 0 0" }}>{stat.value}</p>
          </div>
        ))}
      </div>

      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 24 }}>
        {/* Recent Leads */}
        <div style={{ background: "#fff", borderRadius: 12, border: "1px solid #e5e5e5", padding: 20 }}>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 16 }}>
            <h3 style={{ fontSize: 15, fontWeight: 600, margin: 0 }}>Letzte Kontakte</h3>
            <Link href="/admin/leads" style={{ fontSize: 12, color: "#c8553d", textDecoration: "none" }}>Alle anzeigen →</Link>
          </div>
          {recentLeads.length === 0 ? (
            <p style={{ fontSize: 13, color: "#999" }}>Noch keine Kontakte vorhanden</p>
          ) : (
            recentLeads.map((lead) => (
              <div key={lead.id} style={{ display: "flex", justifyContent: "space-between", alignItems: "center", padding: "10px 0", borderBottom: "1px solid #f0f0f0" }}>
                <div>
                  <p style={{ fontSize: 14, fontWeight: 500, margin: 0 }}>{lead.first_name} {lead.last_name}</p>
                  <p style={{ fontSize: 12, color: "#888", margin: "2px 0 0" }}>{lead.email || lead.phone}</p>
                </div>
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
            upcomingAppointments.map((appt) => (
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
      </div>
    </div>
  );
}
