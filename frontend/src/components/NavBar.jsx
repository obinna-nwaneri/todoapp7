import { Link, NavLink, useNavigate } from "react-router-dom";

import { useAuth } from "../context/AuthContext";

export default function NavBar() {
  const navigate = useNavigate();
  const { token, setToken, setRefreshToken, user, setUser } = useAuth();

  const handleLogout = () => {
    setToken(null);
    setRefreshToken(null);
    setUser(null);
    navigate("/login");
  };

  return (
    <nav className="navbar navbar-expand-lg navbar-dark bg-primary mb-4">
      <div className="container-fluid">
        <Link className="navbar-brand" to="/">
          Doctor Portal
        </Link>
        <button
          className="navbar-toggler"
          type="button"
          data-bs-toggle="collapse"
          data-bs-target="#navbarContent"
        >
          <span className="navbar-toggler-icon"></span>
        </button>
        <div className="collapse navbar-collapse" id="navbarContent">
          <ul className="navbar-nav me-auto mb-2 mb-lg-0">
            {token && (
              <>
                <li className="nav-item">
                  <NavLink className="nav-link" to="/dashboard">
                    Dashboard
                  </NavLink>
                </li>
                <li className="nav-item">
                  <NavLink className="nav-link" to="/doctors">
                    Doctors
                  </NavLink>
                </li>
                <li className="nav-item">
                  <NavLink className="nav-link" to="/patients">
                    Patients
                  </NavLink>
                </li>
                <li className="nav-item">
                  <NavLink className="nav-link" to="/appointments">
                    Appointments
                  </NavLink>
                </li>
              </>
            )}
          </ul>
          <div className="d-flex align-items-center text-white">
            {token ? (
              <>
                <span className="me-3">
                  {user?.email} {user?.is_staff ? "(Admin)" : ""}
                </span>
                <button className="btn btn-outline-light" onClick={handleLogout}>
                  Logout
                </button>
              </>
            ) : (
              <>
                <NavLink className="btn btn-outline-light me-2" to="/login">
                  Login
                </NavLink>
                <NavLink className="btn btn-light" to="/register">
                  Register
                </NavLink>
              </>
            )}
          </div>
        </div>
      </div>
    </nav>
  );
}
