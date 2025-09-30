import { Link } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";

import { useAuth } from "../auth/AuthContext.jsx";
import { listAppointments } from "../api/appointments.js";

const Dashboard = () => {
  const { user, role } = useAuth();
  const { data } = useQuery({
    queryKey: ["dashboard-appointments", role],
    queryFn: () => listAppointments({ page: 1 }),
    enabled: Boolean(role),
  });

  const upcoming = data?.results?.find((item) => new Date(item.date) >= new Date());

  return (
    <div className="card">
      <h1>Welcome {user?.first_name || user?.username}</h1>
      <p>Manage appointments efficiently with this dashboard.</p>
      {role === "PATIENT" && (
        <>
          <p>
            {upcoming ? (
              <>
                Your next visit with Dr. {upcoming.doctor.user.first_name} {upcoming.doctor.user.last_name} is on {new Date(upcoming.date).toLocaleDateString()} at {upcoming.start_time}.
              </>
            ) : (
              "You have no upcoming appointments."
            )}
          </p>
          <Link className="primary" to="/doctors">
            Browse Doctors
          </Link>
        </>
      )}
      {role === "DOCTOR" && (
        <>
          <p>Review today&apos;s schedule and confirm appointments.</p>
          <Link className="primary" to="/doctor/schedule">
            View Schedule
          </Link>
        </>
      )}
      {role === "ADMIN" && (
        <>
          <p>Monitor all appointments and system health.</p>
          <Link className="primary" to="/admin">
            Open Admin Panel
          </Link>
        </>
      )}
    </div>
  );
};

export default Dashboard;
