import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from 'react'
import {
  fetchProfile,
  login as loginRequest,
  register as registerRequest,
} from '../services/api'
import type { AuthResponse, AuthUser } from '../types'

type AuthContextValue = {
  user: AuthUser | null
  token: string | null
  loading: boolean
  login: (email: string, password: string) => Promise<AuthResponse>
  register: (fullName: string, email: string, password: string) => Promise<AuthResponse>
  logout: () => void
}

const AuthContext = createContext<AuthContextValue | undefined>(undefined)

const STORAGE_KEY = 'enterprise-todo-auth'

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<AuthUser | null>(null)
  const [token, setToken] = useState<string | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const raw = localStorage.getItem(STORAGE_KEY)
    if (!raw) {
      setLoading(false)
      return
    }

    const parsed = JSON.parse(raw) as { token: string; user: AuthUser }
    setToken(parsed.token)
    setUser(parsed.user)

    fetchProfile(parsed.token)
      .then((profile) => {
        setUser(profile)
        localStorage.setItem(STORAGE_KEY, JSON.stringify({ token: parsed.token, user: profile }))
      })
      .catch(() => {
        localStorage.removeItem(STORAGE_KEY)
        setUser(null)
        setToken(null)
      })
      .finally(() => setLoading(false))
  }, [])

  const persist = useCallback((authResponse: AuthResponse) => {
    const authToken = authResponse.token.token
    setToken(authToken)
    setUser(authResponse.user)
    localStorage.setItem(
      STORAGE_KEY,
      JSON.stringify({ token: authToken, user: authResponse.user })
    )
    return authResponse
  }, [])

  const login = useCallback(async (email: string, password: string) => {
    const response = await loginRequest(email, password)
    return persist(response)
  }, [persist])

  const register = useCallback(
    async (fullName: string, email: string, password: string) => {
      const response = await registerRequest(fullName, email, password)
      return persist(response)
    },
    [persist]
  )

  const logout = useCallback(() => {
    setUser(null)
    setToken(null)
    localStorage.removeItem(STORAGE_KEY)
  }, [])

  const value = useMemo(
    () => ({ user, token, loading, login, register, logout }),
    [user, token, loading, login, register, logout]
  )

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>
}

export function useAuthContext(): AuthContextValue {
  const context = useContext(AuthContext)
  if (!context) {
    throw new Error('useAuthContext must be used within an AuthProvider')
  }
  return context
}
