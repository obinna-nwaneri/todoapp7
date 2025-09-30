const statusColors = {
  PENDING: '#f97316',
  CONFIRMED: '#16a34a',
  CANCELLED: '#dc2626',
  COMPLETED: '#0ea5e9',
}

function formatTime(value) {
  return value ? value.substring(0, 5) : ''
}

export default function AppointmentCard({ appointment, role, onCancel, onStatusChange }) {
  const doctorName = appointment?.doctor_detail?.user?.first_name
    ? `${appointment.doctor_detail.user.first_name} ${appointment.doctor_detail.user.last_name}`.trim()
    : `Doctor #${appointment.doctor}`
  const patientName = appointment?.patient_detail?.user?.first_name
    ? `${appointment.patient_detail.user.first_name} ${appointment.patient_detail.user.last_name}`.trim()
    : `Patient #${appointment.patient}`

  return (
    <div className="card">
      <h3 style={{ marginTop: 0 }}>{doctorName}</h3>
      <p style={{ margin: '0.25rem 0' }}>Patient: {patientName}</p>
      <p style={{ margin: '0.25rem 0' }}>
        {appointment.date} · {formatTime(appointment.start_time)} - {formatTime(appointment.end_time)}
      </p>
      <p style={{ margin: '0.25rem 0', fontWeight: 600, color: statusColors[appointment.status] ?? '#0f172a' }}>
        {appointment.status}
      </p>
      {appointment.reason && <p style={{ margin: '0.5rem 0', color: '#475569' }}>{appointment.reason}</p>}
      <div style={{ display: 'flex', gap: '0.75rem', flexWrap: 'wrap' }}>
        {role === 'PATIENT' && ['PENDING', 'CONFIRMED'].includes(appointment.status) && (
          <button className="btn" type="button" onClick={() => onCancel?.(appointment)}>
            Cancel
          </button>
        )}
        {role === 'DOCTOR' && appointment.status === 'PENDING' && (
          <button className="btn" type="button" onClick={() => onStatusChange?.(appointment, 'CONFIRMED')}>
            Confirm
          </button>
        )}
        {role === 'DOCTOR' && appointment.status === 'CONFIRMED' && (
          <button className="btn" type="button" onClick={() => onStatusChange?.(appointment, 'COMPLETED')}>
            Mark Completed
          </button>
        )}
        {role === 'DOCTOR' && ['PENDING', 'CONFIRMED'].includes(appointment.status) && (
          <button
            className="btn"
            type="button"
            style={{ background: '#dc2626' }}
            onClick={() => onStatusChange?.(appointment, 'CANCELLED')}
          >
            Cancel
          </button>
        )}
      </div>
    </div>
  )
}
