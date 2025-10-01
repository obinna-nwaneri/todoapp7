import React, { createContext, useContext, useEffect, useMemo, useState } from 'react'

const AuthContext = createContext(null)

const STORAGE_KEY = 'enterprise_todo_auth'

function getStoredState() {
  if (typeof window === 'undefined') {
    return { token: null, user: null }
  }

  const stored = window.localStorage.getItem(STORAGE_KEY)
  if (stored) {
    try {
      return JSON.parse(stored)
    } catch (error) {
      console.error('Failed to parse auth state', error)
    }
  }
  return { token: null, user: null }
}

export function AuthProvider({ children }) {
  const [authState, setAuthState] = useState(getStoredState)

  useEffect(() => {
    if (typeof window !== 'undefined') {
      window.localStorage.setItem(STORAGE_KEY, JSON.stringify(authState))
    }
  }, [authState])

  const value = useMemo(
    () => ({
      ...authState,
      isAuthenticated: Boolean(authState?.token),
      login: (token, user) => setAuthState({ token, user }),
      logout: () => setAuthState({ token: null, user: null }),
    }),
    [authState]
  )

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>
}

export function useAuthContext() {
  const context = useContext(AuthContext)
  if (!context) {
    throw new Error('useAuthContext must be used within an AuthProvider')
  }
  return context
}
