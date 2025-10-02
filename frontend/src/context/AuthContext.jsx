import { createContext, useContext, useEffect, useMemo, useState } from "react";
import api, { setAuthToken } from "../api/client";

const AuthContext = createContext();

const storageKey = "docapp.token";

export const AuthProvider = ({ children }) => {
  const [token, setToken] = useState(() => localStorage.getItem(storageKey));
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(!!token);

  useEffect(() => {
    if (token) {
      setAuthToken(token);
      localStorage.setItem(storageKey, token);
      api
        .get("/auth/me")
        .then((res) => setUser(res.data))
        .catch(() => {
          setToken(null);
          setUser(null);
          localStorage.removeItem(storageKey);
        })
        .finally(() => setLoading(false));
    } else {
      setAuthToken(null);
      localStorage.removeItem(storageKey);
      setUser(null);
      setLoading(false);
    }
  }, [token]);

  const login = async (email, password) => {
    const { data } = await api.post("/auth/login", { email, password });
    setToken(data.access);
    return data;
  };

  const logout = () => {
    setToken(null);
  };

  const value = useMemo(
    () => ({ token, user, setUser, login, logout, loading }),
    [token, user, loading]
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error("useAuth must be used within AuthProvider");
  }
  return context;
};
