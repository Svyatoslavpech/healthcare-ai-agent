/**
 * AuthContext — JWT Authentication State Management
 * Provides login/logout and token storage across components
 */

import { createContext, useState, useCallback } from "react";

export const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [token, setToken]       = useState(localStorage.getItem("access_token") || null);
  const [user, setUser]         = useState(
    JSON.parse(localStorage.getItem("user") || "null")
  );

  const login = useCallback((accessToken, refreshToken, userData) => {
    localStorage.setItem("access_token",  accessToken);
    localStorage.setItem("refresh_token", refreshToken);
    localStorage.setItem("user",          JSON.stringify(userData));
    setToken(accessToken);
    setUser(userData);
  }, []);

  const logout = useCallback(() => {
    localStorage.removeItem("access_token");
    localStorage.removeItem("refresh_token");
    localStorage.removeItem("user");
    setToken(null);
    setUser(null);
  }, []);

  return (
    <AuthContext.Provider value={{ token, user, login, logout }}>
      {children}
    </AuthContext.Provider>
  );
}
