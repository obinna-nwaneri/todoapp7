import { createContext, useCallback, useContext, useEffect, useMemo, useState } from "react";

import * as authApi from "../api/auth.js";
import { getTokenStore, setTokenStore, subscribeTokenChange } from "../api/client.js";

const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
  const [tokens, setTokens] = useState(() => getTokenStore());
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const unsubscribe = subscribeTokenChange((nextTokens) => {
      setTokens(nextTokens);
    });
    return unsubscribe;
  }, []);

  const fetchMe = useCallback(async () => {
    if (!tokens?.access) {
      setUser(null);
      setLoading(false);
      return null;
    }
    setLoading(true);
    try {
      const data = await authApi.me();
      setUser({ ...data.user, profile: data.profile });
      setError(null);
      return data;
    } catch (err) {
      setUser(null);
      setTokenStore({ access: null, refresh: null });
      return null;
    } finally {
      setLoading(false);
    }
  }, [tokens?.access]);

  useEffect(() => {
    fetchMe();
  }, [fetchMe]);

  const login = useCallback(
    async (username, password) => {
      const data = await authApi.login(username, password);
      setTokenStore({ access: data.access, refresh: data.refresh });
      setTokens(getTokenStore());
      await fetchMe();
      return data;
    },
    [fetchMe]
  );

  const register = useCallback(
    async (payload) => {
      await authApi.register(payload);
      return login(payload.username, payload.password);
    },
    [login]
  );

  const logout = useCallback(() => {
    setTokenStore({ access: null, refresh: null });
    setTokens(getTokenStore());
    setUser(null);
  }, []);

  const value = useMemo(
    () => ({
      tokens,
      user,
      role: user?.profile?.role ?? null,
      loading,
      error,
      login,
      register,
      logout,
      fetchMe,
    }),
    [tokens, user, loading, error, login, register, logout, fetchMe]
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error("useAuth must be used within AuthProvider");
  }
  return context;
};

export default AuthContext;
