import axios from "axios";

const api = axios.create({
  baseURL: "/api",
});

api.interceptors.request.use((config) => {
  const stored = localStorage.getItem("authTokens");
  if (stored) {
    const tokens = JSON.parse(stored);
    if (tokens?.access) {
      config.headers.Authorization = `Bearer ${tokens.access}`;
    }
  }
  return config;
});

export default api;
