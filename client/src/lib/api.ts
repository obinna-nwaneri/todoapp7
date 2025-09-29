import axios from "axios";

import { getStoredAuth, setStoredAuth } from "./auth-storage";

type TokenPair = { access: string; refresh: string };

type TokenUpdateHandler = (tokens: TokenPair) => void;

let tokens: TokenPair | null = getStoredAuth()?.tokens ?? null;
let onTokenUpdate: TokenUpdateHandler | null = null;

export const setTokens = (next: TokenPair | null) => {
  tokens = next;
  const stored = getStoredAuth();
  if (next) {
    if (stored) {
      setStoredAuth({ ...stored, tokens: next });
    }
  } else {
    setStoredAuth(null);
  }
  if (next && onTokenUpdate) {
    onTokenUpdate(next);
  }
};

export const setTokenUpdateHandler = (handler: TokenUpdateHandler | null) => {
  onTokenUpdate = handler;
};

export const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL || "http://localhost:8000",
  withCredentials: true,
});

api.interceptors.request.use((config) => {
  if (tokens?.access) {
    config.headers = config.headers ?? {};
    config.headers.Authorization = `Bearer ${tokens.access}`;
  }
  return config;
});

let refreshing: Promise<string> | null = null;

async function refreshAccessToken(): Promise<string> {
  if (!tokens?.refresh) {
    throw new Error("No refresh token");
  }
  if (!refreshing) {
    refreshing = api
      .post<{ access: string }>("/api/auth/token/refresh/", {
        refresh: tokens.refresh,
      })
      .then((res) => {
        const nextTokens = { access: res.data.access, refresh: tokens!.refresh };
        setTokens(nextTokens);
        return nextTokens.access;
      })
      .finally(() => {
        refreshing = null;
      });
  }
  return refreshing;
}

api.interceptors.response.use(
  (response) => response,
  async (error) => {
    if (error.response?.status === 401 && tokens?.refresh) {
      try {
        const newAccess = await refreshAccessToken();
        const config = error.config;
        config.headers = config.headers ?? {};
        config.headers.Authorization = `Bearer ${newAccess}`;
        return api(config);
      } catch (refreshError) {
        setTokens(null);
      }
    }
    return Promise.reject(error);
  },
);
