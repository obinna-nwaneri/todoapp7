import api from './client'
import type { AuthToken, AuthUser } from '@/types'

interface AuthResponse {
  user: AuthUser
  token: AuthToken
}

export const login = async (payload: { email: string; password: string }) => {
  const { data } = await api.post<AuthResponse>('/auth/login', payload)
  return data
}

export const register = async (payload: { name: string; email: string; password: string }) => {
  const { data } = await api.post<AuthResponse>('/auth/register', payload)
  return data
}

export const logout = async () => {
  await api.post('/auth/logout')
}

export const fetchProfile = async () => {
  const { data } = await api.get<AuthUser>('/profile')
  return data
}

export const updateProfile = async (payload: Partial<{ name: string; email: string; password: string }>) => {
  const { data } = await api.patch<AuthUser>('/profile', payload)
  return data
}
