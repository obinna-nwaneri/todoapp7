import React from "react";
import { Navigate } from "react-router-dom";
import { useAuth } from "../AuthContext";

const ProtectedRoute = ({ children, allowAdmin = false }) => {
  const { user } = useAuth();

  if (!user) {
    return <Navigate to="/login" replace />;
  }

  if (allowAdmin && !user.is_staff) {
    return <Navigate to="/patient" replace />;
  }

  if (!allowAdmin && user.is_staff) {
    return <Navigate to="/admin" replace />;
  }

  return children;
};

export default ProtectedRoute;
