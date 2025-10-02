import React, { createContext, useContext, useEffect, useMemo, useState } from 'react';
import axios from 'axios';

const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:8000/api/';

const AuthContext = createContext();

const authAxios = axios.create({
  baseURL: API_BASE_URL
});

const getStoredAuth = () => {
  try {
    const data = localStorage.getItem('eda_auth');
    return data ? JSON.parse(data) : null;
  } catch (error) {
    console.error('Unable to read auth from storage', error);
    return null;
  }
};

export const AuthProvider = ({ children }) => {
  const [authState, setAuthState] = useState(() => getStoredAuth());

  useEffect(() => {
    if (authState) {
      localStorage.setItem('eda_auth', JSON.stringify(authState));
    } else {
      localStorage.removeItem('eda_auth');
    }
  }, [authState]);

  useEffect(() => {
    const interceptor = authAxios.interceptors.request.use((config) => {
      if (authState?.tokens?.access) {
        config.headers.Authorization = `Bearer ${authState.tokens.access}`;
      }
      return config;
    });
    return () => authAxios.interceptors.request.eject(interceptor);
  }, [authState]);

  const login = async (email, password) => {
    const response = await axios.post(`${API_BASE_URL}auth/login/`, { email, password });
    const { access, refresh, user, redirect_to } = response.data;
    setAuthState({
      tokens: { access, refresh },
      user,
      redirect: redirect_to
    });
    return { user, redirect_to };
  };

  const logout = () => setAuthState(null);

  const value = useMemo(
    () => ({
      authAxios,
      authState,
      login,
      logout,
      isAuthenticated: Boolean(authState?.tokens?.access),
      user: authState?.user,
      redirect: authState?.redirect
    }),
    [authState]
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

export const useAuth = () => useContext(AuthContext);

export { API_BASE_URL };
