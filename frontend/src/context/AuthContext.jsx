import { createContext, useContext, useEffect, useState } from "react";

import apiClient from "../api/client.js";

const AuthContext = createContext();

const REFRESH_STORAGE_KEY = "docapp_refresh_token";

export const AuthProvider = ({ children }) => {
  const [tokens, setTokens] = useState(null);
  const [user, setUser] = useState(null);
  const [profileId, setProfileId] = useState(null);
  const [loading, setLoading] = useState(true);

  const applyAccessToken = (access) => {
    if (access) {
      apiClient.defaults.headers.common.Authorization = `Bearer ${access}`;
    } else {
      delete apiClient.defaults.headers.common.Authorization;
    }
  };

  const fetchCurrentUser = async () => {
    const { data } = await apiClient.get("/auth/me");
    setUser(data.user);
    setProfileId(data.profile_id);
    return data.user;
  };

  const refreshAccessToken = async (incomingRefresh) => {
    const refreshToken = incomingRefresh || tokens?.refresh || sessionStorage.getItem(REFRESH_STORAGE_KEY);
    if (!refreshToken) {
      throw new Error("Missing refresh token");
    }
    const { data } = await apiClient.post("/auth/refresh", { refresh: refreshToken });
    const nextTokens = { refresh: refreshToken, access: data.access };
    setTokens(nextTokens);
    applyAccessToken(data.access);
    sessionStorage.setItem(REFRESH_STORAGE_KEY, refreshToken);
    return data.access;
  };

  const login = async ({ email, password }) => {
    setLoading(true);
    try {
      const { data } = await apiClient.post("/auth/login", { email, password });
      const nextTokens = { access: data.access, refresh: data.refresh };
      setTokens(nextTokens);
      applyAccessToken(data.access);
      sessionStorage.setItem(REFRESH_STORAGE_KEY, data.refresh);
      const currentUser = await fetchCurrentUser();
      return currentUser;
    } catch (error) {
      throw error;
    } finally {
      setLoading(false);
    }
  };

  const logout = () => {
    setTokens(null);
    setUser(null);
    setProfileId(null);
    applyAccessToken(null);
    sessionStorage.removeItem(REFRESH_STORAGE_KEY);
  };

  useEffect(() => {
    const initialize = async () => {
      const storedRefresh = sessionStorage.getItem(REFRESH_STORAGE_KEY);
      if (!storedRefresh) {
        setLoading(false);
        return;
      }
      try {
        await refreshAccessToken(storedRefresh);
        await fetchCurrentUser();
      } catch (error) {
        logout();
      } finally {
        setLoading(false);
      }
    };
    initialize();
  }, []);

  useEffect(() => {
    const interceptor = apiClient.interceptors.response.use(
      (response) => response,
      async (error) => {
        const originalRequest = error.config;
        if (error.response?.status === 401 && !originalRequest._retry) {
          try {
            originalRequest._retry = true;
            const newAccess = await refreshAccessToken();
            originalRequest.headers.Authorization = `Bearer ${newAccess}`;
            return apiClient(originalRequest);
          } catch (refreshError) {
            logout();
          }
        }
        return Promise.reject(error);
      }
    );
    return () => {
      apiClient.interceptors.response.eject(interceptor);
    };
  }, [tokens]);

  return (
    <AuthContext.Provider
      value={{ user, profileId, loading, login, logout, refreshAccessToken, setUser }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);
