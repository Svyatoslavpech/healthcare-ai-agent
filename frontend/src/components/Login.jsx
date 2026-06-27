/**
 * Login Component — Patient Authentication
 * JWT-based login with IBM Blue design system
 */

import { useState, useContext } from "react";
import { AuthContext } from "../context/AuthContext";

const API_URL = process.env.REACT_APP_API_URL || "http://localhost:5000";

export default function Login() {
  const { login }                   = useContext(AuthContext);
  const [email,    setEmail]        = useState("");
  const [password, setPassword]     = useState("");
  const [loading,  setLoading]      = useState(false);
  const [error,    setError]        = useState("");

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError("");

    try {
      const res  = await fetch(`${API_URL}/auth/login`, {
        method:  "POST",
        headers: { "Content-Type": "application/json" },
        body:    JSON.stringify({ email, password }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.message || "Login failed. Please try again.");
      login(data.access_token, data.refresh_token, data.user);
      window.location.href = "/checkin";
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={styles.container}>
      <div style={styles.card}>
        <div style={styles.logoSection}>
          <span style={styles.logo}>🩺</span>
          <h1 style={styles.title}>Post-Discharge Care</h1>
          <p style={styles.subtitle}>Your AI-powered recovery assistant</p>
        </div>

        <form onSubmit={handleSubmit} style={styles.form}>
          <div style={styles.inputGroup}>
            <label style={styles.label}>Email</label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="patient@hospital.com"
              style={styles.input}
              required
            />
          </div>

          <div style={styles.inputGroup}>
            <label style={styles.label}>Password</label>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="••••••••"
              style={styles.input}
              required
            />
          </div>

          {error && <p style={styles.error}>{error}</p>}

          <button
            type="submit"
            style={{ ...styles.primaryBtn, opacity: loading ? 0.7 : 1 }}
            disabled={loading}
          >
            {loading ? "Logging in..." : "Sign In"}
          </button>
        </form>

        <p style={styles.demoHint}>Demo: patient@demo.com / password123</p>
      </div>
    </div>
  );
}

const styles = {
  container:   { minHeight: "100vh", display: "flex", alignItems: "center", justifyContent: "center", background: "#F4F8FF", fontFamily: "'IBM Plex Sans', Arial, sans-serif" },
  card:        { width: 400, maxWidth: "90%", padding: 40, borderRadius: 16, background: "#fff", boxShadow: "0 8px 40px rgba(0,98,255,0.12)", textAlign: "center" },
  logoSection: { marginBottom: 32 },
  logo:        { fontSize: 48, display: "block" },
  title:       { fontSize: 24, fontWeight: 700, color: "#0062FF", margin: "8px 0 4px" },
  subtitle:    { fontSize: 14, color: "#595959" },
  form:        { textAlign: "left" },
  inputGroup:  { marginBottom: 16 },
  label:       { display: "block", fontSize: 14, fontWeight: 600, color: "#222", marginBottom: 4 },
  input:       { width: "100%", padding: "12px 14px", border: "1.5px solid #ddd", borderRadius: 8, fontSize: 16, boxSizing: "border-box" },
  primaryBtn:  { width: "100%", padding: "14px 0", background: "#0062FF", color: "#fff", border: "none", borderRadius: 10, fontSize: 16, fontWeight: 700, cursor: "pointer", marginTop: 8 },
  error:       { color: "#CC0000", fontSize: 14, textAlign: "center", marginTop: 8 },
  demoHint:    { fontSize: 12, color: "#999", marginTop: 16, fontStyle: "italic" },
};
