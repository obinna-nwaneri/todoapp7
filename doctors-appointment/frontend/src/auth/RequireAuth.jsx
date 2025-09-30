import React from "react";
import { Navigate, Outlet, useLocation } from "react-router-dom";

import { useAuth } from "./AuthContext.jsx";

export const RequireAuth = ({ role }) => {
  const { tokens, profile, loading } = useAuth();
  const location = useLocation();

  if (loading) {
    return <div className="container">Loading...</div>;
  }

  if (!tokens?.access) {
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  if (role && profile?.role !== role) {
    return <Navigate to="/" replace />;
  }

  return <Outlet />;
};

export default RequireAuth;
