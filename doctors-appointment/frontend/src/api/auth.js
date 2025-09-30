import api from "./client.js";

export const login = async (username, password) => {
  const { data } = await api.post("/auth/jwt/create", { username, password });
  return data;
};

export const register = async (payload) => {
  const { data } = await api.post("/auth/register", payload);
  return data;
};

export const me = async () => {
  const { data } = await api.get("/auth/me");
  return data;
};
