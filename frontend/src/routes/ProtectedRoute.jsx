import React, { useEffect } from 'react'
import { Navigate, useLocation } from 'react-router-dom'

import { useAuth } from '../context/AuthContext.jsx'

const ProtectedRoute = ({ allowedRoles, children }) => {
  const { user, tokens, fetchCurrentUser } = useAuth()
  const location = useLocation()

  useEffect(() => {
    if (!user && tokens?.access) {
      fetchCurrentUser()
    }
  }, [fetchCurrentUser, tokens, user])

  if (!tokens?.access) {
    return <Navigate to="/login" state={{ from: location }} replace />
  }

  if (allowedRoles && user && !allowedRoles.includes(user.role)) {
    return <Navigate to="/login" replace />
  }

  if (allowedRoles && !user) {
    return null
  }

  return children
}

export default ProtectedRoute
