import api, { clearStoredTokens, setStoredTokens } from "./client.js";

export const login = async (username, password) => {
  const response = await api.post("/auth/jwt/create", { username, password });
  const tokens = response.data;
  setStoredTokens(tokens);
  return tokens;
};

export const register = async (payload) => {
  return api.post("/auth/register", payload);
};

export const me = async () => {
  const response = await api.get("/auth/me");
  return response.data;
};

export const logout = () => {
  clearStoredTokens();
};
