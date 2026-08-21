import { createContext, useContext, useState, useEffect, useCallback } from "react";
import client from "../api/client";

const AuthContext = createContext(null);

// The JWT payload is base64-encoded, not encrypted, so the browser can read the
// expiry claim. This is only used to log out on time — the real check is
// server-side.
function getExpiryMs(token) {
  try {
    const payload = JSON.parse(atob(token.split(".")[1]));
    return payload.exp ? payload.exp * 1000 : null;
  } catch {
    return null;
  }
}

export function AuthProvider({ children }) {
  const [token, setToken] = useState(() => localStorage.getItem("token"));
  const [email, setEmail] = useState(() => localStorage.getItem("email"));

  const logout = useCallback(() => {
    localStorage.removeItem("token");
    localStorage.removeItem("email");
    setToken(null);
    setEmail(null);
  }, []);

  // Sign the user out the moment the token expires, even if they never make a
  // request in the meantime.
  useEffect(() => {
    if (!token) return;

    const expiryMs = getExpiryMs(token);
    if (!expiryMs) return;

    const remaining = expiryMs - Date.now();

    if (remaining <= 0) {
      logout();
      return;
    }

    const timer = setTimeout(logout, remaining);
    return () => clearTimeout(timer);
  }, [token, logout]);

  // Step one of sign-in: the password is checked and a code is emailed.
  // No token is issued here — the session only starts after verifyOtp.
  const login = async (credentials) => {
    const response = await client.post("/login", credentials);
    return response.data;
  };

  const verifyOtp = async (payload) => {
    const response = await client.post("/verify-otp", payload);
    handleAuthSuccess(response.data);
  };

  const register = async (credentials) => {
    const response = await client.post("/register", credentials);
    handleAuthSuccess(response.data);
  };

  const handleAuthSuccess = (data) => {
    localStorage.setItem("token", data.token);
    localStorage.setItem("email", data.email);
    setToken(data.token);
    setEmail(data.email);
  };

  const value = {
    token,
    email,
    login,
    verifyOtp,
    register,
    logout,
    isAuthenticated: !!token,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  return useContext(AuthContext);
}