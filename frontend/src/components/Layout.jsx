import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "../hooks/useAuth";

export default function Layout({ children }) {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate("/login");
  };

  const linksByRole = {
    ADMIN: [
      { to: "/admin-panel/dashboard", label: "Dashboard" },
      { to: "/admin-panel/doctors", label: "Doctors" },
      { to: "/admin-panel/patients", label: "Patients" },
      { to: "/admin-panel/appointments", label: "Appointments" },
    ],
    DOCTOR: [
      { to: "/doctor-panel/dashboard", label: "Dashboard" },
      { to: "/doctor-panel/appointments", label: "Appointments" },
    ],
    PATIENT: [
      { to: "/patient-panel/dashboard", label: "Dashboard" },
      { to: "/patient-panel/appointments", label: "Appointments" },
      { to: "/patient-panel/book", label: "Book" },
    ],
  };

  return (
    <div className="app-shell">
      <header className="app-header">
        <h1>Clinic Scheduler</h1>
        <div className="header-actions">
          {user ? <span>{user.email} ({user.role})</span> : null}
          {user ? (
            <button onClick={handleLogout} className="btn-secondary">Logout</button>
          ) : (
            <Link to="/login">Login</Link>
          )}
        </div>
      </header>
      {user && (
        <nav className="app-nav">
          {linksByRole[user.role]?.map((link) => (
            <Link key={link.to} to={link.to} className="nav-link">
              {link.label}
            </Link>
          ))}
        </nav>
      )}
      <main className="app-main">{children}</main>
    </div>
  );
}
