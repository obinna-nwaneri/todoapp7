import { createContext, useContext, useEffect, useMemo, useState } from 'react';

const AuthContext = createContext(null);

const AUTH_STORAGE_KEY = 'doctor-app-auth';

export const AuthProvider = ({ children }) => {
  const [auth, setAuth] = useState(() => {
    const stored = localStorage.getItem(AUTH_STORAGE_KEY);
    if (!stored) return null;
    try {
      return JSON.parse(stored);
    } catch (error) {
      console.error('Failed to parse auth from storage', error);
      return null;
    }
  });

  useEffect(() => {
    if (auth) {
      localStorage.setItem(AUTH_STORAGE_KEY, JSON.stringify(auth));
    } else {
      localStorage.removeItem(AUTH_STORAGE_KEY);
    }
  }, [auth]);

  const value = useMemo(
    () => ({
      auth,
      login: (data) => setAuth(data),
      logout: () => setAuth(null),
    }),
    [auth]
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === null) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
