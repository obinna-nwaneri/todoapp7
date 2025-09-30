import { createContext, useContext, useEffect, useMemo, useState } from 'react'

import { fetchCurrentUser, login as loginRequest, logout as logoutRequest, register as registerRequest } from '../api/auth'
import { tokenStorage } from '../api/client'

const AuthContext = createContext(null)

export function AuthProvider({ children }) {
  const [state, setState] = useState({
    user: null,
    profile: null,
    tokens: tokenStorage.get(),
    loading: true,
  })

  useEffect(() => {
    let mounted = true
    const initialise = async () => {
      const tokens = tokenStorage.get()
      if (!tokens) {
        if (mounted) setState((prev) => ({ ...prev, loading: false }))
        return
      }
      try {
        const data = await fetchCurrentUser()
        if (mounted) {
          setState({ user: data.user, profile: data.profile, tokens, loading: false })
        }
      } catch (error) {
        tokenStorage.clear()
        if (mounted) setState({ user: null, profile: null, tokens: null, loading: false })
      }
    }
    initialise()
    const unsubscribe = tokenStorage.subscribe((tokens) => {
      setState((prev) => ({ ...prev, tokens }))
    })
    return () => {
      mounted = false
      unsubscribe()
    }
  }, [])

  const login = async (credentials) => {
    const tokens = await loginRequest(credentials)
    const data = await fetchCurrentUser()
    const payload = { user: data.user, profile: data.profile, tokens, loading: false }
    setState(payload)
    return payload
  }

  const logout = () => {
    logoutRequest()
    setState({ user: null, profile: null, tokens: null, loading: false })
  }

  const register = (payload) => registerRequest(payload)

  const value = useMemo(
    () => ({
      ...state,
      role: state.profile?.role,
      isAuthenticated: Boolean(state.tokens),
      login,
      logout,
      register,
    }),
    [state]
  )

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>
}

export function useAuth() {
  const context = useContext(AuthContext)
  if (!context) throw new Error('useAuth must be used within AuthProvider')
  return context
}
