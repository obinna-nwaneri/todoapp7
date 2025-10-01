import React, { createContext, useCallback, useEffect, useMemo, useState } from 'react';

const AuthContext = createContext();

const LOCAL_STORAGE_KEY = 'enterprise_todo_auth';

export const AuthProvider = ({ children }) => {
  const [authState, setAuthState] = useState(() => {
    const stored = localStorage.getItem(LOCAL_STORAGE_KEY);
    return stored ? JSON.parse(stored) : { user: null, access: null, refresh: null };
  });

  useEffect(() => {
    localStorage.setItem(LOCAL_STORAGE_KEY, JSON.stringify(authState));
  }, [authState]);

  const login = useCallback((data) => {
    setAuthState({ user: data.user, access: data.access, refresh: data.refresh });
  }, []);

  const logout = useCallback(() => {
    setAuthState({ user: null, access: null, refresh: null });
  }, []);

  const value = useMemo(
    () => ({
      ...authState,
      isAuthenticated: Boolean(authState.access),
      login,
      logout,
    }),
    [authState, login, logout]
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

export default AuthContext;
