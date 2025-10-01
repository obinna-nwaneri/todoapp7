import axios from 'axios'

const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL || 'http://localhost:3333',
})

api.interceptors.request.use((config) => {
  if (typeof window !== 'undefined') {
    const stored = window.localStorage.getItem('enterprise_todo_auth')
    if (stored) {
      try {
        const { token } = JSON.parse(stored)
        if (token) {
          const value = token.token ?? token
          config.headers.Authorization = `Bearer ${value}`
        }
      } catch (error) {
        console.error('Failed to parse auth token', error)
      }
    }
  }
  return config
})

export default api
