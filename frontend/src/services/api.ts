import axios from 'axios';

const API_BASE_URL = import.meta.env.VITE_API_URL ?? 'http://localhost:3000';

export const apiClient = axios.create({
  baseURL: API_BASE_URL,
  withCredentials: true
});

export async function loginRequest(email: string, password: string) {
  const { data } = await apiClient.post('/auth/login', { email, password });
  return data;
}

export async function registerDoctor(payload: Record<string, unknown>) {
  const { data } = await apiClient.post('/auth/register/doctor', payload);
  return data;
}

export async function registerPatient(payload: Record<string, unknown>) {
  const { data } = await apiClient.post('/auth/register/patient', payload);
  return data;
}

export async function refreshToken(refreshToken: string) {
  const { data } = await apiClient.post('/auth/refresh', { refreshToken });
  return data;
}
