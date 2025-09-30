import { Navigate, useLocation } from 'react-router-dom'

import { useAuth } from './AuthContext'

export default function RequireAuth({ children, roles }) {
  const { isAuthenticated, loading, role } = useAuth()
  const location = useLocation()

  if (loading) {
    return <div className="container">Loading...</div>
  }

  if (!isAuthenticated) {
    return <Navigate to="/login" replace state={{ from: location }} />
  }

  if (roles && !roles.includes(role)) {
    return <div className="container"><div className="card">You do not have permission to view this page.</div></div>
  }

  return children
}
