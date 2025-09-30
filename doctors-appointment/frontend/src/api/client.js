import axios from 'axios'

const API_BASE = import.meta.env.VITE_API_BASE ?? 'http://localhost:8000/api'
const TOKEN_KEY = 'da.tokens'

const listeners = new Set()

export const tokenStorage = {
  get() {
    if (typeof window === 'undefined') return null
    const stored = window.localStorage.getItem(TOKEN_KEY)
    return stored ? JSON.parse(stored) : null
  },
  set(tokens) {
    if (typeof window === 'undefined') return
    window.localStorage.setItem(TOKEN_KEY, JSON.stringify(tokens))
    listeners.forEach((cb) => cb(tokens))
  },
  clear() {
    if (typeof window === 'undefined') return
    window.localStorage.removeItem(TOKEN_KEY)
    listeners.forEach((cb) => cb(null))
  },
  subscribe(cb) {
    listeners.add(cb)
    return () => listeners.delete(cb)
  },
}

const api = axios.create({
  baseURL: API_BASE,
})

let isRefreshing = false
let refreshPromise = null

api.interceptors.request.use((config) => {
  const tokens = tokenStorage.get()
  if (tokens?.access) {
    config.headers.Authorization = `Bearer ${tokens.access}`
  }
  return config
})

api.interceptors.response.use(
  (response) => response,
  async (error) => {
    const { response, config } = error
    if (!response) {
      return Promise.reject(error)
    }
    if (response.status === 401 && !config._retry) {
      const tokens = tokenStorage.get()
      if (!tokens?.refresh) {
        tokenStorage.clear()
        return Promise.reject(error)
      }
      config._retry = true
      if (!isRefreshing) {
        isRefreshing = true
        refreshPromise = api
          .post('/auth/jwt/refresh/', { refresh: tokens.refresh })
          .then((res) => {
            const newTokens = { ...tokens, access: res.data.access }
            tokenStorage.set(newTokens)
            return newTokens.access
          })
          .finally(() => {
            isRefreshing = false
          })
      }
      try {
        const newAccess = await refreshPromise
        config.headers.Authorization = `Bearer ${newAccess}`
        return api(config)
      } catch (refreshError) {
        tokenStorage.clear()
        return Promise.reject(refreshError)
      }
    }
    return Promise.reject(error)
  }
)

export default api
