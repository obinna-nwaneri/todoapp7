import { createContext, useContext, useMemo, useState } from 'react'

const AuthContext = createContext()

const getStoredUser = () => {
  const raw = localStorage.getItem('auth_user')
  return raw ? JSON.parse(raw) : null
}

const getStoredToken = () => localStorage.getItem('auth_token')

export const AuthProvider = ({ children }) => {
  const [token, setToken] = useState(getStoredToken())
  const [user, setUser] = useState(getStoredUser())

  const login = ({ token: authToken, user: authUser }) => {
    const accessToken = authToken?.token || authToken
    if (accessToken) {
      localStorage.setItem('auth_token', accessToken)
      setToken(accessToken)
    }

    if (authUser) {
      localStorage.setItem('auth_user', JSON.stringify(authUser))
      setUser(authUser)
    }
  }

  const logout = () => {
    localStorage.removeItem('auth_token')
    localStorage.removeItem('auth_user')
    setToken(null)
    setUser(null)
  }

  const value = useMemo(() => ({
    token,
    user,
    isAuthenticated: Boolean(token),
    isAdmin: user?.role === 'admin',
    login,
    logout,
    setUser
  }), [token, user])

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>
}

export const useAuth = () => useContext(AuthContext)
