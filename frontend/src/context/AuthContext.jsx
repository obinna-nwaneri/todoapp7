import { createContext, useContext, useEffect, useMemo, useState } from "react";

import api from "../services/api.js";

const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [authTokens, setAuthTokens] = useState(() => {
    const stored = localStorage.getItem("authTokens");
    return stored ? JSON.parse(stored) : null;
  });
  const [user, setUser] = useState(() => {
    const stored = localStorage.getItem("authUser");
    return stored ? JSON.parse(stored) : null;
  });
  const [loadingUser, setLoadingUser] = useState(false);

  useEffect(() => {
    if (authTokens && !user) {
      setLoadingUser(true);
      api
        .get("/auth/user/")
        .then((response) => setUser(response.data))
        .catch(() => logout())
        .finally(() => setLoadingUser(false));
    }
  }, [authTokens]);

  useEffect(() => {
    if (authTokens) {
      localStorage.setItem("authTokens", JSON.stringify(authTokens));
    } else {
      localStorage.removeItem("authTokens");
    }
  }, [authTokens]);

  useEffect(() => {
    if (user) {
      localStorage.setItem("authUser", JSON.stringify(user));
    } else {
      localStorage.removeItem("authUser");
    }
  }, [user]);

  const login = async (credentials) => {
    const response = await api.post("/auth/login/", credentials);
    const tokens = {
      access: response.data.access,
      refresh: response.data.refresh,
    };
    setAuthTokens(tokens);
    setUser(response.data.user);
    return response.data.user;
  };

  const register = async (payload) => {
    await api.post("/auth/register/", payload);
  };

  const logout = () => {
    setAuthTokens(null);
    setUser(null);
  };

  const value = useMemo(
    () => ({
      authTokens,
      user,
      loadingUser,
      login,
      register,
      logout,
      setUser,
      setAuthTokens,
    }),
    [authTokens, loadingUser, user]
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

export const useAuth = () => useContext(AuthContext);
