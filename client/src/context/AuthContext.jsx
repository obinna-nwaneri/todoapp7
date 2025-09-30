import { createContext, useContext, useEffect, useMemo, useState } from 'react';

const AuthContext = createContext();

const storageKey = 'todoapp7_token';
const userKey = 'todoapp7_user';

export const AuthProvider = ({ children }) => {
  const [token, setToken] = useState(() => localStorage.getItem(storageKey));
  const [user, setUser] = useState(() => {
    const stored = localStorage.getItem(userKey);
    return stored ? JSON.parse(stored) : null;
  });

  useEffect(() => {
    if (token) {
      localStorage.setItem(storageKey, token);
    } else {
      localStorage.removeItem(storageKey);
    }
  }, [token]);

  useEffect(() => {
    if (user) {
      localStorage.setItem(userKey, JSON.stringify(user));
    } else {
      localStorage.removeItem(userKey);
    }
  }, [user]);

  const login = (newToken, userInfo) => {
    setToken(newToken);
    setUser(userInfo);
  };

  const logout = () => {
    setToken(null);
    setUser(null);
  };

  const value = useMemo(() => ({
    token,
    user,
    login,
    logout,
    isAuthenticated: Boolean(token)
  }), [token, user]);

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

export const useAuth = () => useContext(AuthContext);
