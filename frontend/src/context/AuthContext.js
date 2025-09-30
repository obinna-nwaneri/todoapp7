import React, { createContext, useCallback, useEffect, useMemo, useState } from "react";

import api from "../utils/api";

const AuthContext = createContext();

const ACCESS_KEY = "todoapp_access_token";
const REFRESH_KEY = "todoapp_refresh_token";
const USER_KEY = "todoapp_user";

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(() => {
    const stored = localStorage.getItem(USER_KEY);
    return stored ? JSON.parse(stored) : null;
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const clearError = useCallback(() => setError(null), []);

  const persistSession = useCallback((data) => {
    if (!data) {
      localStorage.removeItem(ACCESS_KEY);
      localStorage.removeItem(REFRESH_KEY);
      localStorage.removeItem(USER_KEY);
      setUser(null);
      return;
    }
    localStorage.setItem(ACCESS_KEY, data.access);
    localStorage.setItem(REFRESH_KEY, data.refresh);
    localStorage.setItem(USER_KEY, JSON.stringify(data.user));
    setUser(data.user);
  }, []);

  const login = useCallback(
    async (credentials) => {
      setLoading(true);
      clearError();
      try {
        const response = await api.post("login", credentials);
        persistSession(response.data);
        return { success: true };
      } catch (err) {
        const message = err.response?.data?.detail || "Unable to log in.";
        setError(message);
        return { success: false, message };
      } finally {
        setLoading(false);
      }
    },
    [persistSession, clearError]
  );

  const register = useCallback(
    async (payload) => {
      setLoading(true);
      clearError();
      try {
        await api.post("register", payload);
        return login({ username: payload.username, password: payload.password });
      } catch (err) {
        const message = err.response?.data || "Unable to register.";
        setError(typeof message === "string" ? message : "Unable to register.");
        return { success: false, message };
      } finally {
        setLoading(false);
      }
    },
    [login, clearError]
  );

  const logout = useCallback(() => {
    persistSession(null);
  }, [persistSession]);

  useEffect(() => {
    const storedAccess = localStorage.getItem(ACCESS_KEY);
    const storedRefresh = localStorage.getItem(REFRESH_KEY);
    const storedUser = localStorage.getItem(USER_KEY);
    if (!storedAccess || !storedRefresh || !storedUser) {
      persistSession(null);
    } else {
      try {
        setUser(JSON.parse(storedUser));
      } catch (error) {
        persistSession(null);
      }
    }
  }, [persistSession]);

  const value = useMemo(
    () => ({
      user,
      isAuthenticated: Boolean(user),
      isAdmin: Boolean(user?.is_staff),
      login,
      logout,
      register,
      loading,
      error,
      clearError,
    }),
    [user, login, logout, register, loading, error, clearError]
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

export default AuthContext;
