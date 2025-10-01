import React, { useEffect, useState } from 'react';
import api from '../api';
import { useAuthContext } from '../auth/AuthContext';

interface Appointment {
  id: number;
  date: string;
  time: string;
  status: string;
  patient: {
    name: string;
    email: string;
  };
  doctor: {
    name: string;
  };
}

const DoctorDashboard: React.FC = () => {
  const { token } = useAuthContext();
  const [appointments, setAppointments] = useState<Appointment[]>([]);
  const [loading, setLoading] = useState(false);

  const loadAppointments = async () => {
    if (!token) return;
    const response = await api.get<Appointment[]>('/appointments');
    setAppointments(response.data);
  };

  useEffect(() => {
    loadAppointments();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [token]);

  const updateStatus = async (appointmentId: number, status: string) => {
    setLoading(true);
    try {
      await api.put(`/appointments/${appointmentId}`, { status });
      await loadAppointments();
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="card p-4">
      <h3 className="mb-3">My Appointments</h3>
      <div className="table-responsive">
        <table className="table table-striped">
          <thead>
            <tr>
              <th>Date</th>
              <th>Time</th>
              <th>Patient</th>
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
                  {appointment.patient.name}
                  <div className="text-muted small">{appointment.patient.email}</div>
                </td>
                <td>
                  <span className={`badge bg-${getStatusColor(appointment.status)}`}>
                    {appointment.status}
                  </span>
                </td>
                <td className="text-end">
                  <div className="btn-group">
                    <button
                      className="btn btn-sm btn-outline-success"
                      onClick={() => updateStatus(appointment.id, 'Completed')}
                      disabled={loading}
                    >
                      Completed
                    </button>
                    <button
                      className="btn btn-sm btn-outline-secondary"
                      onClick={() => updateStatus(appointment.id, 'Scheduled')}
                      disabled={loading}
                    >
                      Scheduled
                    </button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
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

export default DoctorDashboard;
