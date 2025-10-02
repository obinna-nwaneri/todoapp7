import { Navigate, Outlet } from 'react-router-dom';
import { useAuth, Role } from '../contexts/AuthContext';

interface ProtectedRouteProps {
  role?: Role;
  redirectTo?: string;
}

const roleRedirectMap: Record<string, string> = {
  ADMIN: '/admin-panel/dashboard',
  DOCTOR: '/doctor-panel/dashboard',
  PATIENT: '/patient-panel/dashboard',
};

const ProtectedRoute: React.FC<ProtectedRouteProps> = ({ role, redirectTo }) => {
  const { user, loading } = useAuth();

  if (loading) {
    return null;
  }

  if (!user) {
    return <Navigate to="/login" replace />;
  }

  if (role && user.role !== role) {
    const fallback = redirectTo || roleRedirectMap[user.role || ''] || '/login';
    return <Navigate to={fallback} replace />;
  }

  return <Outlet />;
};

export default ProtectedRoute;
