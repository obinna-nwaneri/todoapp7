import React from "react";
import { Link, Outlet } from "react-router-dom";

import { useAuth } from "../auth/AuthContext.jsx";
import ProtectedNav from "./ProtectedNav.jsx";

const Layout = () => {
  const { tokens } = useAuth();
  return (
    <div>
      <header>
        <div className="container">
          <h1>Doctor&apos;s Appointment System</h1>
          <nav className="nav-links">
            <Link to="/doctors">Doctors</Link>
            {tokens?.access ? <ProtectedNav /> : <Link to="/login">Login</Link>}
          </nav>
        </div>
      </header>
      <main className="container">
        <Outlet />
      </main>
    </div>
  );
};

export default Layout;
