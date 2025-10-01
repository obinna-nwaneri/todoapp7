import axios from 'axios';

const API_BASE_URL = process.env.REACT_APP_API_URL || 'http://localhost:8000/api/';

const apiClient = axios.create({
  baseURL: API_BASE_URL,
});

export const login = (credentials) => apiClient.post('auth/login/', credentials);

export const register = (data) => apiClient.post('auth/register/', data);

export const fetchTasks = (token) =>
  apiClient.get('tasks/', {
    headers: {
      Authorization: `Bearer ${token}`,
    },
  });

export const createTask = (token, payload) =>
  apiClient.post('tasks/', payload, {
    headers: {
      Authorization: `Bearer ${token}`,
    },
  });

export const updateTask = (token, id, payload) =>
  apiClient.put(`tasks/${id}/`, payload, {
    headers: {
      Authorization: `Bearer ${token}`,
    },
  });

export const deleteTask = (token, id) =>
  apiClient.delete(`tasks/${id}/`, {
    headers: {
      Authorization: `Bearer ${token}`,
    },
  });
