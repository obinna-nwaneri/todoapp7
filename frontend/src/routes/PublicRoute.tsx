import { Navigate, Outlet } from 'react-router-dom'
import { useAuth } from '@/hooks/useAuth'

const PublicRoute: React.FC = () => {
  const { user } = useAuth()
  if (user) {
    return <Navigate to="/" replace />
  }
  return <Outlet />
}

export default PublicRoute
