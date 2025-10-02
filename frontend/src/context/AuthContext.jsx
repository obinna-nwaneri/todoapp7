import React, { createContext, useCallback, useContext, useEffect, useState } from "react";
import { apiRequest, endpoints } from "../api.js";

const AuthContext = createContext(null);

const TOKEN_STORAGE_KEY = "doctor_app_tokens";

const loadStoredTokens = () => {
  const stored = localStorage.getItem(TOKEN_STORAGE_KEY);
  return stored ? JSON.parse(stored) : null;
};

const storeTokens = (tokens) => {
  if (tokens) {
    localStorage.setItem(TOKEN_STORAGE_KEY, JSON.stringify(tokens));
  } else {
    localStorage.removeItem(TOKEN_STORAGE_KEY);
  }
};

export const AuthProvider = ({ children }) => {
  const [tokens, setTokens] = useState(loadStoredTokens);
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const fetchCurrentUser = useCallback(async (activeTokens) => {
    if (!activeTokens) {
      setUser(null);
      setLoading(false);
      return null;
    }
    setLoading(true);
    try {
      const data = await apiRequest(endpoints.me, { token: activeTokens.access });
      setUser(data);
      return data;
    } catch (err) {
      console.error(err);
      setUser(null);
      storeTokens(null);
      setTokens(null);
      throw err;
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchCurrentUser(tokens).catch((err) => console.error(err));
  }, [fetchCurrentUser, tokens]);

  const handleLogin = async (email, password) => {
    setError(null);
    try {
      const data = await apiRequest(endpoints.login, {
        method: "POST",
        body: { email, password }
      });
      const nextTokens = { access: data.access, refresh: data.refresh };
      setTokens(nextTokens);
      storeTokens(nextTokens);
      const profile = await fetchCurrentUser(nextTokens);
      return profile;
    } catch (err) {
      setError(err.message);
      throw err;
    }
  };

  const handleRegister = async (payload) => {
    setError(null);
    try {
      await apiRequest(endpoints.register, { method: "POST", body: payload });
      return await handleLogin(payload.email, payload.password);
    } catch (err) {
      setError(err.message);
      throw err;
    }
  };

  const logout = () => {
    setTokens(null);
    storeTokens(null);
    setUser(null);
  };

  const value = {
    tokens,
    user,
    loading,
    error,
    login: handleLogin,
    register: handleRegister,
    logout,
    refreshUser: () => fetchCurrentUser(tokens)
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
};
