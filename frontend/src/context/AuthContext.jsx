import React, { createContext, useCallback, useContext, useEffect, useMemo, useRef, useState } from 'react'

import client from '../api/client.js'

const AuthContext = createContext()

export const AuthProvider = ({ children }) => {
  const [tokens, setTokens] = useState(null)
  const [user, setUser] = useState(null)
  const [loading, setLoading] = useState(false)
  const refreshing = useRef(false)

  const applyAccessToken = useCallback((access) => {
    if (access) {
      client.defaults.headers.common.Authorization = `Bearer ${access}`
    } else {
      delete client.defaults.headers.common.Authorization
    }
  }, [])

  const fetchCurrentUser = useCallback(async () => {
    if (!tokens?.access) return null
    try {
      const { data } = await client.get('/auth/me/')
      setUser(data)
      return data
    } catch (error) {
      console.error('Failed to fetch user profile', error)
      return null
    }
  }, [tokens])

  const login = useCallback(async (email, password) => {
    setLoading(true)
    try {
      const { data } = await client.post('/auth/login/', { email, password })
      setTokens({ access: data.access, refresh: data.refresh })
      applyAccessToken(data.access)
      const profile = await fetchCurrentUser()
      return profile
    } finally {
      setLoading(false)
    }
  }, [applyAccessToken, fetchCurrentUser])

  const registerDoctor = useCallback(async (payload) => {
    await client.post('/auth/register/doctor/', payload)
  }, [])

  const registerPatient = useCallback(async (payload) => {
    await client.post('/auth/register/patient/', payload)
  }, [])

  const logout = useCallback(() => {
    setTokens(null)
    setUser(null)
    applyAccessToken(null)
  }, [applyAccessToken])

  const refreshAccessToken = useCallback(async () => {
    if (!tokens?.refresh || refreshing.current) {
      return null
    }
    refreshing.current = true
    try {
      const { data } = await client.post('/auth/refresh/', { refresh: tokens.refresh })
      setTokens((prev) => ({ ...prev, access: data.access }))
      applyAccessToken(data.access)
      return data.access
    } catch (error) {
      logout()
      return null
    } finally {
      refreshing.current = false
    }
  }, [applyAccessToken, logout, tokens])

  useEffect(() => {
    applyAccessToken(tokens?.access ?? null)
  }, [applyAccessToken, tokens])

  useEffect(() => {
    const responseInterceptor = client.interceptors.response.use(
      (response) => response,
      async (error) => {
        const originalRequest = error.config
        if (error.response?.status === 401 && !originalRequest._retry && tokens?.refresh) {
          originalRequest._retry = true
          const newAccess = await refreshAccessToken()
          if (newAccess) {
            originalRequest.headers.Authorization = `Bearer ${newAccess}`
            return client(originalRequest)
          }
        }
        return Promise.reject(error)
      },
    )
    return () => {
      client.interceptors.response.eject(responseInterceptor)
    }
  }, [refreshAccessToken, tokens])

  const value = useMemo(() => ({
    tokens,
    user,
    loading,
    login,
    logout,
    registerDoctor,
    registerPatient,
    fetchCurrentUser,
    refreshAccessToken,
  }), [tokens, user, loading, login, logout, registerDoctor, registerPatient, fetchCurrentUser, refreshAccessToken])

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>
}

export const useAuth = () => {
  const context = useContext(AuthContext)
  if (!context) {
    throw new Error('useAuth must be used within AuthProvider')
  }
  return context
}
