import React, { useEffect, useMemo, useState } from 'react';
import api from '../api';
import { useAuthContext } from '../auth/AuthContext';

interface Appointment {
  id: number;
  date: string;
  time: string;
  status: string;
  doctor: {
    id: number;
    name: string;
    specialization: string;
  };
  patient: {
    id: number;
    name: string;
  };
}

interface Doctor {
  id: number;
  name: string;
}

const AppointmentsPage: React.FC = () => {
  const { token } = useAuthContext();
  const [appointments, setAppointments] = useState<Appointment[]>([]);
  const [doctors, setDoctors] = useState<Doctor[]>([]);
  const [statusFilter, setStatusFilter] = useState('');
  const [doctorFilter, setDoctorFilter] = useState('');
  const [dateFilter, setDateFilter] = useState('');

  const loadData = async () => {
    if (!token) return;
    const [appointmentRes, doctorRes] = await Promise.all([
      api.get<Appointment[]>('/appointments'),
      api.get<Doctor[]>('/doctors'),
    ]);
    setAppointments(appointmentRes.data);
    setDoctors(doctorRes.data);
  };

  useEffect(() => {
    loadData();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [token]);

  const filteredAppointments = useMemo(() => {
    return appointments.filter((appointment) => {
      const matchesStatus = statusFilter ? appointment.status === statusFilter : true;
      const matchesDoctor = doctorFilter ? appointment.doctor.id === Number(doctorFilter) : true;
      const matchesDate = dateFilter ? appointment.date === dateFilter : true;
      return matchesStatus && matchesDoctor && matchesDate;
    });
  }, [appointments, statusFilter, doctorFilter, dateFilter]);

  return (
    <div className="card p-4">
      <h3 className="mb-3">Appointments</h3>
      <div className="row g-3 mb-3">
        <div className="col-md-4">
          <label className="form-label">Doctor</label>
          <select
            className="form-select"
            value={doctorFilter}
            onChange={(e) => setDoctorFilter(e.target.value)}
          >
            <option value="">All Doctors</option>
            {doctors.map((doctor) => (
              <option key={doctor.id} value={doctor.id}>
                {doctor.name}
              </option>
            ))}
          </select>
        </div>
        <div className="col-md-4">
          <label className="form-label">Status</label>
          <select
            className="form-select"
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
          >
            <option value="">All Statuses</option>
            <option value="Scheduled">Scheduled</option>
            <option value="Completed">Completed</option>
            <option value="Cancelled">Cancelled</option>
          </select>
        </div>
        <div className="col-md-4">
          <label className="form-label">Date</label>
          <input
            type="date"
            className="form-control"
            value={dateFilter}
            onChange={(e) => setDateFilter(e.target.value)}
          />
        </div>
      </div>
      <div className="table-responsive">
        <table className="table table-striped">
          <thead>
            <tr>
              <th>Date</th>
              <th>Time</th>
              <th>Doctor</th>
              <th>Patient</th>
              <th>Status</th>
            </tr>
          </thead>
          <tbody>
            {filteredAppointments.map((appointment) => (
              <tr key={appointment.id}>
                <td>{appointment.date}</td>
                <td>{appointment.time}</td>
                <td>
                  {appointment.doctor.name}
                  <div className="text-muted small">{appointment.doctor.specialization}</div>
                </td>
                <td>{appointment.patient.name}</td>
                <td>
                  <span className={`badge bg-${getStatusColor(appointment.status)}`}>
                    {appointment.status}
                  </span>
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

export default AppointmentsPage;
