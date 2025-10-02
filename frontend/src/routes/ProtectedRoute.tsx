import { Navigate, Outlet } from 'react-router-dom';

import { useAuth } from '../context/AuthContext';
import { useRoleRedirect } from '../hooks/useRoleRedirect';
import { UserRole } from '../types/auth';

interface ProtectedRouteProps {
  allowedRoles?: UserRole[];
}

export const ProtectedRoute: React.FC<ProtectedRouteProps> = ({ allowedRoles }) => {
  const { accessToken, role } = useAuth();
  const fallback = useRoleRedirect(role);

  if (!accessToken || !role) {
    return <Navigate to="/login" replace />;
  }

  if (allowedRoles && !allowedRoles.includes(role)) {
    return <Navigate to={fallback} replace />;
  }

  return <Outlet />;
};
