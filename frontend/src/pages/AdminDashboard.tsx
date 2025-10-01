import React, { useEffect, useState } from 'react';
import api from '../api';
import { useAuthContext } from '../auth/AuthContext';

interface Doctor {
  id: number;
  name: string;
  specialization: string;
  email: string;
  phone: string;
}

interface Patient {
  id: number;
  name: string;
  email: string;
  phone: string;
}

interface Appointment {
  id: number;
  status: string;
}

const AdminDashboard: React.FC = () => {
  const { token } = useAuthContext();
  const [doctors, setDoctors] = useState<Doctor[]>([]);
  const [patients, setPatients] = useState<Patient[]>([]);
  const [appointments, setAppointments] = useState<Appointment[]>([]);
  const [doctorForm, setDoctorForm] = useState({ name: '', specialization: '', email: '', phone: '' });
  const [patientForm, setPatientForm] = useState({ name: '', email: '', phone: '' });
  const [loading, setLoading] = useState(false);

  const loadData = async () => {
    if (!token) return;
    const [doctorRes, patientRes, appointmentRes] = await Promise.all([
      api.get<Doctor[]>('/doctors'),
      api.get<Patient[]>('/patients'),
      api.get<Appointment[]>('/appointments'),
    ]);
    setDoctors(doctorRes.data);
    setPatients(patientRes.data);
    setAppointments(appointmentRes.data);
  };

  useEffect(() => {
    loadData();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [token]);

  const handleDoctorSubmit = async (event: React.FormEvent) => {
    event.preventDefault();
    setLoading(true);
    try {
      await api.post('/doctors', doctorForm);
      setDoctorForm({ name: '', specialization: '', email: '', phone: '' });
      await loadData();
    } finally {
      setLoading(false);
    }
  };

  const handlePatientSubmit = async (event: React.FormEvent) => {
    event.preventDefault();
    setLoading(true);
    try {
      await api.post('/patients', patientForm);
      setPatientForm({ name: '', email: '', phone: '' });
      await loadData();
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="row g-4">
      <div className="col-lg-4">
        <div className="card p-4">
          <h4>Summary</h4>
          <p>Total Doctors: {doctors.length}</p>
          <p>Total Patients: {patients.length}</p>
          <p>Total Appointments: {appointments.length}</p>
        </div>
      </div>
      <div className="col-lg-4">
        <div className="card p-4">
          <h4 className="mb-3">Add Doctor</h4>
          <form onSubmit={handleDoctorSubmit}>
            <div className="mb-2">
              <input
                className="form-control"
                placeholder="Name"
                value={doctorForm.name}
                onChange={(e) => setDoctorForm({ ...doctorForm, name: e.target.value })}
                required
              />
            </div>
            <div className="mb-2">
              <input
                className="form-control"
                placeholder="Specialization"
                value={doctorForm.specialization}
                onChange={(e) => setDoctorForm({ ...doctorForm, specialization: e.target.value })}
                required
              />
            </div>
            <div className="mb-2">
              <input
                className="form-control"
                placeholder="Email"
                value={doctorForm.email}
                onChange={(e) => setDoctorForm({ ...doctorForm, email: e.target.value })}
                required
              />
            </div>
            <div className="mb-3">
              <input
                className="form-control"
                placeholder="Phone"
                value={doctorForm.phone}
                onChange={(e) => setDoctorForm({ ...doctorForm, phone: e.target.value })}
                required
              />
            </div>
            <button className="btn btn-primary w-100" type="submit" disabled={loading}>
              Add Doctor
            </button>
          </form>
          <p className="text-muted mt-2 mb-0 small">New doctors receive password <code>password123</code>.</p>
        </div>
      </div>
      <div className="col-lg-4">
        <div className="card p-4">
          <h4 className="mb-3">Add Patient</h4>
          <form onSubmit={handlePatientSubmit}>
            <div className="mb-2">
              <input
                className="form-control"
                placeholder="Name"
                value={patientForm.name}
                onChange={(e) => setPatientForm({ ...patientForm, name: e.target.value })}
                required
              />
            </div>
            <div className="mb-2">
              <input
                className="form-control"
                placeholder="Email"
                value={patientForm.email}
                onChange={(e) => setPatientForm({ ...patientForm, email: e.target.value })}
                required
              />
            </div>
            <div className="mb-3">
              <input
                className="form-control"
                placeholder="Phone"
                value={patientForm.phone}
                onChange={(e) => setPatientForm({ ...patientForm, phone: e.target.value })}
                required
              />
            </div>
            <button className="btn btn-success w-100" type="submit" disabled={loading}>
              Add Patient
            </button>
          </form>
          <p className="text-muted mt-2 mb-0 small">New patients receive password <code>password123</code>.</p>
        </div>
      </div>
      <div className="col-12">
        <div className="card p-4">
          <h4>Doctors</h4>
          <div className="table-responsive">
            <table className="table table-striped">
              <thead>
                <tr>
                  <th>Name</th>
                  <th>Specialization</th>
                  <th>Email</th>
                  <th>Phone</th>
                </tr>
              </thead>
              <tbody>
                {doctors.map((doctor) => (
                  <tr key={doctor.id}>
                    <td>{doctor.name}</td>
                    <td>{doctor.specialization}</td>
                    <td>{doctor.email}</td>
                    <td>{doctor.phone}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>
      <div className="col-12">
        <div className="card p-4">
          <h4>Patients</h4>
          <div className="table-responsive">
            <table className="table table-striped">
              <thead>
                <tr>
                  <th>Name</th>
                  <th>Email</th>
                  <th>Phone</th>
                </tr>
              </thead>
              <tbody>
                {patients.map((patient) => (
                  <tr key={patient.id}>
                    <td>{patient.name}</td>
                    <td>{patient.email}</td>
                    <td>{patient.phone}</td>
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

export default AdminDashboard;
