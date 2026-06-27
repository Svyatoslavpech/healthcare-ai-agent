/**
 * Feedback Component — AI Response Display
 * Shows risk level, empathetic message, and escalation status
 * PATH: frontend/src/components/Feedback.jsx
 */
export default function Feedback({ result, onClose }) {
  if (!result) return null;

  const config = {
    low:      { color: "#00B050", icon: "💚", label: "On Track" },
    medium:   { color: "#FFC000", icon: "🟡", label: "Monitor" },
    high:     { color: "#FF0000", icon: "🔴", label: "Alert Sent" },
    critical: { color: "#CC0000", icon: "🚨", label: "URGENT" },
  };

  const risk = config[result.risk_level] || config.low;

  return (
    <div style={styles.overlay}>
      <div style={styles.modal}>
        <div style={{ ...styles.badge, background: risk.color }}>
          {risk.icon} {risk.label}
        </div>
        <p style={styles.message}>{result.message}</p>

        {result.escalation && (
          <div style={styles.escalationAlert}>
            🔔 A nurse has been notified and will contact you shortly.
          </div>
        )}

        <div style={styles.stats}>
          <div style={styles.statItem}>
            <span style={styles.statLabel}>Risk Level</span>
            <span style={styles.statValue}>{result.risk_level?.toUpperCase()}</span>
          </div>
          <div style={styles.statItem}>
            <span style={styles.statLabel}>Check-in ID</span>
            <span style={styles.statValue}>#{result.checkin_id}</span>
          </div>
        </div>

        <button style={styles.primaryBtn} onClick={onClose}>Done</button>
      </div>
    </div>
  );
}

const styles = {
  overlay: { position: "fixed", top: 0, left: 0, right: 0, bottom: 0, background: "rgba(0,0,0,0.4)", display: "flex", alignItems: "center", justifyContent: "center", zIndex: 999, fontFamily: "'IBM Plex Sans', Arial, sans-serif" },
  modal: { background: "#fff", borderRadius: 16, padding: 32, maxWidth: 480, width: "90%", boxShadow: "0 16px 64px rgba(0,0,0,0.2)", textAlign: "center" },
  badge: { padding: "8px 16px", borderRadius: 8, color: "#fff", fontSize: 18, fontWeight: 700, marginBottom: 16 },
  message: { fontSize: 16, lineHeight: 1.6, color: "#222", marginBottom: 16 },
  escalationAlert: { background: "#FFF3F3", border: "1.5px solid #FF0000", borderRadius: 8, padding: "12px 16px", color: "#CC0000", fontSize: 14, marginBottom: 16, textAlign: "left" },
  stats: { display: "flex", justifyContent: "center", gap: 32, marginBottom: 20, padding: "12px 0", borderTop: "1px solid #eee", borderBottom: "1px solid #eee" },
  statItem: { textAlign: "center" },
  statLabel: { display: "block", fontSize: 12, color: "#999" },
  statValue: { display: "block", fontSize: 16, fontWeight: 700, color: "#222" },
  primaryBtn: { width: "100%", padding: "12px 0", background: "#0062FF", color: "#fff", border: "none", borderRadius: 10, fontSize: 16, fontWeight: 700, cursor: "pointer" },
};
