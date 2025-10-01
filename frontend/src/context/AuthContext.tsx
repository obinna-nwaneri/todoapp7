import { createContext, useCallback, useContext, useEffect, useMemo, useState } from 'react'
import { useQueryClient } from '@tanstack/react-query'
import toast from 'react-hot-toast'
import { login as loginRequest, register as registerRequest, logout as logoutRequest } from '../api/auth'
import { setAuthToken, setUnauthorizedHandler } from '../api/client'
import type { LoginPayload, RegisterPayload, User } from '../types'

interface AuthContextValue {
  user: User | null
  token: string | null
  isAuthenticated: boolean
  loading: boolean
  login: (payload: LoginPayload) => Promise<void>
  register: (payload: RegisterPayload) => Promise<void>
  logout: () => Promise<void>
  setUser: (user: User) => void
}

const AuthContext = createContext<AuthContextValue | undefined>(undefined)

const TOKEN_KEY = 'todoapp_token'
const USER_KEY = 'todoapp_user'

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null)
  const [token, setToken] = useState<string | null>(null)
  const [loading, setLoading] = useState(true)
  const queryClient = useQueryClient()

  const updateUserState = useCallback((nextUser: User) => {
    setUser(nextUser)
    localStorage.setItem(USER_KEY, JSON.stringify(nextUser))
  }, [])

  const clearAuth = useCallback(() => {
    setUser(null)
    setToken(null)
    setAuthToken(null)
    localStorage.removeItem(TOKEN_KEY)
    localStorage.removeItem(USER_KEY)
    queryClient.clear()
  }, [queryClient])

  useEffect(() => {
    const storedToken = localStorage.getItem(TOKEN_KEY)
    const storedUser = localStorage.getItem(USER_KEY)

    if (storedToken && storedUser) {
      try {
        const parsedUser = JSON.parse(storedUser) as User
        setUser(parsedUser)
        setToken(storedToken)
        setAuthToken(storedToken)
      } catch (error) {
        clearAuth()
      }
    }

    setUnauthorizedHandler(() => {
      clearAuth()
      toast.error('Your session has expired. Please login again.')
    })

    setLoading(false)

    return () => {
      setUnauthorizedHandler(null)
    }
  }, [clearAuth])

  const login = useCallback(
    async (payload: LoginPayload) => {
      const response = await loginRequest(payload)
      updateUserState(response.user)
      setToken(response.token)
      setAuthToken(response.token)
      localStorage.setItem(TOKEN_KEY, response.token)
      toast.success(response.message ?? 'Logged in successfully')
    },
    [updateUserState]
  )

  const register = useCallback(
    async (payload: RegisterPayload) => {
      const response = await registerRequest(payload)
      updateUserState(response.user)
      setToken(response.token)
      setAuthToken(response.token)
      localStorage.setItem(TOKEN_KEY, response.token)
      toast.success(response.message ?? 'Account created')
    },
    [updateUserState]
  )

  const logout = useCallback(async () => {
    try {
      await logoutRequest()
    } catch (error) {
      // ignore network/auth errors on logout
    }
    clearAuth()
    toast.success('Logged out successfully')
  }, [clearAuth])

  const value = useMemo<AuthContextValue>(() => ({
    user,
    token,
    isAuthenticated: Boolean(user && token),
    loading,
    login,
    register,
    logout,
    setUser: updateUserState,
  }), [user, token, loading, login, register, logout, updateUserState])

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>
}

export function useAuthContext() {
  const context = useContext(AuthContext)
  if (!context) {
    throw new Error('useAuthContext must be used within an AuthProvider')
  }
  return context
}
