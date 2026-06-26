/**
 * Daily Smart Check-in Component
 * IBM watsonx Orchestrate — Post-Discharge Patient Care Agent
 * Design: IBM Blue #0062FF | Green #00B050 | Yellow #FFC000 | Red #FF0000
 */

import { useState } from "react";

const API_URL = process.env.REACT_APP_API_URL || "http://localhost:5000";

const RISK_CONFIG = {
  low:      { color: "#00B050", icon: "💚", label: "On Track" },
  medium:   { color: "#FFC000", icon: "🟡", label: "Monitor" },
  high:     { color: "#FF0000", icon: "🔴", label: "Alert Sent" },
  critical: { color: "#CC0000", icon: "🚨", label: "URGENT" },
};

export default function Checkin({ patientName, token, onComplete }) {
  const [step,          setStep]          = useState(0);
  const [formData,      setFormData]      = useState({
    symptom_type:  "pain",
    severity:      0,
    temperature_f: null,
    hasFever:      null,
    notes:         "",
  });
  const [result,        setResult]        = useState(null);
  const [submitting,    setSubmitting]    = useState(false);
  const [error,         setError]         = useState(null);

  const questions = [
    {
      id:        "severity",
      question:  "On a scale of 0–10, what's your current pain level?",
      type:      "slider",
    },
    {
      id:        "hasFever",
      question:  "Do you have a fever today?",
      type:      "toggle",
    },
    {
      id:        "temperature_f",
      question:  "What is your temperature (°F)?",
      type:      "number",
      condition: () => formData.hasFever === true,
    },
    {
      id:        "notes",
      question:  "Any other symptoms or concerns you'd like to share?",
      type:      "text",
      optional:  true,
    },
  ];

  const visibleQuestions = questions.filter(
    (q) => !q.condition || q.condition()
  );

  const currentQuestion = visibleQuestions[step];

  const handleAnswer = (value) => {
    setFormData((prev) => ({ ...prev, [currentQuestion.id]: value }));
  };

  const handleNext = () => {
    if (step < visibleQuestions.length - 1) {
      setStep((s) => s + 1);
    } else {
      handleSubmit();
    }
  };

  const handleSubmit = async () => {
    setSubmitting(true);
    setError(null);

    const payload = {
      symptom_type:  formData.symptom_type,
      severity:      formData.severity,
      temperature_f: formData.hasFever ? formData.temperature_f : null,
      notes:         formData.notes,
    };

    try {
      const res = await fetch(`${API_URL}/checkins`, {
        method:  "POST",
        headers: {
          "Content-Type":  "application/json",
          Authorization:   `Bearer ${token}`,
        },
        body: JSON.stringify(payload),
      });

      if (!res.ok) throw new Error("Submission failed");
      const data = await res.json();
      setResult(data);
      if (onComplete) onComplete(data);
    } catch (err) {
      setError("Unable to submit. Please try again or call your care team.");
    } finally {
      setSubmitting(false);
    }
  };

  // ── Result screen ──────────────────────────────────────────────────────────
  if (result) {
    const config = RISK_CONFIG[result.risk_level] || RISK_CONFIG.low;
    return (
      <div style={styles.card}>
        <div style={{ ...styles.riskBadge, background: config.color }}>
          {config.icon} {config.label}
        </div>
        <p style={styles.feedbackMessage}>{result.message}</p>
        {result.escalation && (
          <div style={styles.escalationAlert}>
            🔔 A nurse has been notified and will contact you shortly.
          </div>
        )}
        <p style={styles.nextCheckin}>{result.next_checkin}</p>
        <button style={styles.primaryBtn} onClick={() => setResult(null)}>
          Done
        </button>
      </div>
    );
  }

  // ── Question screen ────────────────────────────────────────────────────────
  return (
    <div style={styles.card}>
      {/* Header */}
      <div style={styles.header}>
        <span style={styles.logo}>🩺</span>
        <h2 style={styles.title}>Daily Recovery Check-in</h2>
        <p style={styles.greeting}>Hi {patientName}! Let's see how you're doing.</p>
      </div>

      {/* Progress */}
      <div style={styles.progressBar}>
        <div
          style={{
            ...styles.progressFill,
            width: `${((step + 1) / visibleQuestions.length) * 100}%`,
          }}
        />
      </div>
      <p style={styles.progressText}>
        Step {step + 1} of {visibleQuestions.length}
      </p>

      {/* Question */}
      {currentQuestion && (
        <div style={styles.questionCard}>
          <p style={styles.question}>{currentQuestion.question}</p>

          {currentQuestion.type === "slider" && (
            <div>
              <input
                type="range"
                min={0}
                max={10}
                step={0.5}
                value={formData[currentQuestion.id] || 0}
                onChange={(e) => handleAnswer(parseFloat(e.target.value))}
                style={styles.slider}
              />
              <div style={styles.sliderLabels}>
                <span>No pain</span>
                <span style={styles.severityValue}>
                  {formData[currentQuestion.id] || 0}/10
                </span>
                <span>Severe</span>
              </div>
            </div>
          )}

          {currentQuestion.type === "toggle" && (
            <div style={styles.toggleRow}>
              {["Yes", "No"].map((opt) => (
                <button
                  key={opt}
                  style={{
                    ...styles.toggleBtn,
                    background:
                      formData[currentQuestion.id] === (opt === "Yes")
                        ? "#0062FF"
                        : "#E6F0FF",
                    color:
                      formData[currentQuestion.id] === (opt === "Yes")
                        ? "#fff"
                        : "#0062FF",
                  }}
                  onClick={() => handleAnswer(opt === "Yes")}
                >
                  {opt}
                </button>
              ))}
            </div>
          )}

          {currentQuestion.type === "number" && (
            <input
              type="number"
              step="0.1"
              placeholder="e.g. 102.0"
              value={formData[currentQuestion.id] || ""}
              onChange={(e) => handleAnswer(parseFloat(e.target.value))}
              style={styles.input}
            />
          )}

          {currentQuestion.type === "text" && (
            <textarea
              placeholder="Optional: describe any other symptoms..."
              value={formData[currentQuestion.id] || ""}
              onChange={(e) => handleAnswer(e.target.value)}
              style={styles.textarea}
            />
          )}
        </div>
      )}

      {error && <p style={styles.error}>{error}</p>}

      <button
        style={styles.primaryBtn}
        onClick={handleNext}
        disabled={submitting}
      >
        {submitting
          ? "Submitting..."
          : step < visibleQuestions.length - 1
          ? "Next →"
          : "Submit Check-in"}
      </button>
    </div>
  );
}

// ── Styles ───────────────────────────────────────────────────────────────────
const styles = {
  card: {
    maxWidth:     480,
    margin:       "0 auto",
    padding:      24,
    borderRadius: 16,
    background:   "#fff",
    boxShadow:    "0 4px 24px rgba(0,0,0,0.10)",
    fontFamily:   "'IBM Plex Sans', Arial, sans-serif",
  },
  header:        { textAlign: "center", marginBottom: 16 },
  logo:          { fontSize: 40 },
  title:         { fontSize: 20, fontWeight: 700, color: "#0062FF", margin: "8px 0 4px" },
  greeting:      { fontSize: 14, color: "#595959" },
  progressBar:   { height: 6, background: "#E6F0FF", borderRadius: 3, marginBottom: 4 },
  progressFill:  { height: "100%", background: "#0062FF", borderRadius: 3, transition: "width .3s" },
  progressText:  { fontSize: 12, color: "#595959", textAlign: "right", marginBottom: 16 },
  questionCard:  { background: "#F4F8FF", borderRadius: 12, padding: 16, marginBottom: 16 },
  question:      { fontSize: 16, fontWeight: 600, color: "#222", marginBottom: 12 },
  slider:        { width: "100%", accentColor: "#0062FF" },
  sliderLabels:  { display: "flex", justifyContent: "space-between", fontSize: 12, color: "#595959", marginTop: 4 },
  severityValue: { fontWeight: 700, color: "#0062FF", fontSize: 18 },
  toggleRow:     { display: "flex", gap: 12 },
  toggleBtn:     { flex: 1, padding: "12px 0", borderRadius: 8, border: "2px solid #0062FF", cursor: "pointer", fontWeight: 600, fontSize: 16, transition: "all .2s" },
  input:         { width: "100%", padding: "10px 12px", border: "1.5px solid #0062FF", borderRadius: 8, fontSize: 16, boxSizing: "border-box" },
  textarea:      { width: "100%", minHeight: 80, padding: "10px 12px", border: "1.5px solid #ddd", borderRadius: 8, fontSize: 14, boxSizing: "border-box", resize: "vertical" },
  primaryBtn:    { width: "100%", padding: "14px 0", background: "#0062FF", color: "#fff", border: "none", borderRadius: 10, fontSize: 16, fontWeight: 700, cursor: "pointer", marginTop: 8 },
  riskBadge:     { textAlign: "center", padding: "10px 20px", borderRadius: 8, color: "#fff", fontWeight: 700, fontSize: 18, marginBottom: 16 },
  feedbackMessage: { fontSize: 16, color: "#222", lineHeight: 1.6, textAlign: "center", marginBottom: 12 },
  escalationAlert: { background: "#FFF3F3", border: "1.5px solid #FF0000", borderRadius: 8, padding: "10px 14px", color: "#CC0000", fontSize: 14, marginBottom: 12 },
  nextCheckin:   { fontSize: 13, color: "#595959", textAlign: "center" },
  error:         { color: "#CC0000", fontSize: 14, textAlign: "center", marginBottom: 8 },
};
