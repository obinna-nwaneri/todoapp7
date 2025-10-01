import type { ReactNode } from 'react';
import { createContext, useContext, useEffect, useState } from 'react';
import { UseMutationResult, useMutation, useQueryClient } from '@tanstack/react-query';
import { fetchMe, login, logout, register, type AuthResponse } from '../api/auth';

interface AuthContextValue {
  user: AuthResponse | null;
  loading: boolean;
  loginMutation: UseMutationResult<AuthResponse, Error, { email: string; password: string }, unknown>;
  registerMutation: UseMutationResult<AuthResponse, Error, { email: string; password: string; firstName: string; lastName: string }, unknown>;
  logoutMutation: UseMutationResult<void, Error, void, unknown>;
  refresh: () => Promise<void>;
}

const AuthContext = createContext<AuthContextValue | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
  const queryClient = useQueryClient();
  const [user, setUser] = useState<AuthResponse | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchMe()
      .then(setUser)
      .catch(() => setUser(null))
      .finally(() => setLoading(false));
  }, []);

  const loginMutation = useMutation<AuthResponse, Error, { email: string; password: string }>({
    mutationFn: login,
    onSuccess: (data) => {
      setUser(data);
    },
  });

  const registerMutation = useMutation<AuthResponse, Error, { email: string; password: string; firstName: string; lastName: string }>({
    mutationFn: register,
    onSuccess: (data) => {
      setUser(data);
    },
  });

  const logoutMutation = useMutation<void, Error, void>({
    mutationFn: async () => {
      await logout();
    },
    onSuccess: () => {
      setUser(null);
      queryClient.clear();
    },
  });

  const refresh = async () => {
    setLoading(true);
    try {
      const data = await fetchMe();
      setUser(data);
    } finally {
      setLoading(false);
    }
  };

  return (
    <AuthContext.Provider value={{ user, loading, loginMutation, registerMutation, logoutMutation, refresh }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth must be used within AuthProvider');
  return ctx;
}
