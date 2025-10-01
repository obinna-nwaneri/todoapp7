import React, { useEffect, useState } from 'react';
import api from '../api';
import { useAuthContext } from '../auth/AuthContext';

interface Doctor {
  id: number;
  name: string;
  specialization: string;
}

interface Appointment {
  id: number;
  date: string;
  time: string;
  status: string;
  doctor: {
    name: string;
    specialization: string;
  };
}

const PatientDashboard: React.FC = () => {
  const { token, patientId } = useAuthContext();
  const [doctors, setDoctors] = useState<Doctor[]>([]);
  const [appointments, setAppointments] = useState<Appointment[]>([]);
  const [form, setForm] = useState({ doctorId: '', date: '', time: '' });
  const [loading, setLoading] = useState(false);

  const loadData = async () => {
    if (!token) return;
    const [doctorRes, appointmentRes] = await Promise.all([
      api.get<Doctor[]>('/doctors'),
      api.get<Appointment[]>('/appointments'),
    ]);
    setDoctors(doctorRes.data);
    setAppointments(appointmentRes.data);
  };

  useEffect(() => {
    loadData();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [token]);

  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault();
    if (!patientId) return;
    setLoading(true);
    try {
      await api.post('/appointments', {
        doctorId: Number(form.doctorId),
        patientId,
        date: form.date,
        time: form.time,
      });
      setForm({ doctorId: '', date: '', time: '' });
      await loadData();
    } finally {
      setLoading(false);
    }
  };

  const cancelAppointment = async (id: number) => {
    setLoading(true);
    try {
      await api.delete(`/appointments/${id}`);
      await loadData();
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="row g-4">
      <div className="col-lg-5">
        <div className="card p-4">
          <h4 className="mb-3">Book Appointment</h4>
          <form onSubmit={handleSubmit}>
            <div className="mb-2">
              <label className="form-label">Doctor</label>
              <select
                className="form-select"
                value={form.doctorId}
                onChange={(e) => setForm({ ...form, doctorId: e.target.value })}
                required
              >
                <option value="">Select a doctor</option>
                {doctors.map((doctor) => (
                  <option value={doctor.id} key={doctor.id}>
                    {doctor.name} ({doctor.specialization})
                  </option>
                ))}
              </select>
            </div>
            <div className="mb-2">
              <label className="form-label">Date</label>
              <input
                type="date"
                className="form-control"
                value={form.date}
                onChange={(e) => setForm({ ...form, date: e.target.value })}
                required
              />
            </div>
            <div className="mb-3">
              <label className="form-label">Time</label>
              <input
                type="time"
                className="form-control"
                value={form.time}
                onChange={(e) => setForm({ ...form, time: e.target.value })}
                required
              />
            </div>
            <button className="btn btn-primary w-100" type="submit" disabled={loading}>
              Book Appointment
            </button>
          </form>
        </div>
      </div>
      <div className="col-lg-7">
        <div className="card p-4">
          <h4>My Appointments</h4>
          <div className="table-responsive">
            <table className="table table-striped">
              <thead>
                <tr>
                  <th>Date</th>
                  <th>Time</th>
                  <th>Doctor</th>
                  <th>Status</th>
                  <th></th>
                </tr>
              </thead>
              <tbody>
                {appointments.map((appointment) => (
                  <tr key={appointment.id}>
                    <td>{appointment.date}</td>
                    <td>{appointment.time}</td>
                    <td>
                      {appointment.doctor.name}
                      <div className="text-muted small">{appointment.doctor.specialization}</div>
                    </td>
                    <td>
                      <span className={`badge bg-${getStatusColor(appointment.status)}`}>
                        {appointment.status}
                      </span>
                    </td>
                    <td className="text-end">
                      <button
                        className="btn btn-sm btn-outline-danger"
                        onClick={() => cancelAppointment(appointment.id)}
                        disabled={loading}
                      >
                        Cancel
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
};

const getStatusColor = (status: string) => {
  switch (status) {
    case 'Scheduled':
      return 'info';
    case 'Completed':
      return 'success';
    case 'Cancelled':
      return 'danger';
    default:
      return 'secondary';
  }
};

export default PatientDashboard;
