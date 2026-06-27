/**
 * Settings Component — Patient Preferences
 */

import { useState, useEffect } from "react";

const API_URL = process.env.REACT_APP_API_URL || "http://localhost:5000";

export default function Settings({ token }) {
  const [prefs,   setPrefs]   = useState({ checkin_time: "09:00", reminder_method: "app", notifications_on: true });
  const [loading, setLoading] = useState(false);
  const [saved,   setSaved]   = useState(false);

  useEffect(() => {
    fetch(`${API_URL}/patients/me/preferences`, { headers: { Authorization: `Bearer ${token}` } })
      .then((r) => r.ok ? r.json() : null)
      .then((d) => d && setPrefs(d))
      .catch(() => {});
  }, [token]);

  const handleSave = async () => {
    setLoading(true);
    await fetch(`${API_URL}/patients/me/preferences`, {
      method: "PUT",
      headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}` },
      body: JSON.stringify(prefs),
    }).catch(() => {});
    setSaved(true);
    setTimeout(() => setSaved(false), 3000);
    setLoading(false);
  };

  return (
    <div style={s.container}>
      <h2 style={s.header}>⚙️ Settings & Preferences</h2>
      <div style={s.card}>
        <Row label="Check-in Time" desc="When should we check in daily?">
          <input type="time" value={prefs.checkin_time}
            onChange={(e) => setPrefs({ ...prefs, checkin_time: e.target.value })}
            style={s.input} />
        </Row>
        <Row label="Reminder Method" desc="How do you want reminders?">
          <select value={prefs.reminder_method}
            onChange={(e) => setPrefs({ ...prefs, reminder_method: e.target.value })}
            style={s.input}>
            <option value="app">📱 App</option>
            <option value="sms">💬 SMS</option>
            <option value="email">✉️ Email</option>
          </select>
        </Row>
        <Row label="Notifications" desc="Enable or disable all notifications">
          <input type="checkbox" checked={prefs.notifications_on}
            onChange={() => setPrefs({ ...prefs, notifications_on: !prefs.notifications_on })} />
        </Row>
        <button style={s.btn} onClick={handleSave} disabled={loading}>
          {loading ? "Saving..." : "Save Settings"}
        </button>
        {saved && <p style={{ color: "#00B050", textAlign: "center", marginTop: 8 }}>✅ Saved!</p>}
      </div>
    </div>
  );
}

function Row({ label, desc, children }) {
  return (
    <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", padding: "12px 0", borderBottom: "1px solid #eee" }}>
      <div>
        <div style={{ fontWeight: 600, fontSize: 14 }}>{label}</div>
        <div style={{ fontSize: 12, color: "#999" }}>{desc}</div>
      </div>
      {children}
    </div>
  );
}

const s = {
  container: { maxWidth: 600, margin: "0 auto", padding: 24, fontFamily: "'IBM Plex Sans', Arial, sans-serif" },
  header:    { fontSize: 24, fontWeight: 700, color: "#0062FF", marginBottom: 24 },
  card:      { background: "#fff", borderRadius: 16, padding: 24, boxShadow: "0 2px 16px rgba(0,0,0,0.06)" },
  input:     { padding: "6px 12px", border: "1.5px solid #ddd", borderRadius: 6, fontSize: 14 },
  btn:       { width: "100%", padding: "12px 0", background: "#0062FF", color: "#fff", border: "none", borderRadius: 10, fontSize: 16, fontWeight: 700, cursor: "pointer", marginTop: 16 },
};
