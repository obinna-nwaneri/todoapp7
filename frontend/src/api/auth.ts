import api from './client'
import type { AuthResponse, LoginPayload, RegisterPayload, ApiMessage } from '../types'

export async function login(payload: LoginPayload) {
  const { data } = await api.post<AuthResponse>('/auth/login', payload)
  return data
}

export async function register(payload: RegisterPayload) {
  const { data } = await api.post<AuthResponse>('/auth/register', payload)
  return data
}

export async function logout() {
  const { data } = await api.post<ApiMessage>('/auth/logout')
  return data
}
