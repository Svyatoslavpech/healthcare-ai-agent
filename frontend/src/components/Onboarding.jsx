/**
 * Onboarding Component — First-Time User Setup
 * Multi-step wizard for patient preferences
 * PATH: frontend/src/components/Onboarding.jsx
 */
import { useState } from "react";

export default function Onboarding({ onComplete }) {
  const [step, setStep] = useState(0);
  const [preferences, setPreferences] = useState({
    checkin_time: "09:00",
    reminder_method: "app",
  });

  const steps = [
    {
      title: "Welcome! 👋",
      description: "Let's set up your recovery preferences in 3 quick steps.",
    },
    {
      title: "Check-in Time",
      description: "What time works best for your daily check-in?",
      render: () => (
        <input
          type="time"
          value={preferences.checkin_time}
          onChange={(e) => setPreferences({ ...preferences, checkin_time: e.target.value })}
          style={styles.input}
        />
      ),
    },
    {
      title: "Reminder Method",
      description: "How do you want to receive reminders?",
      render: () => (
        <div style={styles.optionGroup}>
          {["app", "sms", "email"].map((method) => (
            <button
              key={method}
              style={{
                ...styles.optionBtn,
                background: preferences.reminder_method === method ? "#0062FF" : "#E6F0FF",
                color: preferences.reminder_method === method ? "#fff" : "#0062FF",
              }}
              onClick={() => setPreferences({ ...preferences, reminder_method: method })}
            >
              {method === "app" ? "📱 App" : method === "sms" ? "💬 SMS" : "✉️ Email"}
            </button>
          ))}
        </div>
      ),
    },
  ];

  const current = steps[step];
  const progress = ((step + 1) / steps.length) * 100;

  const handleNext = () => {
    if (step < steps.length - 1) {
      setStep(step + 1);
    } else {
      onComplete(preferences);
    }
  };

  return (
    <div style={styles.container}>
      <div style={styles.card}>
        <div style={styles.progressBar}>
          <div style={{ ...styles.progressFill, width: `${progress}%` }} />
        </div>
        <p style={styles.progressText}>Step {step + 1} of {steps.length}</p>
        <h2 style={styles.title}>{current.title}</h2>
        <p style={styles.description}>{current.description}</p>
        {current.render && (
          <div style={styles.fieldArea}>{current.render()}</div>
        )}
        <button style={styles.primaryBtn} onClick={handleNext}>
          {step < steps.length - 1 ? "Continue →" : "Get Started"}
        </button>
      </div>
    </div>
  );
}

const styles = {
  container: { minHeight: "100vh", display: "flex", alignItems: "center", justifyContent: "center", background: "#F4F8FF", fontFamily: "'IBM Plex Sans', Arial, sans-serif" },
  card: { width: 400, maxWidth: "90%", padding: 40, borderRadius: 16, background: "#fff", boxShadow: "0 8px 40px rgba(0,98,255,0.12)" },
  progressBar: { height: 4, background: "#E6F0FF", borderRadius: 2, marginBottom: 4 },
  progressFill: { height: "100%", background: "#0062FF", borderRadius: 2, transition: "width 0.3s" },
  progressText: { fontSize: 12, color: "#999", textAlign: "right", marginBottom: 16 },
  title: { fontSize: 22, fontWeight: 700, color: "#222", marginBottom: 8 },
  description: { fontSize: 14, color: "#595959", marginBottom: 24 },
  fieldArea: { marginBottom: 24 },
  input: { width: "100%", padding: "12px 14px", border: "1.5px solid #ddd", borderRadius: 8, fontSize: 16, boxSizing: "border-box" },
  optionGroup: { display: "flex", gap: 12 },
  optionBtn: { flex: 1, padding: "10px 0", borderRadius: 8, border: "none", fontWeight: 600, fontSize: 14, cursor: "pointer" },
  primaryBtn: { width: "100%", padding: "14px 0", background: "#0062FF", color: "#fff", border: "none", borderRadius: 10, fontSize: 16, fontWeight: 700, cursor: "pointer" },
};
