import api from './client'
import type { ApiMessage, ApiResponse, UpdateUserPayload, User, UserWithStats } from '../types'

export async function getUsers() {
  const { data } = await api.get<ApiResponse<UserWithStats[]>>('/users')
  return data.data
}

export async function updateUser(id: number, payload: UpdateUserPayload) {
  const { data } = await api.patch<ApiResponse<User>>(`/users/${id}`, payload)
  return data.data
}

export async function deleteUser(id: number) {
  const { data } = await api.delete<ApiMessage>(`/users/${id}`)
  return data
}
