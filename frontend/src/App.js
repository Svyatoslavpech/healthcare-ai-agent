/**
 * App.js — Main React Application with Router
 * Post-Discharge Patient Care Agent
 * Routes: / (Login) → /onboarding → /checkin → /dashboard → /settings
 */

import { useContext } from "react";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { AuthProvider, AuthContext } from "./context/AuthContext";

import Login       from "./components/Login";
import Onboarding  from "./components/Onboarding";
import Checkin     from "./components/Checkin";
import Dashboard   from "./components/Dashboard";
import Settings    from "./components/Settings";

// Protected route wrapper — redirects to login if no token
function ProtectedRoute({ children }) {
  const { token } = useContext(AuthContext);
  return token ? children : <Navigate to="/" replace />;
}

function AppRoutes() {
  const { token, user } = useContext(AuthContext);

  return (
    <BrowserRouter>
      <Routes>
        {/* Public */}
        <Route
          path="/"
          element={token ? <Navigate to="/checkin" replace /> : <Login />}
        />

        {/* Protected — require authentication */}
        <Route
          path="/onboarding"
          element={
            <ProtectedRoute>
              <Onboarding onComplete={() => window.location.href = "/checkin"} />
            </ProtectedRoute>
          }
        />

        <Route
          path="/checkin"
          element={
            <ProtectedRoute>
              <Checkin
                patientName={user?.name || "Patient"}
                token={token}
                onComplete={() => window.location.href = "/dashboard"}
              />
            </ProtectedRoute>
          }
        />

        <Route
          path="/dashboard"
          element={
            <ProtectedRoute>
              <Dashboard token={token} />
            </ProtectedRoute>
          }
        />

        <Route
          path="/settings"
          element={
            <ProtectedRoute>
              <Settings token={token} />
            </ProtectedRoute>
          }
        />

        {/* Fallback */}
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </BrowserRouter>
  );
}

export default function App() {
  return (
    <AuthProvider>
      <AppRoutes />
    </AuthProvider>
  );
}