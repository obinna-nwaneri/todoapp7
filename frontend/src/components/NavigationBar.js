import React from "react";
import { Link, NavLink } from "react-router-dom";
import { useAuth } from "../AuthContext";

const NavigationBar = () => {
  const { user, logout } = useAuth();

  return (
    <nav className="navbar navbar-expand-lg navbar-dark bg-primary mb-4">
      <div className="container-fluid">
        <Link className="navbar-brand" to={user?.is_staff ? "/admin" : "/patient"}>
          MedicoPlus
        </Link>
        <div className="collapse navbar-collapse show">
          <ul className="navbar-nav me-auto">
            {user && !user.is_staff && (
              <>
                <li className="nav-item">
                  <NavLink className="nav-link" to="/patient">
                    Dashboard
                  </NavLink>
                </li>
                <li className="nav-item">
                  <NavLink className="nav-link" to="/profile">
                    Profile
                  </NavLink>
                </li>
              </>
            )}
            {user?.is_staff && (
              <li className="nav-item">
                <NavLink className="nav-link" to="/admin">
                  Admin Panel
                </NavLink>
              </li>
            )}
          </ul>
          <ul className="navbar-nav ms-auto">
            {user ? (
              <li className="nav-item">
                <button className="btn btn-outline-light" onClick={logout}>
                  Logout
                </button>
              </li>
            ) : (
              <>
                <li className="nav-item">
                  <NavLink className="nav-link" to="/login">
                    Login
                  </NavLink>
                </li>
                <li className="nav-item">
                  <NavLink className="nav-link" to="/register">
                    Register
                  </NavLink>
                </li>
              </>
            )}
          </ul>
        </div>
      </div>
    </nav>
  );
};

export default NavigationBar;
