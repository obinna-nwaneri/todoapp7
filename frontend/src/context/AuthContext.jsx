import { createContext, useContext, useEffect, useMemo, useState } from 'react';

const AuthContext = createContext();

const TOKEN_KEY = 'contact_app_token';
const USER_KEY = 'contact_app_user';

export const AuthProvider = ({ children }) => {
  const [token, setToken] = useState(() => {
    if (typeof window === 'undefined') return null;
    return localStorage.getItem(TOKEN_KEY);
  });
  const [user, setUser] = useState(() => {
    if (typeof window === 'undefined') return null;
    const stored = localStorage.getItem(USER_KEY);
    return stored ? JSON.parse(stored) : null;
  });

  useEffect(() => {
    if (typeof window === 'undefined') return;
    if (token) {
      localStorage.setItem(TOKEN_KEY, token);
    } else {
      localStorage.removeItem(TOKEN_KEY);
    }
  }, [token]);

  useEffect(() => {
    if (typeof window === 'undefined') return;
    if (user) {
      localStorage.setItem(USER_KEY, JSON.stringify(user));
    } else {
      localStorage.removeItem(USER_KEY);
    }
  }, [user]);

  const login = (authToken, authUser) => {
    setToken(authToken);
    setUser(authUser);
  };

  const logout = () => {
    setToken(null);
    setUser(null);
  };

  const value = useMemo(
    () => ({
      token,
      user,
      login,
      logout,
      isAuthenticated: Boolean(token)
    }),
    [token, user]
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
