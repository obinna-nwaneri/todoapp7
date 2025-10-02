import React, { useEffect, useState } from 'react';
import {
  Alert,
  Box,
  Button,
  Card,
  CardContent,
  CardHeader,
  Chip,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
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

const PatientDashboard = () => {
  const { authAxios } = useAuth();
  const [patient, setPatient] = useState(null);
  const [upcoming, setUpcoming] = useState([]);
  const [past, setPast] = useState([]);
  const [doctors, setDoctors] = useState([]);
  const [filters, setFilters] = useState({ doctor: '', status: '', date: '' });
  const [dialog, setDialog] = useState({ open: false, appointment: null });
  const [form, setForm] = useState({ doctor_id: '', date: '', time: '', symptoms: '' });
  const [message, setMessage] = useState(null);
  const [error, setError] = useState(null);

  const fetchDashboard = async () => {
    const response = await authAxios.get('dashboard/patient/');
    setPatient(response.data.patient);
    setUpcoming(response.data.upcoming);
    setPast(response.data.past);
  };

  const fetchDoctors = async () => {
    const response = await authAxios.get('doctors/');
    setDoctors(response.data);
  };

  const fetchAppointments = async () => {
    const params = {};
    if (filters.doctor) params['doctor__id'] = filters.doctor;
    if (filters.status) params.status = filters.status;
    if (filters.date) params.date = filters.date;
    const response = await authAxios.get('appointments/', { params });
    const upcomingAppointments = response.data.filter((item) => item.status === 'Pending' || item.status === 'Approved');
    const pastAppointments = response.data.filter((item) => item.status === 'Completed');
    setUpcoming(upcomingAppointments);
    setPast(pastAppointments);
  };

  useEffect(() => {
    fetchDashboard();
    fetchDoctors();
  }, []);

  const openDialog = (appointment = null) => {
    if (appointment) {
      setDialog({ open: true, appointment });
      setForm({
        doctor_id: appointment.doctor?.id || '',
        date: appointment.date,
        time: appointment.time,
        symptoms: appointment.symptoms
      });
    } else {
      setDialog({ open: true, appointment: null });
      setForm({ doctor_id: '', date: '', time: '', symptoms: '' });
    }
  };

  const closeDialog = () => {
    setDialog({ open: false, appointment: null });
    setForm({ doctor_id: '', date: '', time: '', symptoms: '' });
  };

  const handleSubmit = async (event) => {
    event.preventDefault();
    try {
      if (dialog.appointment) {
        await authAxios.patch(`appointments/${dialog.appointment.id}/`, form);
        setMessage('Appointment updated successfully');
      } else {
        await authAxios.post('appointments/', form);
        setMessage('Appointment booked successfully');
      }
      fetchDashboard();
      fetchAppointments();
      setForm({ doctor_id: '', date: '', time: '', symptoms: '' });
      closeDialog();
    } catch (err) {
      setError(err.response?.data?.detail || 'Unable to save appointment');
    } finally {
      setTimeout(() => {
        setMessage(null);
        setError(null);
      }, 2000);
    }
  };

  const handleDelete = async (id) => {
    await authAxios.delete(`appointments/${id}/`);
    fetchDashboard();
    fetchAppointments();
  };

  const handleFilter = async (event) => {
    event.preventDefault();
    fetchAppointments();
  };

  return (
    <Stack spacing={3}>
      <Typography variant="h4">Patient Dashboard</Typography>
      {patient && (
        <Card>
          <CardContent>
            <Typography variant="h6">Welcome {patient.name}</Typography>
            <Typography color="text.secondary">Contact: {patient.contact_info}</Typography>
          </CardContent>
        </Card>
      )}

      {message && <Alert severity="success">{message}</Alert>}
      {error && <Alert severity="error">{error}</Alert>}

      <Card>
        <CardHeader title="Book Appointment" />
        <CardContent>
          <Box component="form" onSubmit={handleSubmit}>
            <Stack spacing={2}>
              <TextField
                select
                label="Doctor"
                value={form.doctor_id}
                onChange={(e) => setForm({ ...form, doctor_id: e.target.value })}
                required
              >
                {doctors.map((doctor) => (
                  <MenuItem key={doctor.id} value={doctor.id}>
                    {doctor.name} - {doctor.specialization}
                  </MenuItem>
                ))}
              </TextField>
              <Stack direction={{ xs: 'column', md: 'row' }} spacing={2}>
                <TextField
                  type="date"
                  label="Date"
                  InputLabelProps={{ shrink: true }}
                  value={form.date}
                  onChange={(e) => setForm({ ...form, date: e.target.value })}
                  required
                  fullWidth
                />
                <TextField
                  type="time"
                  label="Time"
                  InputLabelProps={{ shrink: true }}
                  value={form.time}
                  onChange={(e) => setForm({ ...form, time: e.target.value })}
                  required
                  fullWidth
                />
              </Stack>
              <TextField
                label="Symptoms"
                value={form.symptoms}
                onChange={(e) => setForm({ ...form, symptoms: e.target.value })}
                multiline
                minRows={3}
                required
              />
              <Button type="submit" variant="contained">
                {dialog.appointment ? 'Update Appointment' : 'Book Appointment'}
              </Button>
            </Stack>
          </Box>
        </CardContent>
      </Card>

      <Card>
        <CardHeader title="Filter Appointments" />
        <CardContent>
          <Box component="form" onSubmit={handleFilter}>
            <Stack direction={{ xs: 'column', md: 'row' }} spacing={2}>
              <TextField
                select
                label="Doctor"
                value={filters.doctor}
                onChange={(e) => setFilters({ ...filters, doctor: e.target.value })}
              >
                <MenuItem value="">All</MenuItem>
                {doctors.map((doctor) => (
                  <MenuItem key={doctor.id} value={doctor.id}>
                    {doctor.name}
                  </MenuItem>
                ))}
              </TextField>
              <TextField
                select
                label="Status"
                value={filters.status}
                onChange={(e) => setFilters({ ...filters, status: e.target.value })}
              >
                <MenuItem value="">All</MenuItem>
                <MenuItem value="Pending">Pending</MenuItem>
                <MenuItem value="Approved">Approved</MenuItem>
                <MenuItem value="Rejected">Rejected</MenuItem>
                <MenuItem value="Completed">Completed</MenuItem>
              </TextField>
              <TextField
                type="date"
                label="Date"
                InputLabelProps={{ shrink: true }}
                value={filters.date}
                onChange={(e) => setFilters({ ...filters, date: e.target.value })}
              />
              <Button type="submit" variant="outlined">
                Apply
              </Button>
            </Stack>
          </Box>
        </CardContent>
      </Card>

      <Card>
        <CardHeader title="Upcoming Appointments" action={<Button onClick={() => openDialog()}>Book New</Button>} />
        <CardContent>
          <Table size="small">
            <TableHead>
              <TableRow>
                <TableCell>Doctor</TableCell>
                <TableCell>Date</TableCell>
                <TableCell>Time</TableCell>
                <TableCell>Status</TableCell>
                <TableCell>Actions</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {upcoming.map((appointment) => (
                <TableRow key={appointment.id}>
                  <TableCell>{appointment.doctor?.name}</TableCell>
                  <TableCell>{dayjs(appointment.date).format('YYYY-MM-DD')}</TableCell>
                  <TableCell>{appointment.time}</TableCell>
                  <TableCell>
                    <Chip label={appointment.status} color={appointment.status === 'Approved' ? 'success' : 'default'} size="small" />
                  </TableCell>
                  <TableCell>
                    <Stack direction="row" spacing={1}>
                      <Button size="small" variant="outlined" onClick={() => openDialog(appointment)}>
                        Edit
                      </Button>
                      <Button size="small" color="error" onClick={() => handleDelete(appointment.id)}>
                        Cancel
                      </Button>
                    </Stack>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      <Card>
        <CardHeader title="Past Appointments" />
        <CardContent>
          <Table size="small">
            <TableHead>
              <TableRow>
                <TableCell>Doctor</TableCell>
                <TableCell>Date</TableCell>
                <TableCell>Time</TableCell>
                <TableCell>Status</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {past.map((appointment) => (
                <TableRow key={appointment.id}>
                  <TableCell>{appointment.doctor?.name}</TableCell>
                  <TableCell>{dayjs(appointment.date).format('YYYY-MM-DD')}</TableCell>
                  <TableCell>{appointment.time}</TableCell>
                  <TableCell>
                    <Chip label={appointment.status} color="primary" size="small" />
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      <Dialog open={dialog.open} onClose={closeDialog}>
        <DialogTitle>{dialog.appointment ? 'Edit Appointment' : 'Book Appointment'}</DialogTitle>
        <Box component="form" onSubmit={handleSubmit}>
          <DialogContent>
            <Stack spacing={2}>
              <TextField
                select
                label="Doctor"
                value={form.doctor_id}
                onChange={(e) => setForm({ ...form, doctor_id: e.target.value })}
                required
              >
                {doctors.map((doctor) => (
                  <MenuItem key={doctor.id} value={doctor.id}>
                    {doctor.name}
                  </MenuItem>
                ))}
              </TextField>
              <TextField
                type="date"
                label="Date"
                InputLabelProps={{ shrink: true }}
                value={form.date}
                onChange={(e) => setForm({ ...form, date: e.target.value })}
                required
              />
              <TextField
                type="time"
                label="Time"
                InputLabelProps={{ shrink: true }}
                value={form.time}
                onChange={(e) => setForm({ ...form, time: e.target.value })}
                required
              />
              <TextField
                label="Symptoms"
                value={form.symptoms}
                onChange={(e) => setForm({ ...form, symptoms: e.target.value })}
                multiline
                minRows={3}
                required
              />
            </Stack>
          </DialogContent>
          <DialogActions>
            <Button onClick={closeDialog}>Cancel</Button>
            <Button type="submit" variant="contained">
              {dialog.appointment ? 'Save Changes' : 'Book'}
            </Button>
          </DialogActions>
        </Box>
      </Dialog>
    </Stack>
  );
};

export default PatientDashboard;
