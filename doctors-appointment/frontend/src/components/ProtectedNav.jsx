import { Link } from "react-router-dom";

import { useAuth } from "../auth/AuthContext.jsx";

const ProtectedNav = () => {
  const { role } = useAuth();

  return (
    <nav className="nav-links">
      <Link to="/">Dashboard</Link>
      <Link to="/doctors">Doctors</Link>
      {role === "PATIENT" && (
        <>
          <Link to="/me/appointments">My Appointments</Link>
        </>
      )}
      {role === "DOCTOR" && <Link to="/doctor/schedule">My Schedule</Link>}
      {role === "ADMIN" && <Link to="/admin">Admin Panel</Link>}
    </nav>
  );
};

export default ProtectedNav;
