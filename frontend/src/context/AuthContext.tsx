import React, { createContext, useContext, useEffect, useState } from 'react'
import { apiClient, setAuthToken } from '../api/client'

export type User = {
  id: number
  fullName: string
  email: string
  role: 'admin' | 'user' | 'team_lead'
  isActive: boolean
}

type AuthContextValue = {
  user: User | null
  loading: boolean
  login: (email: string, password: string) => Promise<void>
  logout: () => Promise<void>
  register: (data: { fullName: string; email: string; password: string }) => Promise<void>
  refresh: () => Promise<void>
}

const AuthContext = createContext<AuthContextValue | undefined>(undefined)

export const AuthProvider: React.FC<React.PropsWithChildren> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    refresh()
  }, [])

  const refresh = async () => {
    const token = localStorage.getItem('token')
    if (!token) {
      setLoading(false)
      return
    }
    try {
      const { data } = await apiClient.get('/api/me')
      setUser(data)
    } catch (error) {
      setAuthToken(null)
      setUser(null)
    } finally {
      setLoading(false)
    }
  }

  const login = async (email: string, password: string) => {
    setLoading(true)
    const { data } = await apiClient.post('/auth/login', { email, password })
    const token: string | undefined = data.token?.token || data.token?.value || data.token
    if (token) {
      setAuthToken(token)
      await refresh()
    }
    setLoading(false)
  }

  const register = async ({ fullName, email, password }: { fullName: string; email: string; password: string }) => {
    setLoading(true)
    await apiClient.post('/auth/register', { fullName, email, password })
    await login(email, password)
    setLoading(false)
  }

  const logout = async () => {
    await apiClient.post('/api/logout')
    setAuthToken(null)
    setUser(null)
    setLoading(false)
  }

  return (
    <AuthContext.Provider value={{ user, loading, login, logout, register, refresh }}>
      {children}
    </AuthContext.Provider>
  )
}

export const useAuth = () => {
  const context = useContext(AuthContext)
  if (!context) {
    throw new Error('useAuth must be used within AuthProvider')
  }
  return context
}
