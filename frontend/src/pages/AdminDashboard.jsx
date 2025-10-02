import React, { useEffect, useState } from 'react';
import {
  Alert,
  Box,
  Button,
  Card,
  CardContent,
  CardHeader,
  Chip,
  Divider,
  Grid,
  MenuItem,
  Stack,
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableRow,
  TextField,
  Typography
} from '@mui/material';
import dayjs from 'dayjs';
import { useAuth } from '../context/AuthContext.jsx';

const AppointmentStatusChip = ({ status }) => {
  const colorMap = {
    Pending: 'default',
    Approved: 'success',
    Rejected: 'error',
    Completed: 'primary'
  };
  return <Chip label={status} color={colorMap[status] || 'default'} size="small" />;
};

const AdminDashboard = () => {
  const { authAxios } = useAuth();
  const [stats, setStats] = useState(null);
  const [doctors, setDoctors] = useState([]);
  const [patients, setPatients] = useState([]);
  const [appointments, setAppointments] = useState([]);
  const [errors, setErrors] = useState({});
  const [messages, setMessages] = useState({});
  const [doctorSearch, setDoctorSearch] = useState('');
  const [patientSearch, setPatientSearch] = useState('');
  const [appointmentFilters, setAppointmentFilters] = useState({ search: '', status: '' });
  const [doctorForm, setDoctorForm] = useState({
    email: '',
    password: '',
    first_name: '',
    last_name: '',
    name: '',
    specialization: '',
    years_of_experience: 0,
    availability_schedule: ''
  });
  const [patientForm, setPatientForm] = useState({
    email: '',
    password: '',
    first_name: '',
    last_name: '',
    name: '',
    age: '',
    gender: '',
    contact_info: ''
  });
  const [appointmentForm, setAppointmentForm] = useState({
    doctor_id: '',
    patient_id: '',
    date: '',
    time: '',
    symptoms: ''
  });

  const clearMessages = () => {
    setTimeout(() => {
      setMessages({});
      setErrors({});
    }, 2500);
  };

  const fetchStats = async () => {
    const response = await authAxios.get('dashboard/admin/');
    setStats(response.data);
  };

  const fetchDoctors = async (query = '') => {
    const params = {};
    if (query) params.search = query;
    const response = await authAxios.get('doctors/', { params });
    setDoctors(response.data);
  };

  const fetchPatients = async (query = '') => {
    const params = {};
    if (query) params.search = query;
    const response = await authAxios.get('patients/', { params });
    setPatients(response.data);
  };

  const fetchAppointments = async (filters = {}) => {
    const params = {};
    if (filters.search) params.search = filters.search;
    if (filters.status) params.status = filters.status;
    const response = await authAxios.get('appointments/', { params });
    setAppointments(response.data);
  };

  useEffect(() => {
    fetchStats();
    fetchDoctors();
    fetchPatients();
    fetchAppointments();
  }, []);

  const handleDoctorCreate = async (event) => {
    event.preventDefault();
    try {
      await authAxios.post('auth/register/doctor/', doctorForm);
      setMessages((prev) => ({ ...prev, doctor: 'Doctor created successfully' }));
      setDoctorForm({
        email: '',
        password: '',
        first_name: '',
        last_name: '',
        name: '',
        specialization: '',
        years_of_experience: 0,
        availability_schedule: ''
      });
      fetchDoctors();
      fetchStats();
    } catch (error) {
      setErrors((prev) => ({ ...prev, doctor: error.response?.data?.detail || 'Failed to create doctor' }));
    } finally {
      clearMessages();
    }
  };

  const handlePatientCreate = async (event) => {
    event.preventDefault();
    try {
      await authAxios.post('auth/register/patient/', patientForm);
      setMessages((prev) => ({ ...prev, patient: 'Patient created successfully' }));
      setPatientForm({
        email: '',
        password: '',
        first_name: '',
        last_name: '',
        name: '',
        age: '',
        gender: '',
        contact_info: ''
      });
      fetchPatients();
      fetchStats();
    } catch (error) {
      setErrors((prev) => ({ ...prev, patient: error.response?.data?.detail || 'Failed to create patient' }));
    } finally {
      clearMessages();
    }
  };

  const handleAppointmentCreate = async (event) => {
    event.preventDefault();
    try {
      await authAxios.post('appointments/', appointmentForm);
      setMessages((prev) => ({ ...prev, appointment: 'Appointment booked successfully' }));
      setAppointmentForm({ doctor_id: '', patient_id: '', date: '', time: '', symptoms: '' });
      fetchAppointments(appointmentFilters);
      fetchStats();
    } catch (error) {
      setErrors((prev) => ({ ...prev, appointment: error.response?.data?.detail || 'Failed to book appointment' }));
    } finally {
      clearMessages();
    }
  };

  const handleAppointmentDelete = async (id) => {
    await authAxios.delete(`appointments/${id}/`);
    fetchAppointments(appointmentFilters);
    fetchStats();
  };

  const handleSearchSubmit = (event, type) => {
    event.preventDefault();
    if (type === 'doctor') {
      fetchDoctors(doctorSearch);
    } else if (type === 'patient') {
      fetchPatients(patientSearch);
    } else {
      fetchAppointments(appointmentFilters);
    }
  };

  return (
    <Stack spacing={3}>
      <Typography variant="h4">Admin Dashboard</Typography>

      {stats && (
        <Grid container spacing={2}>
          <Grid item xs={12} md={4}>
            <Card>
              <CardContent>
                <Typography variant="h6">Doctors</Typography>
                <Typography variant="h4">{stats.doctors}</Typography>
              </CardContent>
            </Card>
          </Grid>
          <Grid item xs={12} md={4}>
            <Card>
              <CardContent>
                <Typography variant="h6">Patients</Typography>
                <Typography variant="h4">{stats.patients}</Typography>
              </CardContent>
            </Card>
          </Grid>
          <Grid item xs={12} md={4}>
            <Card>
              <CardContent>
                <Typography variant="h6">Appointments</Typography>
                <Typography variant="h4">{stats.appointments}</Typography>
              </CardContent>
            </Card>
          </Grid>
        </Grid>
      )}

      <Grid container spacing={3}>
        <Grid item xs={12} md={6}>
          <Card>
            <CardHeader title="Create Doctor" />
            <CardContent>
              {messages.doctor && <Alert severity="success">{messages.doctor}</Alert>}
              {errors.doctor && <Alert severity="error">{errors.doctor}</Alert>}
              <Stack component="form" spacing={2} onSubmit={handleDoctorCreate}>
                <TextField label="Email" value={doctorForm.email} name="email" onChange={(e) => setDoctorForm({ ...doctorForm, email: e.target.value })} required />
                <TextField label="Password" type="password" value={doctorForm.password} name="password" onChange={(e) => setDoctorForm({ ...doctorForm, password: e.target.value })} required />
                <TextField label="Display Name" value={doctorForm.name} name="name" onChange={(e) => setDoctorForm({ ...doctorForm, name: e.target.value })} required />
                <TextField label="Specialization" value={doctorForm.specialization} name="specialization" onChange={(e) => setDoctorForm({ ...doctorForm, specialization: e.target.value })} required />
                <TextField label="Years of Experience" type="number" value={doctorForm.years_of_experience} name="years_of_experience" onChange={(e) => setDoctorForm({ ...doctorForm, years_of_experience: e.target.value })} required />
                <TextField
                  label="Availability"
                  value={doctorForm.availability_schedule}
                  name="availability_schedule"
                  onChange={(e) => setDoctorForm({ ...doctorForm, availability_schedule: e.target.value })}
                  required
                  multiline
                  minRows={2}
                />
                <Button type="submit" variant="contained">Create Doctor</Button>
              </Stack>
            </CardContent>
          </Card>
        </Grid>
        <Grid item xs={12} md={6}>
          <Card>
            <CardHeader title="Create Patient" />
            <CardContent>
              {messages.patient && <Alert severity="success">{messages.patient}</Alert>}
              {errors.patient && <Alert severity="error">{errors.patient}</Alert>}
              <Stack component="form" spacing={2} onSubmit={handlePatientCreate}>
                <TextField label="Email" value={patientForm.email} name="email" onChange={(e) => setPatientForm({ ...patientForm, email: e.target.value })} required />
                <TextField label="Password" type="password" value={patientForm.password} name="password" onChange={(e) => setPatientForm({ ...patientForm, password: e.target.value })} required />
                <TextField label="Full Name" value={patientForm.name} name="name" onChange={(e) => setPatientForm({ ...patientForm, name: e.target.value })} required />
                <TextField label="Age" type="number" value={patientForm.age} name="age" onChange={(e) => setPatientForm({ ...patientForm, age: e.target.value })} required />
                <TextField label="Gender" value={patientForm.gender} name="gender" onChange={(e) => setPatientForm({ ...patientForm, gender: e.target.value })} required />
                <TextField label="Contact Info" value={patientForm.contact_info} name="contact_info" onChange={(e) => setPatientForm({ ...patientForm, contact_info: e.target.value })} required />
                <Button type="submit" variant="contained">Create Patient</Button>
              </Stack>
            </CardContent>
          </Card>
        </Grid>
      </Grid>

      <Card>
        <CardHeader title="Doctors" subheader="Search and manage doctors" />
        <CardContent>
          <Box component="form" onSubmit={(e) => handleSearchSubmit(e, 'doctor')} sx={{ mb: 2 }}>
            <Stack direction={{ xs: 'column', md: 'row' }} spacing={2}>
              <TextField label="Search" value={doctorSearch} onChange={(e) => setDoctorSearch(e.target.value)} fullWidth />
              <Button type="submit" variant="outlined">Search</Button>
            </Stack>
          </Box>
          <Table size="small">
            <TableHead>
              <TableRow>
                <TableCell>Name</TableCell>
                <TableCell>Specialization</TableCell>
                <TableCell>Experience</TableCell>
                <TableCell>Email</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {doctors.map((doctor) => (
                <TableRow key={doctor.id}>
                  <TableCell>{doctor.name}</TableCell>
                  <TableCell>{doctor.specialization}</TableCell>
                  <TableCell>{doctor.years_of_experience} yrs</TableCell>
                  <TableCell>{doctor.user?.email}</TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      <Card>
        <CardHeader title="Patients" subheader="Search and manage patients" />
        <CardContent>
          <Box component="form" onSubmit={(e) => handleSearchSubmit(e, 'patient')} sx={{ mb: 2 }}>
            <Stack direction={{ xs: 'column', md: 'row' }} spacing={2}>
              <TextField label="Search" value={patientSearch} onChange={(e) => setPatientSearch(e.target.value)} fullWidth />
              <Button type="submit" variant="outlined">Search</Button>
            </Stack>
          </Box>
          <Table size="small">
            <TableHead>
              <TableRow>
                <TableCell>Name</TableCell>
                <TableCell>Age</TableCell>
                <TableCell>Gender</TableCell>
                <TableCell>Contact</TableCell>
                <TableCell>Email</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {patients.map((patient) => (
                <TableRow key={patient.id}>
                  <TableCell>{patient.name}</TableCell>
                  <TableCell>{patient.age}</TableCell>
                  <TableCell>{patient.gender}</TableCell>
                  <TableCell>{patient.contact_info}</TableCell>
                  <TableCell>{patient.user?.email}</TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      <Card>
        <CardHeader title="Appointments" subheader="Manage all appointments" />
        <CardContent>
          {messages.appointment && <Alert severity="success">{messages.appointment}</Alert>}
          {errors.appointment && <Alert severity="error">{errors.appointment}</Alert>}
          <Stack component="form" spacing={2} onSubmit={handleAppointmentCreate} sx={{ mb: 3 }}>
            <Stack direction={{ xs: 'column', md: 'row' }} spacing={2}>
              <TextField
                select
                label="Doctor"
                name="doctor_id"
                value={appointmentForm.doctor_id}
                onChange={(e) => setAppointmentForm({ ...appointmentForm, doctor_id: e.target.value })}
                required
                fullWidth
              >
                {doctors.map((doctor) => (
                  <MenuItem key={doctor.id} value={doctor.id}>
                    {doctor.name}
                  </MenuItem>
                ))}
              </TextField>
              <TextField
                select
                label="Patient"
                name="patient_id"
                value={appointmentForm.patient_id}
                onChange={(e) => setAppointmentForm({ ...appointmentForm, patient_id: e.target.value })}
                required
                fullWidth
              >
                {patients.map((patient) => (
                  <MenuItem key={patient.id} value={patient.id}>
                    {patient.name}
                  </MenuItem>
                ))}
              </TextField>
            </Stack>
            <Stack direction={{ xs: 'column', md: 'row' }} spacing={2}>
              <TextField
                type="date"
                name="date"
                label="Date"
                InputLabelProps={{ shrink: true }}
                value={appointmentForm.date}
                onChange={(e) => setAppointmentForm({ ...appointmentForm, date: e.target.value })}
                required
                fullWidth
              />
              <TextField
                type="time"
                name="time"
                label="Time"
                InputLabelProps={{ shrink: true }}
                value={appointmentForm.time}
                onChange={(e) => setAppointmentForm({ ...appointmentForm, time: e.target.value })}
                required
                fullWidth
              />
            </Stack>
            <TextField
              label="Symptoms"
              name="symptoms"
              value={appointmentForm.symptoms}
              onChange={(e) => setAppointmentForm({ ...appointmentForm, symptoms: e.target.value })}
              required
              multiline
              minRows={2}
            />
            <Button type="submit" variant="contained">Create Appointment</Button>
          </Stack>

          <Divider sx={{ mb: 2 }} />

          <Box component="form" onSubmit={(e) => handleSearchSubmit(e, 'appointment')} sx={{ mb: 2 }}>
            <Stack direction={{ xs: 'column', md: 'row' }} spacing={2}>
              <TextField
                label="Search by patient or doctor"
                value={appointmentFilters.search}
                onChange={(e) => setAppointmentFilters({ ...appointmentFilters, search: e.target.value })}
                fullWidth
              />
              <TextField
                select
                label="Status"
                value={appointmentFilters.status}
                onChange={(e) => setAppointmentFilters({ ...appointmentFilters, status: e.target.value })}
                fullWidth
              >
                <MenuItem value="">All</MenuItem>
                <MenuItem value="Pending">Pending</MenuItem>
                <MenuItem value="Approved">Approved</MenuItem>
                <MenuItem value="Rejected">Rejected</MenuItem>
                <MenuItem value="Completed">Completed</MenuItem>
              </TextField>
              <Button type="submit" variant="outlined">Filter</Button>
            </Stack>
          </Box>

          <Table size="small">
            <TableHead>
              <TableRow>
                <TableCell>Patient</TableCell>
                <TableCell>Doctor</TableCell>
                <TableCell>Date</TableCell>
                <TableCell>Time</TableCell>
                <TableCell>Status</TableCell>
                <TableCell>Actions</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {appointments.map((appointment) => (
                <TableRow key={appointment.id}>
                  <TableCell>{appointment.patient?.name}</TableCell>
                  <TableCell>{appointment.doctor?.name}</TableCell>
                  <TableCell>{dayjs(appointment.date).format('YYYY-MM-DD')}</TableCell>
                  <TableCell>{appointment.time}</TableCell>
                  <TableCell>
                    <AppointmentStatusChip status={appointment.status} />
                  </TableCell>
                  <TableCell>
                    <Button color="error" onClick={() => handleAppointmentDelete(appointment.id)} size="small">
                      Delete
                    </Button>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </Stack>
  );
};

export default AdminDashboard;
