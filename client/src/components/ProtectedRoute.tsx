import { Navigate, Outlet, useLocation } from "react-router-dom";

import { useAuth } from "../features/auth/AuthContext";

export const ProtectedRoute = () => {
  const location = useLocation();
  const { isAuthenticated } = useAuth();

  if (!isAuthenticated) {
    return <Navigate to="/login" replace state={{ from: location.pathname }} />;
  }

  return <Outlet />;
};

export const AdminRoute = () => {
  const location = useLocation();
  const { isAuthenticated, user } = useAuth();

  if (!isAuthenticated || !user?.is_staff) {
    return <Navigate to="/" replace state={{ from: location.pathname }} />;
  }

  return <Outlet />;
};
