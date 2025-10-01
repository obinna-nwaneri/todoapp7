import api from './client'
import type { ApiResponse, UpdateProfilePayload, User } from '../types'

export async function getProfile() {
  const { data } = await api.get<ApiResponse<User>>('/profile')
  return data.data
}

export async function updateProfile(payload: UpdateProfilePayload) {
  const { data } = await api.patch<ApiResponse<User>>('/profile', payload)
  return data.data
}
