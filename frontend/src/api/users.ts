import api from './client'
import type { AuthUser } from '@/types'

export const fetchUsers = async () => {
  const { data } = await api.get<AuthUser[]>('/users')
  return data
}

export const updateUser = async (id: number, payload: Partial<{ name: string; email: string; role: 'admin' | 'user'; password: string }>) => {
  const { data } = await api.patch<{ user: AuthUser }>(`/users/${id}`, payload)
  return data.user
}
