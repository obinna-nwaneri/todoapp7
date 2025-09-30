import api, { tokenStorage } from './client'

export async function login({ username, password }) {
  const response = await api.post('/auth/jwt/create/', { username, password })
  tokenStorage.set(response.data)
  return response.data
}

export async function register(payload) {
  return api.post('/auth/register', payload)
}

export async function fetchCurrentUser() {
  const response = await api.get('/auth/me')
  return response.data
}

export function logout() {
  tokenStorage.clear()
}
