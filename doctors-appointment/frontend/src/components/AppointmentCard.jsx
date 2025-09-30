import React from "react";

const AppointmentCard = ({ appointment, onCancel, onStatusChange }) => {
  const { doctor, patient, date, start_time, end_time, status, reason } = appointment;
  return (
    <div className="card">
      <div className="flex-between">
        <h3>{doctor?.user?.first_name ? `Dr. ${doctor.user.first_name} ${doctor.user.last_name}` : `Doctor #${doctor}`}</h3>
        <span className={`badge status-${status}`}>{status}</span>
      </div>
      <p>
        {date} · {start_time} - {end_time}
      </p>
      {patient?.user && <p>Patient: {patient.user.first_name} {patient.user.last_name}</p>}
      {reason && <p>Reason: {reason}</p>}
      <div className="nav-links" style={{ justifyContent: "flex-start" }}>
        {onCancel && (status === "PENDING" || status === "CONFIRMED") && (
          <button className="button danger" type="button" onClick={() => onCancel(appointment)}>
            Cancel
          </button>
        )}
        {onStatusChange && status === "PENDING" && (
          <button className="button" type="button" onClick={() => onStatusChange(appointment, "CONFIRMED")}>
            Confirm
          </button>
        )}
        {onStatusChange && status === "CONFIRMED" && (
          <>
            <button className="button" type="button" onClick={() => onStatusChange(appointment, "COMPLETED")}>
              Complete
            </button>
            <button className="button danger" type="button" onClick={() => onStatusChange(appointment, "CANCELLED")}>
              Cancel
            </button>
          </>
        )}
      </div>
    </div>
  );
};

export default AppointmentCard;
