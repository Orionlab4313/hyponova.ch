"use client";

import { useState } from "react";
import DialogShell, {
  labelStyle,
  primaryBtnStyle,
  secondaryBtnStyle,
} from "./DialogShell";

interface Props {
  initial?: string | null;
  onClose: () => void;
  onConfirm: (isoDate: string) => void;
}

function pad(n: number): string {
  return String(n).padStart(2, "0");
}

function defaultDateTime(): { date: string; time: string } {
  // Default: morgen 09:00
  const d = new Date();
  d.setDate(d.getDate() + 1);
  d.setHours(9, 0, 0, 0);
  return {
    date: `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}`,
    time: `${pad(d.getHours())}:${pad(d.getMinutes())}`,
  };
}

function parseInitial(iso: string | null | undefined): { date: string; time: string } {
  if (!iso) return defaultDateTime();
  const d = new Date(iso);
  if (isNaN(d.getTime())) return defaultDateTime();
  return {
    date: `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}`,
    time: `${pad(d.getHours())}:${pad(d.getMinutes())}`,
  };
}

export default function ScheduleDialog({ initial, onClose, onConfirm }: Props) {
  const init = parseInitial(initial);
  const [date, setDate] = useState(init.date);
  const [time, setTime] = useState(init.time);
  const [error, setError] = useState("");

  function submit() {
    if (!date) {
      setError("Bitte wähle ein Datum");
      return;
    }
    if (!time) {
      setError("Bitte wähle eine Uhrzeit");
      return;
    }
    // Lokale Zeit parsen und zu ISO konvertieren
    const [y, m, d] = date.split("-").map(Number);
    const [hh, mm] = time.split(":").map(Number);
    if (
      isNaN(y) ||
      isNaN(m) ||
      isNaN(d) ||
      isNaN(hh) ||
      isNaN(mm)
    ) {
      setError("Ungültiges Datum oder Uhrzeit");
      return;
    }
    const dt = new Date(y, m - 1, d, hh, mm, 0, 0);
    if (isNaN(dt.getTime())) {
      setError("Ungültiges Datum oder Uhrzeit");
      return;
    }
    if (dt.getTime() < Date.now() - 60_000) {
      setError("Das Datum liegt in der Vergangenheit");
      return;
    }
    onConfirm(dt.toISOString());
  }

  const inputStyle: React.CSSProperties = {
    width: "100%",
    padding: "12px 14px",
    border: "1px solid #ddd",
    borderRadius: 4,
    fontSize: 16, // iOS Auto-Zoom Fix
    fontFamily: "inherit",
    boxSizing: "border-box",
    background: "#fff",
  };

  return (
    <DialogShell title="Veröffentlichung planen" onClose={onClose} width={440}>
      <p style={{ fontSize: 14, color: "#555", marginBottom: 4, lineHeight: 1.5 }}>
        Der Post erscheint automatisch auf dem Blog sobald das gewählte
        Datum und die Uhrzeit erreicht sind. Kein Cron, kein manueller
        Eingriff nötig.
      </p>

      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 10 }}>
        <div>
          <label style={{ ...labelStyle, marginTop: 14 }}>Datum</label>
          <input
            type="date"
            value={date}
            onChange={(e) => {
              setDate(e.target.value);
              setError("");
            }}
            style={inputStyle}
          />
        </div>
        <div>
          <label style={{ ...labelStyle, marginTop: 14 }}>Uhrzeit</label>
          <input
            type="time"
            value={time}
            onChange={(e) => {
              setTime(e.target.value);
              setError("");
            }}
            style={inputStyle}
          />
        </div>
      </div>

      {error && (
        <div style={{ color: "#c00", fontSize: 13, marginTop: 8 }}>{error}</div>
      )}

      <div
        style={{
          display: "flex",
          justifyContent: "flex-end",
          gap: 8,
          marginTop: 20,
        }}
      >
        <button type="button" onClick={onClose} style={secondaryBtnStyle}>
          Abbrechen
        </button>
        <button type="button" onClick={submit} style={primaryBtnStyle}>
          Planen
        </button>
      </div>
    </DialogShell>
  );
}
