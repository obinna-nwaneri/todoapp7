const formatDate = (value) => new Date(value).toLocaleDateString();

const AppointmentCard = ({ appointment, role, onCancel, onStatusChange }) => {
  const { doctor, patient, date, start_time: startTime, end_time: endTime, status, reason } = appointment;

  return (
    <div className="card">
      <div>
        <strong>{formatDate(date)}</strong>
        <p>
          {startTime} - {endTime}
        </p>
      </div>
      <p>
        <strong>Doctor:</strong> Dr. {doctor?.user?.first_name} {doctor?.user?.last_name}
      </p>
      {role !== "DOCTOR" && (
        <p>
          <strong>Clinic:</strong> {doctor?.clinic_name}
        </p>
      )}
      {role !== "PATIENT" && patient && (
        <p>
          <strong>Patient:</strong> {patient?.user?.first_name} {patient?.user?.last_name}
        </p>
      )}
      {reason && <p>{reason}</p>}
      <span className={`status-tag status-${status}`}>{status}</span>
      <div style={{ display: "flex", gap: "0.5rem", flexWrap: "wrap" }}>
        {role === "PATIENT" && ["PENDING", "CONFIRMED"].includes(status) && (
          <button type="button" className="secondary" onClick={() => onCancel?.(appointment)}>
            Cancel
          </button>
        )}
        {role === "DOCTOR" && status === "PENDING" && (
          <button type="button" className="primary" onClick={() => onStatusChange?.(appointment, "CONFIRMED")}>Confirm</button>
        )}
        {role === "DOCTOR" && status === "CONFIRMED" && (
          <>
            <button type="button" className="primary" onClick={() => onStatusChange?.(appointment, "COMPLETED")}>
              Mark Completed
            </button>
            <button type="button" className="secondary" onClick={() => onStatusChange?.(appointment, "CANCELLED")}>
              Cancel
            </button>
          </>
        )}
      </div>
    </div>
  );
};

export default AppointmentCard;
