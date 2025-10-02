import { createContext, useCallback, useContext, useEffect, useMemo, useState } from 'react';
import { fetchCurrentUser, login as apiLogin, refreshToken } from '../api';

const AuthContext = createContext();

const STORAGE_KEY = 'enterprise-doctor-auth';

const loadStoredAuth = () => {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return null;
    return JSON.parse(raw);
  } catch (error) {
    console.error('Failed to parse auth state', error);
    return null;
  }
};

export const AuthProvider = ({ children }) => {
  const [tokens, setTokens] = useState(() => loadStoredAuth());
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(!!tokens);
  const [error, setError] = useState(null);

  useEffect(() => {
    if (!tokens) {
      setUser(null);
      localStorage.removeItem(STORAGE_KEY);
      setLoading(false);
      return;
    }
    localStorage.setItem(STORAGE_KEY, JSON.stringify(tokens));
    const loadUser = async () => {
      try {
        const profile = await fetchCurrentUser(tokens.access);
        setUser(profile);
      } catch (err) {
        console.error('Failed to load user', err);
        setError('Session expired. Please log in again.');
        setTokens(null);
      } finally {
        setLoading(false);
      }
    };
    loadUser();
  }, [tokens]);

  const login = useCallback(async (email, password) => {
    setLoading(true);
    setError(null);
    try {
      const newTokens = await apiLogin(email, password);
      setTokens(newTokens);
      const profile = await fetchCurrentUser(newTokens.access);
      setUser(profile);
      return profile;
    } catch (err) {
      console.error('Login failed', err);
      setError('Invalid credentials.');
      throw err;
    } finally {
      setLoading(false);
    }
  }, []);

  const logout = useCallback(() => {
    setTokens(null);
    setUser(null);
    localStorage.removeItem(STORAGE_KEY);
  }, []);

  const value = useMemo(
    () => ({ tokens, user, login, logout, setTokens, loading, error, setError }),
    [tokens, user, login, logout, loading, error]
  );

  useEffect(() => {
    if (!tokens) return;
    const interval = setInterval(async () => {
      try {
        const refreshed = await refreshToken(tokens.refresh);
        setTokens((prev) => ({ ...prev, ...refreshed }));
      } catch (err) {
        console.error('Refresh token failed', err);
        logout();
      }
    }, 1000 * 60 * 10);
    return () => clearInterval(interval);
  }, [tokens, logout]);

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within AuthProvider');
  }
  return context;
};
