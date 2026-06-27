/**
 * Onboarding Component — First-Time User Setup Wizard
 */

import { useState } from "react";

export default function Onboarding({ onComplete }) {
  const [step,  setStep]  = useState(0);
  const [prefs, setPrefs] = useState({ checkin_time: "09:00", reminder_method: "app" });

  const steps = [
    { title: "Welcome! 👋",       desc: "Let's set up your recovery in 3 quick steps.", render: null },
    { title: "Check-in Time",     desc: "What time works best for your daily check-in?",
      render: () => (
        <input type="time" value={prefs.checkin_time}
          onChange={(e) => setPrefs({ ...prefs, checkin_time: e.target.value })}
          style={s.input} />
      ),
    },
    { title: "Reminder Method",   desc: "How do you want to receive reminders?",
      render: () => (
        <div style={{ display: "flex", gap: 12 }}>
          {["app", "sms", "email"].map((m) => (
            <button key={m}
              style={{ flex: 1, padding: "10px 0", borderRadius: 8, border: "none",
                fontWeight: 600, fontSize: 14, cursor: "pointer",
                background: prefs.reminder_method === m ? "#0062FF" : "#E6F0FF",
                color:      prefs.reminder_method === m ? "#fff"    : "#0062FF" }}
              onClick={() => setPrefs({ ...prefs, reminder_method: m })}>
              {m === "app" ? "📱 App" : m === "sms" ? "💬 SMS" : "✉️ Email"}
            </button>
          ))}
        </div>
      ),
    },
  ];

  const cur = steps[step];

  return (
    <div style={s.container}>
      <div style={s.card}>
        <div style={s.bar}><div style={{ ...s.fill, width: `${((step + 1) / steps.length) * 100}%` }} /></div>
        <p style={s.progress}>Step {step + 1} of {steps.length}</p>
        <h2 style={s.title}>{cur.title}</h2>
        <p style={s.desc}>{cur.desc}</p>
        {cur.render && <div style={{ marginBottom: 24 }}>{cur.render()}</div>}
        <button style={s.btn} onClick={() => step < steps.length - 1 ? setStep(step + 1) : onComplete(prefs)}>
          {step < steps.length - 1 ? "Continue →" : "Get Started"}
        </button>
      </div>
    </div>
  );
}

const s = {
  container: { minHeight: "100vh", display: "flex", alignItems: "center", justifyContent: "center", background: "#F4F8FF", fontFamily: "'IBM Plex Sans', Arial, sans-serif" },
  card:      { width: 400, maxWidth: "90%", padding: 40, borderRadius: 16, background: "#fff", boxShadow: "0 8px 40px rgba(0,98,255,0.12)" },
  bar:       { height: 4, background: "#E6F0FF", borderRadius: 2, marginBottom: 4 },
  fill:      { height: "100%", background: "#0062FF", borderRadius: 2, transition: "width 0.3s" },
  progress:  { fontSize: 12, color: "#999", textAlign: "right", marginBottom: 16 },
  title:     { fontSize: 22, fontWeight: 700, color: "#222", marginBottom: 8 },
  desc:      { fontSize: 14, color: "#595959", marginBottom: 24 },
  input:     { width: "100%", padding: "12px 14px", border: "1.5px solid #ddd", borderRadius: 8, fontSize: 16, boxSizing: "border-box" },
  btn:       { width: "100%", padding: "14px 0", background: "#0062FF", color: "#fff", border: "none", borderRadius: 10, fontSize: 16, fontWeight: 700, cursor: "pointer" },
};
