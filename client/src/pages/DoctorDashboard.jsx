import { useEffect, useState } from 'react';
import { api, authHeaders } from '../api.js';
import { useAuth } from '../context/AuthContext.jsx';

const statusClass = (status) => {
  if (!status) return '';
  switch (status.toLowerCase()) {
    case 'completed':
      return 'status-chip status-completed';
    case 'cancelled':
      return 'status-chip status-cancelled';
    default:
      return 'status-chip status-scheduled';
  }
};

const DoctorDashboard = () => {
  const { auth } = useAuth();
  const [appointments, setAppointments] = useState([]);
  const [error, setError] = useState('');

  const loadAppointments = async () => {
    const { data } = await api.get('/appointments', {
      headers: authHeaders(auth.token),
    });
    setAppointments(data);
  };

  useEffect(() => {
    if (!auth?.token) return;
    loadAppointments().catch((err) => setError(err.message));
  }, [auth?.token]);

  const updateStatus = async (id, status) => {
    try {
      await api.put(
        `/appointments/${id}`,
        { status },
        { headers: authHeaders(auth.token) }
      );
      await loadAppointments();
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to update status');
    }
  };

  return (
    <section className="card">
      <div className="flex-between">
        <div>
          <h2>Upcoming Appointments</h2>
          <p>Manage your schedule and update appointment statuses.</p>
        </div>
        <span className="badge">{appointments.length} scheduled</span>
      </div>
      {error && <p style={{ color: '#b91c1c' }}>{error}</p>}
      {appointments.length === 0 ? (
        <p>No appointments yet.</p>
      ) : (
        <table>
          <thead>
            <tr>
              <th>Patient</th>
              <th>Date</th>
              <th>Time</th>
              <th>Status</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {appointments.map((appointment) => (
              <tr key={appointment.id}>
                <td>
                  {appointment.Patient?.name}
                  <br />
                  <small>{appointment.Patient?.email}</small>
                </td>
                <td>{appointment.date}</td>
                <td>{appointment.time}</td>
                <td>
                  <span className={statusClass(appointment.status)}>{appointment.status}</span>
                </td>
                <td>
                  <div className="actions">
                    <button
                      type="button"
                      onClick={() => updateStatus(appointment.id, 'Completed')}
                      disabled={appointment.status === 'Completed'}
                    >
                      Mark Completed
                    </button>
                    <button
                      type="button"
                      onClick={() => updateStatus(appointment.id, 'Cancelled')}
                      disabled={appointment.status === 'Cancelled'}
                    >
                      Cancel
                    </button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      )}
    </section>
  );
};

export default DoctorDashboard;
