import React from 'react'
import { Navigate, Outlet } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'

const AuthGuard: React.FC = () => {
  const { user, loading } = useAuth()

  if (loading) {
    return <div className="py-20 text-center text-slate-600">Loading...</div>
  }

  if (!user) {
    return <Navigate to="/login" replace />
  }

  return <Outlet />
}

export default AuthGuard
