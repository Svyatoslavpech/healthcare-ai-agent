/**
 * Dashboard Component — Recovery Trends Visualization
 * Pain trend + adherence charts using Recharts
 */

import { useState, useEffect } from "react";
import {
  LineChart, Line, BarChart, Bar,
  XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid,
} from "recharts";

const API_URL = process.env.REACT_APP_API_URL || "http://localhost:5000";

export default function Dashboard({ token }) {
  const [metrics, setMetrics] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error,   setError]   = useState(null);

  useEffect(() => { fetchDashboard(); }, [token]); // eslint-disable-line

  const fetchDashboard = async () => {
    try {
      const res = await fetch(`${API_URL}/dashboard/patient`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      if (!res.ok) throw new Error("Failed to load dashboard");
      setMetrics(await res.json());
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  if (loading) return <div style={styles.loader}>Loading dashboard...</div>;
  if (error)   return <div style={styles.error}>Error: {error}</div>;
  if (!metrics) return <div style={styles.error}>No data available</div>;

  const painTrend = metrics.pain_trend || [];

  return (
    <div style={styles.container}>
      <h2 style={styles.header}>📊 Your Recovery Dashboard</h2>

      <div style={styles.kpiRow}>
        {[
          { label: "Adherence",     value: `${metrics.adherence_percentage || 0}%` },
          { label: "Check-ins",     value: metrics.checkins_completed || 0 },
          { label: "Milestones",    value: metrics.milestones_completed || 0 },
          { label: "High-risk alerts", value: metrics.high_risk_flags || 0 },
        ].map(({ label, value }) => (
          <div key={label} style={styles.kpiCard}>
            <span style={styles.kpiLabel}>{label}</span>
            <span style={styles.kpiValue}>{value}</span>
          </div>
        ))}
      </div>

      <div style={styles.chartRow}>
        <div style={styles.chartBox}>
          <h4 style={styles.chartTitle}>Pain Trend (Last 7 Days)</h4>
          <ResponsiveContainer width="100%" height={200}>
            <LineChart data={painTrend.slice(-7)}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="date" />
              <YAxis domain={[0, 10]} />
              <Tooltip />
              <Line type="monotone" dataKey="severity" stroke="#0062FF" strokeWidth={3} dot={{ r: 4 }} />
            </LineChart>
          </ResponsiveContainer>
        </div>

        <div style={styles.chartBox}>
          <h4 style={styles.chartTitle}>Risk Flags by Day</h4>
          <ResponsiveContainer width="100%" height={200}>
            <BarChart data={painTrend.slice(-7)}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="date" />
              <YAxis />
              <Tooltip />
              <Bar dataKey="severity" fill="#00B050" />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>

      <div style={styles.footer}>
        <p style={styles.footerText}>💚 You're on track! Keep up the great work.</p>
        <button style={styles.secondaryBtn} onClick={fetchDashboard}>Refresh</button>
      </div>
    </div>
  );
}

const styles = {
  container:   { maxWidth: 960, margin: "0 auto", padding: 24, fontFamily: "'IBM Plex Sans', Arial, sans-serif" },
  header:      { fontSize: 24, fontWeight: 700, color: "#0062FF", marginBottom: 24 },
  kpiRow:      { display: "grid", gridTemplateColumns: "repeat(4, 1fr)", gap: 16, marginBottom: 24 },
  kpiCard:     { background: "#F4F8FF", borderRadius: 12, padding: 16, textAlign: "center" },
  kpiLabel:    { display: "block", fontSize: 13, color: "#595959" },
  kpiValue:    { display: "block", fontSize: 28, fontWeight: 700, color: "#0062FF" },
  chartRow:    { display: "grid", gridTemplateColumns: "1fr 1fr", gap: 24, marginBottom: 24 },
  chartBox:    { background: "#fff", borderRadius: 12, padding: 16, boxShadow: "0 2px 12px rgba(0,0,0,0.06)" },
  chartTitle:  { fontSize: 14, fontWeight: 600, color: "#222", marginBottom: 8 },
  footer:      { display: "flex", justifyContent: "space-between", alignItems: "center", background: "#E6F0FF", borderRadius: 12, padding: "12px 20px" },
  footerText:  { fontSize: 14, color: "#0062FF", fontWeight: 600 },
  secondaryBtn:{ padding: "8px 24px", background: "transparent", border: "2px solid #0062FF", borderRadius: 8, color: "#0062FF", fontWeight: 600, cursor: "pointer" },
  loader:      { textAlign: "center", fontSize: 18, color: "#595959", padding: 40 },
  error:       { textAlign: "center", fontSize: 18, color: "#CC0000", padding: 40 },
};
