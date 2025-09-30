import axios from "axios";

const API_BASE = "http://localhost:8000/api";

let tokenStore = {
  access: typeof window !== "undefined" ? localStorage.getItem("accessToken") : null,
  refresh: typeof window !== "undefined" ? localStorage.getItem("refreshToken") : null,
};

const listeners = new Set();

export const subscribeTokenChange = (callback) => {
  listeners.add(callback);
  return () => listeners.delete(callback);
};

const notify = () => {
  for (const callback of listeners) {
    callback({ ...tokenStore });
  }
};

export const setTokenStore = (tokens) => {
  tokenStore = tokens ?? { access: null, refresh: null };
  if (tokenStore?.access) {
    localStorage.setItem("accessToken", tokenStore.access);
  } else {
    localStorage.removeItem("accessToken");
  }
  if (tokenStore?.refresh) {
    localStorage.setItem("refreshToken", tokenStore.refresh);
  } else {
    localStorage.removeItem("refreshToken");
  }
  notify();
};

export const getTokenStore = () => ({ ...tokenStore });

const api = axios.create({
  baseURL: API_BASE,
});

api.interceptors.request.use((config) => {
  if (tokenStore?.access) {
    config.headers = config.headers ?? {};
    config.headers.Authorization = `Bearer ${tokenStore.access}`;
  }
  return config;
});

let refreshPromise = null;

api.interceptors.response.use(
  (response) => response,
  async (error) => {
    const originalRequest = error.config ?? {};
    if (error.response?.status === 401 && tokenStore?.refresh && !originalRequest._retry) {
      originalRequest._retry = true;
      if (!refreshPromise) {
        refreshPromise = axios
          .post(`${API_BASE}/auth/jwt/refresh`, { refresh: tokenStore.refresh })
          .then((res) => {
            const newTokens = { access: res.data.access, refresh: tokenStore.refresh };
            setTokenStore(newTokens);
            return newTokens.access;
          })
          .catch((refreshError) => {
            setTokenStore({ access: null, refresh: null });
            throw refreshError;
          })
          .finally(() => {
            refreshPromise = null;
          });
      }
      const newAccess = await refreshPromise;
      originalRequest.headers = originalRequest.headers ?? {};
      originalRequest.headers.Authorization = `Bearer ${newAccess}`;
      return api(originalRequest);
    }
    throw error;
  }
);

export default api;
