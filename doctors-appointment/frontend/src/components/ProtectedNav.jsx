import React from "react";
import { Link } from "react-router-dom";

import { useAuth } from "../auth/AuthContext.jsx";

const ProtectedNav = () => {
  const { profile, logout } = useAuth();
  return (
    <>
      <Link to="/">Dashboard</Link>
      {profile?.role === "PATIENT" && (
        <>
          <Link to="/me/appointments">My Appointments</Link>
        </>
      )}
      {profile?.role === "DOCTOR" && <Link to="/doctor/schedule">Doctor Schedule</Link>}
      {profile?.role === "ADMIN" && <Link to="/admin">Admin Panel</Link>}
      <button className="button secondary" onClick={logout} type="button">
        Logout
      </button>
    </>
  );
};

export default ProtectedNav;
