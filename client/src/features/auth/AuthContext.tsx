import { createContext, useCallback, useContext, useEffect, useMemo, useState } from "react";

import { api, setTokenUpdateHandler, setTokens } from "../../lib/api";
import { getStoredAuth, setStoredAuth, StoredAuth, StoredUser } from "../../lib/auth-storage";

export type LoginInput = { username: string; password: string };
export type RegisterInput = { username: string; email?: string; password: string; password2: string };
export type ChangePasswordInput = {
  old_password: string;
  new_password: string;
  new_password_confirm: string;
};

export type AuthState = {
  user: StoredUser | null;
  tokens: StoredAuth["tokens"] | null;
};

export type AuthContextValue = {
  user: StoredUser | null;
  tokens: StoredAuth["tokens"] | null;
  isAuthenticated: boolean;
  login: (input: LoginInput) => Promise<void>;
  logout: () => Promise<void>;
  register: (input: RegisterInput) => Promise<void>;
  changePassword: (input: ChangePasswordInput) => Promise<void>;
  loading: boolean;
};

export const AuthContext = createContext<AuthContextValue | undefined>(undefined);

type TokenResponse = {
  access: string;
  refresh: string;
  user: StoredUser;
};

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [state, setState] = useState<AuthState>(() => {
    const stored = getStoredAuth();
    if (stored) {
      setTokens(stored.tokens);
      return { user: stored.user, tokens: stored.tokens };
    }
    return { user: null, tokens: null };
  });
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    setTokenUpdateHandler((nextTokens) => {
      setState((prev) => {
        if (!prev.user) {
          return prev;
        }
        const updated: AuthState = { user: prev.user, tokens: nextTokens };
        setStoredAuth(updated);
        return updated;
      });
    });
    return () => setTokenUpdateHandler(null);
  }, []);

  const login = useCallback(async (input: LoginInput) => {
    setLoading(true);
    try {
      const response = await api.post<TokenResponse>("/api/auth/token/", input);
      const authData: StoredAuth = {
        user: response.data.user,
        tokens: {
          access: response.data.access,
          refresh: response.data.refresh,
        },
      };
      setTokens(authData.tokens);
      setStoredAuth(authData);
      setState({ user: authData.user, tokens: authData.tokens });
    } finally {
      setLoading(false);
    }
  }, []);

  const register = useCallback(
    async (input: RegisterInput) => {
      setLoading(true);
      try {
        await api.post("/api/auth/register/", input);
        await login({ username: input.username, password: input.password });
      } finally {
        setLoading(false);
      }
    },
    [login],
  );

  const logout = useCallback(async () => {
    if (!state.tokens) {
      setState({ user: null, tokens: null });
      setStoredAuth(null);
      setTokens(null);
      return;
    }
    try {
      await api.post("/api/auth/logout/", { refresh: state.tokens.refresh });
    } catch (error) {
      console.warn("Failed to logout", error);
    } finally {
      setState({ user: null, tokens: null });
      setStoredAuth(null);
      setTokens(null);
    }
  }, [state.tokens]);

  const changePassword = useCallback(
    async (input: ChangePasswordInput) => {
      await api.put("/api/auth/change-password/", input);
    },
    [],
  );

  const value = useMemo<AuthContextValue>(
    () => ({
      user: state.user,
      tokens: state.tokens,
      isAuthenticated: Boolean(state.tokens?.access),
      login,
      logout,
      register,
      changePassword,
      loading,
    }),
    [state.user, state.tokens, login, logout, register, changePassword, loading],
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

export const useAuth = (): AuthContextValue => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error("useAuth must be used within AuthProvider");
  }
  return context;
};
