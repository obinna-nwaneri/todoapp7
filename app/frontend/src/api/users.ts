import api from './client';
import type { Paginated } from './projects';

export interface User {
  id: string;
  email: string;
  firstName: string;
  lastName: string;
  role: 'ADMIN' | 'USER';
  isActive: boolean;
}

export async function fetchUsers(params: Record<string, unknown> = {}) {
  const response = await api.get<Paginated<User>>('/users', { params });
  return response.data;
}
