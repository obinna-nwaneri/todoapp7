import { useEffect, useState } from 'react';
import { api, authHeaders } from '../api.js';
import { useAuth } from '../context/AuthContext.jsx';

const AdminDashboard = () => {
  const { auth } = useAuth();
  const [doctors, setDoctors] = useState([]);
  const [patients, setPatients] = useState([]);
  const [appointments, setAppointments] = useState([]);
  const [doctorForm, setDoctorForm] = useState({
    name: '',
    specialization: '',
    email: '',
    phone: '',
    password: '',
  });
  const [patientForm, setPatientForm] = useState({ name: '', email: '', phone: '', password: '' });
  const [message, setMessage] = useState('');
  const [error, setError] = useState('');

  const token = auth?.token;
  const headers = token ? authHeaders(token) : {};

  const loadData = async () => {
    try {
      const [doctorRes, patientRes, appointmentRes] = await Promise.all([
        api.get('/doctors', { headers }),
        api.get('/patients', { headers }),
        api.get('/appointments', { headers }),
      ]);
      setDoctors(doctorRes.data);
      setPatients(patientRes.data);
      setAppointments(appointmentRes.data);
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to load dashboard data');
    }
  };

  useEffect(() => {
    if (!token) return;
    loadData();
  }, [token]);

  const handleDoctorChange = (event) => {
    const { name, value } = event.target;
    setDoctorForm((prev) => ({ ...prev, [name]: value }));
  };

  const handlePatientChange = (event) => {
    const { name, value } = event.target;
    setPatientForm((prev) => ({ ...prev, [name]: value }));
  };

  const createDoctor = async (event) => {
    event.preventDefault();
    setError('');
    setMessage('');
    try {
      await api.post('/doctors', doctorForm, { headers });
      setDoctorForm({ name: '', specialization: '', email: '', phone: '', password: '' });
      setMessage('Doctor created successfully');
      await loadData();
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to create doctor');
    }
  };

  const createPatient = async (event) => {
    event.preventDefault();
    setError('');
    setMessage('');
    try {
      await api.post('/patients', patientForm, { headers });
      setPatientForm({ name: '', email: '', phone: '', password: '' });
      setMessage('Patient created successfully');
      await loadData();
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to create patient');
    }
  };

  const deleteDoctor = async (id) => {
    try {
      await api.delete(`/doctors/${id}`, { headers });
      await loadData();
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to delete doctor');
    }
  };

  const deletePatient = async (id) => {
    try {
      await api.delete(`/patients/${id}`, { headers });
      await loadData();
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to delete patient');
    }
  };

  return (
    <section>
      <div className="card">
        <h2>Overview</h2>
        {error && <p style={{ color: '#b91c1c' }}>{error}</p>}
        {message && <p style={{ color: '#15803d' }}>{message}</p>}
        <div className="form-grid">
          <div className="card" style={{ margin: 0 }}>
            <h3>Total Doctors</h3>
            <p style={{ fontSize: '2rem', margin: 0 }}>{doctors.length}</p>
          </div>
          <div className="card" style={{ margin: 0 }}>
            <h3>Total Patients</h3>
            <p style={{ fontSize: '2rem', margin: 0 }}>{patients.length}</p>
          </div>
          <div className="card" style={{ margin: 0 }}>
            <h3>Total Appointments</h3>
            <p style={{ fontSize: '2rem', margin: 0 }}>{appointments.length}</p>
          </div>
        </div>
      </div>

      <div className="card">
        <h2>Add a Doctor</h2>
        <form onSubmit={createDoctor} className="form-grid">
          <label>
            Name
            <input name="name" value={doctorForm.name} onChange={handleDoctorChange} required />
          </label>
          <label>
            Specialization
            <input
              name="specialization"
              value={doctorForm.specialization}
              onChange={handleDoctorChange}
              required
            />
          </label>
          <label>
            Email
            <input type="email" name="email" value={doctorForm.email} onChange={handleDoctorChange} required />
          </label>
          <label>
            Phone
            <input name="phone" value={doctorForm.phone} onChange={handleDoctorChange} required />
          </label>
          <label>
            Temporary Password
            <input
              name="password"
              type="password"
              value={doctorForm.password}
              onChange={handleDoctorChange}
              required
            />
          </label>
          <div>
            <button type="submit">Save Doctor</button>
          </div>
        </form>
      </div>

      <div className="card">
        <h2>Add a Patient</h2>
        <form onSubmit={createPatient} className="form-grid">
          <label>
            Name
            <input name="name" value={patientForm.name} onChange={handlePatientChange} required />
          </label>
          <label>
            Email
            <input type="email" name="email" value={patientForm.email} onChange={handlePatientChange} required />
          </label>
          <label>
            Phone
            <input name="phone" value={patientForm.phone} onChange={handlePatientChange} required />
          </label>
          <label>
            Password
            <input
              type="password"
              name="password"
              value={patientForm.password}
              onChange={handlePatientChange}
              required
            />
          </label>
          <div>
            <button type="submit">Save Patient</button>
          </div>
        </form>
      </div>

      <div className="card">
        <h2>All Appointments</h2>
        <table>
          <thead>
            <tr>
              <th>Doctor</th>
              <th>Patient</th>
              <th>Date</th>
              <th>Time</th>
              <th>Status</th>
            </tr>
          </thead>
          <tbody>
            {appointments.map((appointment) => (
              <tr key={appointment.id}>
                <td>{appointment.Doctor?.name}</td>
                <td>{appointment.Patient?.name}</td>
                <td>{appointment.date}</td>
                <td>{appointment.time}</td>
                <td>{appointment.status}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <div className="card">
        <h2>Manage Doctors</h2>
        <table>
          <thead>
            <tr>
              <th>Name</th>
              <th>Email</th>
              <th>Specialization</th>
              <th>Phone</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {doctors.map((doctor) => (
              <tr key={doctor.id}>
                <td>{doctor.name}</td>
                <td>{doctor.email}</td>
                <td>{doctor.specialization}</td>
                <td>{doctor.phone}</td>
                <td>
                  <button type="button" onClick={() => deleteDoctor(doctor.id)}>
                    Remove
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <div className="card">
        <h2>Manage Patients</h2>
        <table>
          <thead>
            <tr>
              <th>Name</th>
              <th>Email</th>
              <th>Phone</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {patients.map((patient) => (
              <tr key={patient.id}>
                <td>{patient.name}</td>
                <td>{patient.email}</td>
                <td>{patient.phone}</td>
                <td>
                  <button type="button" onClick={() => deletePatient(patient.id)}>
                    Remove
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </section>
  );
};

export default AdminDashboard;
