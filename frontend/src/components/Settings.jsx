/**
 * Settings Component — Patient Preferences
 * Notification toggles, check-in time, reminder method
 * PATH: frontend/src/components/Settings.jsx
 */
import { useState, useEffect } from "react";

const API_URL = process.env.REACT_APP_API_URL || "http://localhost:5000";

export default function Settings({ token }) {
  const [preferences, setPreferences] = useState({
    checkin_time: "09:00",
    reminder_method: "app",
    notifications_on: true,
  });
  const [loading, setLoading] = useState(false);
  const [saved, setSaved] = useState(false);

  useEffect(() => {
    fetchPreferences();
  }, [token]);

  const fetchPreferences = async () => {
    try {
      const res = await fetch(`${API_URL}/patients/me/preferences`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      if (res.ok) {
        const data = await res.json();
        setPreferences(data);
      }
    } catch (err) {
      console.error("Failed to load preferences", err);
    }
  };

  const handleSave = async () => {
    setLoading(true);
    setSaved(false);
    try {
      const res = await fetch(`${API_URL}/patients/me/preferences`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(preferences),
      });
      if (res.ok) {
        setSaved(true);
        setTimeout(() => setSaved(false), 3000);
      }
    } catch (err) {
      console.error("Failed to save preferences", err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={styles.container}>
      <h2 style={styles.header}>⚙️ Settings & Preferences</h2>
      <div style={styles.card}>
        <div style={styles.settingRow}>
          <div>
            <h4 style={styles.settingLabel}>Check-in Time</h4>
            <p style={styles.settingDesc}>When should we check in with you daily?</p>
          </div>
          <input
            type="time"
            value={preferences.checkin_time}
            onChange={(e) => setPreferences({ ...preferences, checkin_time: e.target.value })}
            style={styles.timeInput}
          />
        </div>

        <div style={styles.settingRow}>
          <div>
            <h4 style={styles.settingLabel}>Reminder Method</h4>
            <p style={styles.settingDesc}>How do you want to receive reminders?</p>
          </div>
          <select
            value={preferences.reminder_method}
            onChange={(e) => setPreferences({ ...preferences, reminder_method: e.target.value })}
            style={styles.select}
          >
            <option value="app">App Notification</option>
            <option value="sms">SMS</option>
            <option value="email">Email</option>
          </select>
        </div>

        <div style={styles.settingRow}>
          <div>
            <h4 style={styles.settingLabel}>Notifications</h4>
            <p style={styles.settingDesc}>Enable or disable all notifications</p>
          </div>
          <input
            type="checkbox"
            checked={preferences.notifications_on}
            onChange={() => setPreferences({ ...preferences, notifications_on: !preferences.notifications_on })}
            style={{ width: 24, height: 24, cursor: "pointer" }}
          />
        </div>

        <button style={styles.primaryBtn} onClick={handleSave} disabled={loading}>
          {loading ? "Saving..." : "Save Settings"}
        </button>
        {saved && <p style={styles.success}>✅ Settings saved successfully!</p>}
      </div>
    </div>
  );
}

const styles = {
  container: { maxWidth: 600, margin: "0 auto", padding: 24, fontFamily: "'IBM Plex Sans', Arial, sans-serif" },
  header: { fontSize: 24, fontWeight: 700, color: "#0062FF", marginBottom: 24 },
  card: { background: "#fff", borderRadius: 16, padding: 24, boxShadow: "0 2px 16px rgba(0,0,0,0.06)" },
  settingRow: { display: "flex", justifyContent: "space-between", alignItems: "center", padding: "16px 0", borderBottom: "1px solid #eee" },
  settingLabel: { fontSize: 14, fontWeight: 600, color: "#222", margin: 0 },
  settingDesc: { fontSize: 12, color: "#999", margin: 0 },
  timeInput: { padding: "6px 12px", border: "1.5px solid #ddd", borderRadius: 6, fontSize: 14 },
  select: { padding: "6px 12px", border: "1.5px solid #ddd", borderRadius: 6, fontSize: 14, background: "#fff" },
  primaryBtn: { width: "100%", padding: "12px 0", background: "#0062FF", color: "#fff", border: "none", borderRadius: 10, fontSize: 16, fontWeight: 700, cursor: "pointer", marginTop: 16 },
  success: { color: "#00B050", fontSize: 14, textAlign: "center", marginTop: 8 },
};
