import { Link, NavLink, Outlet, useNavigate } from "react-router-dom";

import { useAuth } from "../features/auth/AuthContext";

const navLinkClasses = ({ isActive }: { isActive: boolean }) =>
  `px-3 py-2 rounded-md text-sm font-medium ${
    isActive ? "bg-slate-800 text-white" : "text-slate-200 hover:bg-slate-800 hover:text-white"
  }`;

export const AppLayout = () => {
  const { isAuthenticated, user, logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = async () => {
    await logout();
    navigate("/");
  };

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100">
      <header className="border-b border-slate-800 bg-slate-900">
        <nav className="mx-auto flex max-w-6xl items-center justify-between px-4 py-3">
          <Link to="/" className="text-xl font-bold">
            TaskFlow
          </Link>
          <div className="flex items-center gap-2">
            <NavLink to="/" className={navLinkClasses}>
              Home
            </NavLink>
            {isAuthenticated ? (
              <>
                <NavLink to="/app" className={navLinkClasses}>
                  My Tasks
                </NavLink>
                <NavLink to="/change-password" className={navLinkClasses}>
                  Change Password
                </NavLink>
                {user?.is_staff && (
                  <NavLink to="/admin" className={navLinkClasses}>
                    Admin
                  </NavLink>
                )}
                <button
                  type="button"
                  onClick={handleLogout}
                  className="rounded-md bg-rose-600 px-3 py-2 text-sm font-semibold text-white hover:bg-rose-500"
                >
                  Logout
                </button>
              </>
            ) : (
              <>
                <NavLink to="/login" className={navLinkClasses}>
                  Login
                </NavLink>
                <NavLink to="/register" className={navLinkClasses}>
                  Register
                </NavLink>
              </>
            )}
          </div>
        </nav>
      </header>
      <main className="mx-auto flex max-w-6xl flex-1 flex-col gap-6 px-4 py-8">
        <Outlet />
      </main>
    </div>
  );
};
