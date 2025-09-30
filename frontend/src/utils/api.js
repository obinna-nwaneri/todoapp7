import axios from "axios";

const API_BASE_URL = process.env.REACT_APP_API_URL || "/api/";

const api = axios.create({
  baseURL: API_BASE_URL,
});

api.interceptors.request.use((config) => {
  const token = localStorage.getItem("todoapp_access_token");
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

api.interceptors.response.use(
  (response) => response,
  async (error) => {
    const originalRequest = error.config;
    if (
      error.response?.status === 401 &&
      !originalRequest._retry &&
      localStorage.getItem("todoapp_refresh_token")
    ) {
      originalRequest._retry = true;
      try {
        const refreshResponse = await axios.post(`${API_BASE_URL}token/refresh`, {
          refresh: localStorage.getItem("todoapp_refresh_token"),
        });
        localStorage.setItem("todoapp_access_token", refreshResponse.data.access);
        originalRequest.headers.Authorization = `Bearer ${refreshResponse.data.access}`;
        return api(originalRequest);
      } catch (refreshError) {
        localStorage.removeItem("todoapp_access_token");
        localStorage.removeItem("todoapp_refresh_token");
        localStorage.removeItem("todoapp_user");
      }
    }
    return Promise.reject(error);
  }
);

export default api;
