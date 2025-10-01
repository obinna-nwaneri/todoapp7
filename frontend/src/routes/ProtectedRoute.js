import { jsx as _jsx } from "react/jsx-runtime";
import { Navigate, Outlet, useLocation } from 'react-router-dom';
import { useAuth } from '@/hooks/useAuth';
const ProtectedRoute = ({ requireAdmin }) => {
    const { user, isAdmin } = useAuth();
    const location = useLocation();
    if (!user) {
        return _jsx(Navigate, { to: "/login", replace: true, state: { from: location } });
    }
    if (requireAdmin && !isAdmin) {
        return _jsx(Navigate, { to: "/", replace: true });
    }
    return _jsx(Outlet, {});
};
export default ProtectedRoute;
