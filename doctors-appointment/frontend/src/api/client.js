import axios from "axios";

const API_BASE_URL = "http://localhost:8000/api";
const TOKEN_STORAGE_KEY = "doctor_app_tokens";

let isRefreshing = false;
let refreshPromise = null;

export const getStoredTokens = () => {
  const raw = localStorage.getItem(TOKEN_STORAGE_KEY);
  if (!raw) return null;
  try {
    return JSON.parse(raw);
  } catch (error) {
    console.error("Failed to parse stored tokens", error);
    return null;
  }
};

export const setStoredTokens = (tokens) => {
  localStorage.setItem(TOKEN_STORAGE_KEY, JSON.stringify(tokens));
};

export const clearStoredTokens = () => {
  localStorage.removeItem(TOKEN_STORAGE_KEY);
};

const api = axios.create({
  baseURL: API_BASE_URL
});

api.interceptors.request.use((config) => {
  const tokens = getStoredTokens();
  if (tokens?.access) {
    config.headers = config.headers ?? {};
    config.headers.Authorization = `Bearer ${tokens.access}`;
  }
  return config;
});

api.interceptors.response.use(
  (response) => response,
  async (error) => {
    const originalRequest = error.config;
    if (error.response?.status === 401 && !originalRequest._retry) {
      const tokens = getStoredTokens();
      if (!tokens?.refresh) {
        clearStoredTokens();
        return Promise.reject(error);
      }
      if (!isRefreshing) {
        isRefreshing = true;
        refreshPromise = api
          .post("/auth/jwt/refresh", { refresh: tokens.refresh })
          .then((response) => {
            const newTokens = { ...tokens, access: response.data.access };
            setStoredTokens(newTokens);
            return newTokens.access;
          })
          .finally(() => {
            isRefreshing = false;
          });
      }
      const newAccess = await refreshPromise;
      originalRequest._retry = true;
      originalRequest.headers.Authorization = `Bearer ${newAccess}`;
      return api(originalRequest);
    }
    return Promise.reject(error);
  }
);

export default api;
