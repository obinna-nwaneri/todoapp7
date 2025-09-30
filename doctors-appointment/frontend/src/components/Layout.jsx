import { Outlet, Link, useNavigate } from "react-router-dom";

import { useAuth } from "../auth/AuthContext.jsx";
import ProtectedNav from "./ProtectedNav.jsx";

const Layout = () => {
  const navigate = useNavigate();
  const { tokens, user, logout } = useAuth();

  const handleLogout = () => {
    logout();
    navigate("/login");
  };

  return (
    <>
      <header>
        <div className="navbar">
          <Link to="/" style={{ fontWeight: 700, fontSize: "1.1rem" }}>
            Doctor&apos;s Appointment
          </Link>
          {tokens?.access ? <ProtectedNav /> : <nav className="nav-links"><Link to="/doctors">Doctors</Link></nav>}
          <div className="nav-links">
            {tokens?.access ? (
              <>
                <span>Hi, {user?.first_name || user?.username}</span>
                <button className="secondary" onClick={handleLogout} type="button">
                  Logout
                </button>
              </>
            ) : (
              <>
                <Link to="/login">Login</Link>
                <Link to="/register">Register</Link>
              </>
            )}
          </div>
        </div>
      </header>
      <main>
        <Outlet />
      </main>
    </>
  );
};

export default Layout;
