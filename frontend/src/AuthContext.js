import React, { createContext, useCallback, useContext, useMemo, useState } from "react";

const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
  const [tokens, setTokens] = useState(() => {
    const stored = localStorage.getItem("authTokens");
    return stored ? JSON.parse(stored) : null;
  });
  const [user, setUser] = useState(() => {
    const stored = localStorage.getItem("authUser");
    return stored ? JSON.parse(stored) : null;
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const login = useCallback(async (email, password) => {
    setLoading(true);
    setError(null);
    try {
      const response = await fetch("/api/auth/login/", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, password })
      });
      if (!response.ok) {
        const data = await response.json().catch(() => ({ detail: "Unable to login" }));
        throw new Error(data.detail || "Invalid credentials");
      }
      const data = await response.json();
      setTokens({ access: data.access, refresh: data.refresh });
      setUser(data.user);
      localStorage.setItem("authTokens", JSON.stringify({ access: data.access, refresh: data.refresh }));
      localStorage.setItem("authUser", JSON.stringify(data.user));
      return { user: data.user };
    } catch (err) {
      setError(err.message);
      throw err;
    } finally {
      setLoading(false);
    }
  }, []);

  const logout = useCallback(() => {
    setTokens(null);
    setUser(null);
    localStorage.removeItem("authTokens");
    localStorage.removeItem("authUser");
  }, []);

  const value = useMemo(
    () => ({ user, tokens, login, logout, loading, error, setError, setTokens, setUser }),
    [user, tokens, login, logout, loading, error]
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
};
