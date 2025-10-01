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

const PatientDashboard = () => {
  const { auth } = useAuth();
  const [doctors, setDoctors] = useState([]);
  const [appointments, setAppointments] = useState([]);
  const [form, setForm] = useState({ doctorId: '', date: '', time: '' });
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState('');
  const [error, setError] = useState('');

  const loadDoctors = async () => {
    const { data } = await api.get('/doctors');
    setDoctors(data);
  };

  const loadAppointments = async () => {
    const { data } = await api.get('/appointments', {
      headers: authHeaders(auth.token),
    });
    setAppointments(data);
  };

  useEffect(() => {
    if (!auth?.token) return;
    loadDoctors().catch(console.error);
    loadAppointments().catch(console.error);
  }, [auth?.token]);

  const handleChange = (event) => {
    const { name, value } = event.target;
    setForm((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (event) => {
    event.preventDefault();
    setLoading(true);
    setError('');
    setMessage('');
    try {
      await api.post(
        '/appointments',
        {
          doctorId: Number(form.doctorId),
          date: form.date,
          time: form.time,
        },
        { headers: authHeaders(auth.token) }
      );
      setForm({ doctorId: '', date: '', time: '' });
      setMessage('Appointment scheduled!');
      await loadAppointments();
    } catch (err) {
      setError(err.response?.data?.message || 'Could not schedule appointment');
    } finally {
      setLoading(false);
    }
  };

  const cancelAppointment = async (id) => {
    try {
      await api.delete(`/appointments/${id}`, { headers: authHeaders(auth.token) });
      await loadAppointments();
    } catch (err) {
      setError(err.response?.data?.message || 'Could not cancel appointment');
    }
  };

  return (
    <section>
      <div className="card">
        <h2>Book a New Appointment</h2>
        <form onSubmit={handleSubmit} className="form-grid">
          <label>
            Doctor
            <select name="doctorId" value={form.doctorId} onChange={handleChange} required>
              <option value="">Select a doctor</option>
              {doctors.map((doctor) => (
                <option key={doctor.id} value={doctor.id}>
                  {doctor.name} ({doctor.specialization})
                </option>
              ))}
            </select>
          </label>
          <label>
            Date
            <input type="date" name="date" value={form.date} onChange={handleChange} required />
          </label>
          <label>
            Time
            <input type="time" name="time" value={form.time} onChange={handleChange} required />
          </label>
          <div>
            <button type="submit" disabled={loading}>
              {loading ? 'Booking...' : 'Schedule Appointment'}
            </button>
          </div>
        </form>
        {message && <p style={{ color: '#15803d' }}>{message}</p>}
        {error && <p style={{ color: '#b91c1c' }}>{error}</p>}
      </div>

      <div className="card">
        <div className="flex-between">
          <h2>My Appointments</h2>
          <span className="badge">{appointments.length} total</span>
        </div>
        {appointments.length === 0 ? (
          <p>No appointments yet. Book one above!</p>
        ) : (
          <table>
            <thead>
              <tr>
                <th>Doctor</th>
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
                    {appointment.Doctor?.name}
                    <br />
                    <small>{appointment.Doctor?.specialization}</small>
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
                        onClick={() => cancelAppointment(appointment.id)}
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
      </div>
    </section>
  );
};

export default PatientDashboard;
