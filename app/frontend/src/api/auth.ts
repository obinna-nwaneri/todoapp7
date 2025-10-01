import api from './client';

export interface AuthResponse {
  id: string;
  email: string;
  firstName: string;
  lastName: string;
  role: 'ADMIN' | 'USER';
  isActive: boolean;
}

export async function login(data: { email: string; password: string }) {
  const response = await api.post<AuthResponse>('/auth/login', data);
  return response.data;
}

export async function register(data: {
  email: string;
  password: string;
  firstName: string;
  lastName: string;
}) {
  const response = await api.post<AuthResponse>('/auth/register', data);
  return response.data;
}

export async function logout() {
  await api.post('/auth/logout');
}

export async function fetchMe() {
  const response = await api.get<AuthResponse>('/auth/me');
  return response.data;
}
