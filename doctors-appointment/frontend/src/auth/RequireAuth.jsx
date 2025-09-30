import { Navigate, useLocation } from "react-router-dom";

import { useAuth } from "./AuthContext.jsx";

const RequireAuth = ({ role, children }) => {
  const location = useLocation();
  const { tokens, role: userRole, loading } = useAuth();

  if (loading) {
    return <p>Loading...</p>;
  }

  if (!tokens?.access) {
    return <Navigate to="/login" replace state={{ from: location }} />;
  }

  if (role && userRole !== role) {
    return <Navigate to="/" replace />;
  }

  return children;
};

export default RequireAuth;
