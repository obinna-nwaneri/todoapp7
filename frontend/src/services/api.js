import axios from 'axios';

const api = axios.create({
  baseURL: import.meta.env.VITE_API_BASE_URL || 'http://localhost:4000'
});

api.interceptors.request.use((config) => {
  const token = localStorage.getItem('enterprise-todo-token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

const handleResponse = (promise) =>
  promise
    .then((res) => ({
      success: true,
      data: res.data,
      message: typeof res.data === 'object' && res.data !== null ? res.data.message : undefined
    }))
    .catch((error) => {
      const message = error.response?.data?.message || 'Something went wrong';
      return { success: false, message };
    });

export const loginRequest = (payload) => handleResponse(api.post('/api/auth/login', payload));

export const registerRequest = (payload) => handleResponse(api.post('/api/auth/register', payload));

export const fetchTodos = () => handleResponse(api.get('/api/todos'));

export const createTodoRequest = (payload) => handleResponse(api.post('/api/todos', payload));

export const updateTodoRequest = (id, payload) => handleResponse(api.put(`/api/todos/${id}`, payload));

export const deleteTodoRequest = (id) => handleResponse(api.delete(`/api/todos/${id}`));

export default api;
