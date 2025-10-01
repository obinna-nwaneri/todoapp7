import { createContext, useContext, useState, useEffect } from 'react'
import type { ReactNode } from 'react'
import api from '../api/client'

export interface AuthUser {
  id: number
  name: string
  email: string
  role: 'patient' | 'doctor' | 'admin'
  doctorProfile?: {
    id: number
    specialty: string
    consultationFee: number
    yearsExperience: number
    location: string | null
  }
}

interface AuthContextProps {
  user: AuthUser | null
  token: string | null
  loading: boolean
  login: (email: string, password: string) => Promise<void>
  logout: () => Promise<void>
  registerPatient: (payload: Record<string, unknown>) => Promise<void>
  registerDoctor: (payload: Record<string, unknown>) => Promise<void>
}

const AuthContext = createContext<AuthContextProps | undefined>(undefined)

export const AuthProvider = ({ children }: { children: ReactNode }) => {
  const [user, setUser] = useState<AuthUser | null>(null)
  const [token, setToken] = useState<string | null>(localStorage.getItem('token'))
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const bootstrap = async () => {
      if (!token) {
        setLoading(false)
        return
      }

      try {
        const { data } = await api.get('/auth/me')
        setUser(data.data.user)
      } catch (error) {
        localStorage.removeItem('token')
        setToken(null)
      } finally {
        setLoading(false)
      }
    }

    bootstrap()
  }, [token])

  const login = async (email: string, password: string) => {
    const { data } = await api.post('/auth/login', { email, password })
    const authToken = data.data.token as string
    localStorage.setItem('token', authToken)
    setToken(authToken)
    setUser(data.data.user)
  }

  const logout = async () => {
    try {
      await api.post('/auth/logout')
    } finally {
      localStorage.removeItem('token')
      setToken(null)
      setUser(null)
    }
  }

  const registerPatient = async (payload: Record<string, unknown>) => {
    const { data } = await api.post('/auth/register/patient', payload)
    const authToken = data.data.token as string
    localStorage.setItem('token', authToken)
    setToken(authToken)
    setUser(data.data.user)
  }

  const registerDoctor = async (payload: Record<string, unknown>) => {
    const { data } = await api.post('/auth/register/doctor', payload)
    const authToken = data.data.token as string
    localStorage.setItem('token', authToken)
    setToken(authToken)
    setUser(data.data.user)
  }

  return (
    <AuthContext.Provider value={{ user, token, loading, login, logout, registerPatient, registerDoctor }}>
      {children}
    </AuthContext.Provider>
  )
}

export const useAuthContext = () => {
  const context = useContext(AuthContext)
  if (!context) {
    throw new Error('useAuthContext must be used within an AuthProvider')
  }
  return context
}
