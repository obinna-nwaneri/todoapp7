import { createContext, useCallback, useContext, useEffect, useMemo, useState } from 'react';

import { apiClient, refreshToken as refreshTokenRequest } from '../services/api';
import { LoginResponse, UserRole } from '../types/auth';

interface AuthContextValue {
  accessToken: string | null;
  refreshToken: string | null;
  role: UserRole | null;
  login: (data: LoginResponse) => void;
  logout: () => void;
  setTokens: (data: LoginResponse) => void;
}

const AuthContext = createContext<AuthContextValue | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [accessToken, setAccessToken] = useState<string | null>(null);
  const [refreshToken, setRefreshToken] = useState<string | null>(null);
  const [role, setRole] = useState<UserRole | null>(null);

  useEffect(() => {
    const stored = localStorage.getItem('docapp-auth');
    if (stored) {
      const parsed: LoginResponse = JSON.parse(stored);
      setAccessToken(parsed.accessToken);
      setRefreshToken(parsed.refreshToken);
      setRole(parsed.role);
    }
  }, []);

  const persist = useCallback((data: LoginResponse | null) => {
    if (data) {
      localStorage.setItem('docapp-auth', JSON.stringify(data));
    } else {
      localStorage.removeItem('docapp-auth');
    }
  }, []);

  const setTokens = useCallback(
    (data: LoginResponse) => {
      setAccessToken(data.accessToken);
      setRefreshToken(data.refreshToken);
      setRole(data.role);
      persist(data);
    },
    [persist]
  );

  const login = useCallback(
    (data: LoginResponse) => {
      setTokens(data);
    },
    [setTokens]
  );

  const logout = useCallback(() => {
    setAccessToken(null);
    setRefreshToken(null);
    setRole(null);
    persist(null);
  }, [persist]);

  useEffect(() => {
    const interceptorId = apiClient.interceptors.request.use((config) => {
      if (accessToken) {
        config.headers.Authorization = `Bearer ${accessToken}`;
      } else {
        delete config.headers.Authorization;
      }
      return config;
    });

    return () => {
      apiClient.interceptors.request.eject(interceptorId);
    };
  }, [accessToken]);

  useEffect(() => {
    const interceptorId = apiClient.interceptors.response.use(
      (response) => response,
      async (error) => {
        if (error.response?.status === 401 && refreshToken) {
          try {
            const data = await refreshTokenRequest(refreshToken);
            setTokens(data);
            error.config.headers.Authorization = `Bearer ${data.accessToken}`;
            return apiClient.request(error.config);
          } catch (refreshError) {
            logout();
          }
        }
        return Promise.reject(error);
      }
    );

    return () => {
      apiClient.interceptors.response.eject(interceptorId);
    };
  }, [refreshToken, setTokens, logout]);

  const value = useMemo(
    () => ({ accessToken, refreshToken, role, login, logout, setTokens }),
    [accessToken, refreshToken, role, login, logout, setTokens]
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
