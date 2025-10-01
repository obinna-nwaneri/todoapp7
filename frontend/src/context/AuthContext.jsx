import { createContext, useContext, useEffect, useMemo, useState } from 'react';

const STORAGE_KEY = 'enterprise-todo-auth';

const AuthContext = createContext({
  user: null,
  token: null,
  login: () => {},
  logout: () => {},
});

export const AuthProvider = ({ children }) => {
  const [token, setToken] = useState(null);
  const [user, setUser] = useState(null);

  useEffect(() => {
    const stored = localStorage.getItem(STORAGE_KEY);
    if (stored) {
      try {
        const parsed = JSON.parse(stored);
        setToken(parsed.token ?? null);
        setUser(parsed.user ?? null);
      } catch (error) {
        console.error('Failed to parse stored auth state', error);
      }
    }
  }, []);

  useEffect(() => {
    const payload = JSON.stringify({ token, user });
    localStorage.setItem(STORAGE_KEY, payload);
  }, [token, user]);

  const value = useMemo(
    () => ({
      user,
      token,
      login: ({ accessToken, user: authUser }) => {
        setToken(accessToken);
        setUser(authUser);
      },
      logout: () => {
        setToken(null);
        setUser(null);
        localStorage.removeItem(STORAGE_KEY);
      },
    }),
    [token, user],
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

export const useAuth = () => useContext(AuthContext);
