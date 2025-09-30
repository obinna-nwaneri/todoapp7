import React, { createContext, useCallback, useEffect, useMemo, useState } from "react";

import { getStoredTokens, setStoredTokens, clearStoredTokens } from "../api/client.js";
import { login as loginRequest, register as registerRequest, me as meRequest } from "../api/auth.js";

export const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
  const [tokens, setTokens] = useState(() => getStoredTokens());
  const [user, setUser] = useState(null);
  const [profile, setProfile] = useState(null);
  const [loading, setLoading] = useState(true);

  const fetchMe = useCallback(async () => {
    try {
      const data = await meRequest();
      setUser(data.user);
      setProfile(data.profile);
    } catch (error) {
      console.error("Failed to fetch user", error);
      clearStoredTokens();
      setTokens(null);
      setUser(null);
      setProfile(null);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    if (tokens?.access) {
      fetchMe();
    } else {
      setLoading(false);
    }
  }, [tokens, fetchMe]);

  const handleLogin = useCallback(async (username, password) => {
    const tokenResponse = await loginRequest(username, password);
    setTokens(tokenResponse);
    setStoredTokens(tokenResponse);
    await fetchMe();
    return tokenResponse;
  }, [fetchMe]);

  const handleRegister = useCallback(async (payload) => {
    await registerRequest(payload);
    return handleLogin(payload.username, payload.password);
  }, [handleLogin]);

  const handleLogout = useCallback(() => {
    clearStoredTokens();
    setTokens(null);
    setUser(null);
    setProfile(null);
  }, []);

  const value = useMemo(() => ({
    tokens,
    user,
    profile,
    loading,
    login: handleLogin,
    register: handleRegister,
    logout: handleLogout,
    fetchMe,
  }), [tokens, user, profile, loading, handleLogin, handleRegister, handleLogout, fetchMe]);

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

export const useAuth = () => {
  const context = React.useContext(AuthContext);
  if (!context) {
    throw new Error("useAuth must be used within AuthProvider");
  }
  return context;
};
