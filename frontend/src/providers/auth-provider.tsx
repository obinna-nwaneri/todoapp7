import React, { createContext, useContext, useEffect, useMemo, useState } from 'react';
import api from '../api/client';
import { User } from '../api/types';

interface AuthContextValue {
  user: User | null;
  token: string | null;
  loading: boolean;
  login: (email: string, password: string) => Promise<void>;
  register: (payload: {
    email: string;
    password: string;
    firstName: string;
    lastName: string;
  }) => Promise<void>;
  logout: () => void;
}

const AuthContext = createContext<AuthContextValue | undefined>(undefined);

export const AuthProvider: React.FC<React.PropsWithChildren> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [token, setToken] = useState<string | null>(() =>
    typeof window !== 'undefined' ? window.localStorage.getItem('enterprise_todo_token') : null,
  );
  const [loading, setLoading] = useState<boolean>(!!token);

  useEffect(() => {
    if (!token) {
      setLoading(false);
      return;
    }

    const loadProfile = async () => {
      try {
        const response = await api.get<User>('/auth/me');
        setUser(response.data);
      } catch (error) {
        window.localStorage.removeItem('enterprise_todo_token');
        setToken(null);
        setUser(null);
      } finally {
        setLoading(false);
      }
    };

    loadProfile();
  }, [token]);

  const login = async (email: string, password: string) => {
    const { data } = await api.post<{ accessToken: string; user: User }>('/auth/login', {
      email,
      password,
    });
    if (typeof window !== 'undefined') {
      window.localStorage.setItem('enterprise_todo_token', data.accessToken);
    }
    setToken(data.accessToken);
    setUser(data.user);
  };

  const register = async (payload: {
    email: string;
    password: string;
    firstName: string;
    lastName: string;
  }) => {
    const { data } = await api.post<{ accessToken: string; user: User }>('/auth/register', payload);
    if (typeof window !== 'undefined') {
      window.localStorage.setItem('enterprise_todo_token', data.accessToken);
    }
    setToken(data.accessToken);
    setUser(data.user);
  };

  const logout = () => {
    if (typeof window !== 'undefined') {
      window.localStorage.removeItem('enterprise_todo_token');
    }
    setToken(null);
    setUser(null);
  };

  const value = useMemo(
    () => ({
      user,
      token,
      loading,
      login,
      register,
      logout,
    }),
    [user, token, loading],
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

export const useAuthContext = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuthContext must be used within AuthProvider');
  }
  return context;
};
