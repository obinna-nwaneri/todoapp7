import { createContext, useCallback, useEffect, useMemo, useState } from 'react'
import { logout as logoutRequest, fetchProfile } from '@/api/auth'
import { setAuthToken } from '@/api/client'
import type { AuthUser } from '@/types'

interface AuthState {
  user: AuthUser | null
  token: string | null
}

interface AuthContextValue {
  user: AuthUser | null
  token: string | null
  isAdmin: boolean
  setAuthState: (payload: AuthState) => void
  refreshProfile: () => Promise<void>
  logout: () => Promise<void>
}

const STORAGE_KEY = 'enterprise_todo_auth'

export const AuthContext = createContext<AuthContextValue | undefined>(undefined)

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [state, setState] = useState<AuthState>(() => {
    const raw = localStorage.getItem(STORAGE_KEY)
    if (!raw) return { user: null, token: null }
    try {
      const parsed = JSON.parse(raw) as AuthState
      if (parsed.token) {
        setAuthToken(parsed.token)
      }
      return parsed
    } catch {
      return { user: null, token: null }
    }
  })

  useEffect(() => {
    if (state.token) {
      setAuthToken(state.token)
      localStorage.setItem(STORAGE_KEY, JSON.stringify(state))
    } else {
      setAuthToken()
      localStorage.removeItem(STORAGE_KEY)
    }
  }, [state])

  const setAuthState = useCallback((payload: AuthState) => {
    setState(payload)
  }, [])

  const refreshProfile = useCallback(async () => {
    if (!state.token) return
    try {
      const profile = await fetchProfile()
      setState((prev) => ({ ...prev, user: profile }))
    } catch (error) {
      console.error('Failed to refresh profile', error)
      setState({ user: null, token: null })
    }
  }, [state.token])

  const logout = useCallback(async () => {
    try {
      await logoutRequest()
    } catch (error) {
      console.warn('Logout request failed', error)
    }
    setState({ user: null, token: null })
  }, [])

  const value = useMemo<AuthContextValue>(() => ({
    user: state.user,
    token: state.token,
    isAdmin: state.user?.role === 'admin',
    setAuthState,
    refreshProfile,
    logout,
  }), [logout, refreshProfile, setAuthState, state.token, state.user])

  useEffect(() => {
    if (state.token && !state.user) {
      refreshProfile()
    }
  }, [refreshProfile, state.token, state.user])

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>
}
