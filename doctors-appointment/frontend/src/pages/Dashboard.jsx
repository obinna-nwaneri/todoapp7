import React from "react";
import { Link } from "react-router-dom";

import { useAuth } from "../auth/AuthContext.jsx";

const Dashboard = () => {
  const { profile, user } = useAuth();

  return (
    <div className="card" style={{ gap: "1rem" }}>
      <h2>Welcome {user?.first_name || "to the portal"}</h2>
      {!profile && (
        <p>
          Please <Link to="/login">sign in</Link> or <Link to="/register">create an account</Link> to book an appointment.
        </p>
      )}
      {profile?.role === "PATIENT" && (
        <p>
          Ready to see a doctor? Browse the <Link to="/doctors">doctor directory</Link> and reserve a slot that works for you.
        </p>
      )}
      {profile?.role === "DOCTOR" && (
        <p>
          Review your <Link to="/doctor/schedule">daily schedule</Link> and manage appointment statuses.
        </p>
      )}
      {profile?.role === "ADMIN" && (
        <p>
          Monitor activity from the <Link to="/admin">admin panel</Link> and keep the system organized.
        </p>
      )}
    </div>
  );
};

export default Dashboard;
