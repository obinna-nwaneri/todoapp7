import { createContext, useContext, useEffect, useMemo, useState } from 'react';
import { loginRequest, registerRequest } from '../services/api.js';

const AuthContext = createContext();

const storedUser = () => {
  try {
    const data = localStorage.getItem('enterprise-todo-user');
    return data ? JSON.parse(data) : null;
  } catch (error) {
    console.error('Failed to parse stored user', error);
    return null;
  }
};

const storedToken = () => localStorage.getItem('enterprise-todo-token');

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(storedUser());
  const [token, setToken] = useState(storedToken());
  const [message, setMessage] = useState(null);

  useEffect(() => {
    if (user) {
      localStorage.setItem('enterprise-todo-user', JSON.stringify(user));
    } else {
      localStorage.removeItem('enterprise-todo-user');
    }
  }, [user]);

  useEffect(() => {
    if (token) {
      localStorage.setItem('enterprise-todo-token', token);
    } else {
      localStorage.removeItem('enterprise-todo-token');
    }
  }, [token]);

  const login = async (payload) => {
    const response = await loginRequest(payload);
    if (response.success) {
      setUser(response.data.user);
      setToken(response.data.token);
    }
    setMessage(response.message || (response.success ? 'Login successful' : null));
    return response;
  };

  const register = async (payload) => {
    const response = await registerRequest(payload);
    if (response.success) {
      setUser(response.data.user);
      setToken(response.data.token);
    }
    setMessage(response.message || (response.success ? 'Registration successful' : null));
    return response;
  };

  const logout = () => {
    setUser(null);
    setToken(null);
    setMessage('Logged out successfully');
  };

  const value = useMemo(() => ({
    user,
    token,
    login,
    register,
    logout,
    message,
    setMessage
  }), [user, token, message]);

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

export const useAuth = () => useContext(AuthContext);
