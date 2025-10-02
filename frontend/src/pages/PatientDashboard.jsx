import { useEffect, useMemo, useState } from 'react';
import {
  Alert,
  Box,
  Button,
  Card,
  CardContent,
  Chip,
  Grid,
  IconButton,
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
import DeleteIcon from '@mui/icons-material/Delete';
import EditIcon from '@mui/icons-material/Edit';
import dayjs from 'dayjs';
import { createAppointment, deleteAppointment, fetchAppointments, fetchDoctors, updateAppointmentPartial } from '../api';
import { AppLayout } from '../components/AppLayout';
import { useAuth } from '../context/AuthContext';

const statusOptions = ['Pending', 'Approved', 'Rejected', 'Completed'];

const PatientDashboard = () => {
  const { tokens } = useAuth();
  const [appointments, setAppointments] = useState([]);
  const [doctors, setDoctors] = useState([]);
  const [filters, setFilters] = useState({ status: '', doctor: '', date: '' });
  const [form, setForm] = useState({ doctor_id: '', date: '', time: '', symptoms: '' });
  const [editingId, setEditingId] = useState(null);
  const [message, setMessage] = useState(null);
  const [error, setError] = useState(null);

  const loadDoctors = async () => {
    try {
      const data = await fetchDoctors(tokens.access);
      setDoctors(data);
    } catch (err) {
      console.error(err);
      setError('Failed to load doctors.');
    }
  };

  const loadAppointments = async () => {
    try {
      const data = await fetchAppointments(tokens.access, filters);
      setAppointments(data);
    } catch (err) {
      console.error(err);
      setError('Failed to load appointments.');
    }
  };

  useEffect(() => {
    loadDoctors();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    loadAppointments();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [filters]);

  const upcomingAppointments = useMemo(
    () => appointments.filter((appointment) => dayjs(appointment.date).isSame(dayjs(), 'day') || dayjs(appointment.date).isAfter(dayjs())),
    [appointments]
  );
  const pastAppointments = useMemo(
    () => appointments.filter((appointment) => dayjs(appointment.date).isBefore(dayjs())),
    [appointments]
  );

  const handleFilterChange = (event) => {
    const { name, value } = event.target;
    setFilters((prev) => ({ ...prev, [name]: value }));
  };

  const handleFormChange = (event) => {
    const { name, value } = event.target;
    setForm((prev) => ({ ...prev, [name]: value }));
  };

  const resetForm = () => {
    setForm({ doctor_id: '', date: '', time: '', symptoms: '' });
    setEditingId(null);
  };

  const handleSubmit = async (event) => {
    event.preventDefault();
    setError(null);
    try {
      if (editingId) {
        await updateAppointmentPartial(tokens.access, editingId, { ...form });
        setMessage('Appointment updated successfully.');
      } else {
        await createAppointment(tokens.access, form);
        setMessage('Appointment booked successfully.');
      }
      resetForm();
      loadAppointments();
    } catch (err) {
      console.error(err);
      setError('Unable to save appointment.');
    }
  };

  const handleEdit = (appointment) => {
    setEditingId(appointment.id);
    setForm({
      doctor_id: appointment.doctor?.id || appointment.doctor_id,
      date: appointment.date,
      time: appointment.time,
      symptoms: appointment.symptoms
    });
  };

  const handleCancel = async (appointmentId) => {
    try {
      await deleteAppointment(tokens.access, appointmentId);
      setMessage('Appointment cancelled.');
      loadAppointments();
    } catch (err) {
      console.error(err);
      setError('Failed to cancel appointment.');
    }
  };

  const handleStatusUpdate = async (appointmentId, status) => {
    try {
      await updateAppointmentPartial(tokens.access, appointmentId, { status });
      setMessage('Appointment status updated.');
      loadAppointments();
    } catch (err) {
      console.error(err);
      setError('Could not update status.');
    }
  };

  return (
    <AppLayout
      title="Patient Dashboard"
      actions={
        <Stack direction={{ xs: 'column', sm: 'row' }} spacing={2}>
          <TextField
            select
            label="Doctor"
            name="doctor"
            value={filters.doctor}
            onChange={handleFilterChange}
            size="small"
            sx={{ minWidth: 160 }}
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
            name="status"
            value={filters.status}
            onChange={handleFilterChange}
            size="small"
            sx={{ minWidth: 160 }}
          >
            <MenuItem value="">All</MenuItem>
            {statusOptions.map((status) => (
              <MenuItem key={status} value={status}>
                {status}
              </MenuItem>
            ))}
          </TextField>
          <TextField
            type="date"
            label="Date"
            name="date"
            value={filters.date}
            onChange={handleFilterChange}
            size="small"
            InputLabelProps={{ shrink: true }}
          />
        </Stack>
      }
    >
      {error && (
        <Alert severity="error" sx={{ mb: 2 }}>
          {error}
        </Alert>
      )}
      {message && (
        <Alert severity="success" sx={{ mb: 2 }} onClose={() => setMessage(null)}>
          {message}
        </Alert>
      )}

      <Grid container spacing={4}>
        <Grid item xs={12} md={5}>
          <Card>
            <CardContent>
              <Typography variant="h6" gutterBottom>
                {editingId ? 'Edit Appointment' : 'Book Appointment'}
              </Typography>
              <Box component="form" onSubmit={handleSubmit}>
                <TextField
                  select
                  name="doctor_id"
                  label="Doctor"
                  value={form.doctor_id}
                  onChange={handleFormChange}
                  fullWidth
                  margin="normal"
                  required
                >
                  {doctors.map((doctor) => (
                    <MenuItem key={doctor.id} value={doctor.id}>
                      {doctor.name} ({doctor.specialization})
                    </MenuItem>
                  ))}
                </TextField>
                <TextField
                  type="date"
                  name="date"
                  label="Date"
                  value={form.date}
                  onChange={handleFormChange}
                  fullWidth
                  margin="normal"
                  InputLabelProps={{ shrink: true }}
                  required
                />
                <TextField
                  type="time"
                  name="time"
                  label="Time"
                  value={form.time}
                  onChange={handleFormChange}
                  fullWidth
                  margin="normal"
                  InputLabelProps={{ shrink: true }}
                  required
                />
                <TextField
                  multiline
                  minRows={3}
                  name="symptoms"
                  label="Symptoms"
                  value={form.symptoms}
                  onChange={handleFormChange}
                  fullWidth
                  margin="normal"
                  required
                />
                <Stack direction="row" spacing={2} mt={2}>
                  <Button type="submit" variant="contained" color="primary">
                    {editingId ? 'Update' : 'Book'}
                  </Button>
                  {editingId && (
                    <Button variant="outlined" color="secondary" onClick={resetForm}>
                      Cancel
                    </Button>
                  )}
                </Stack>
              </Box>
            </CardContent>
          </Card>
        </Grid>

        <Grid item xs={12} md={7}>
          <Stack spacing={3}>
            <Card>
              <CardContent>
                <Typography variant="h6" gutterBottom>
                  Upcoming Appointments
                </Typography>
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
                    {upcomingAppointments.map((appointment) => (
                      <TableRow key={appointment.id}>
                        <TableCell>{appointment.doctor?.name}</TableCell>
                        <TableCell>{appointment.date}</TableCell>
                        <TableCell>{appointment.time}</TableCell>
                        <TableCell>
                          <Chip label={appointment.status} color={appointment.status === 'Pending' ? 'warning' : 'success'} />
                        </TableCell>
                        <TableCell>
                          <Stack direction="row" spacing={1}>
                            <IconButton onClick={() => handleEdit(appointment)}>
                              <EditIcon fontSize="small" />
                            </IconButton>
                            <IconButton color="error" onClick={() => handleCancel(appointment.id)}>
                              <DeleteIcon fontSize="small" />
                            </IconButton>
                            <TextField
                              select
                              size="small"
                              value={appointment.status}
                              onChange={(event) => handleStatusUpdate(appointment.id, event.target.value)}
                            >
                              {statusOptions.map((status) => (
                                <MenuItem key={status} value={status}>
                                  {status}
                                </MenuItem>
                              ))}
                            </TextField>
                          </Stack>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </CardContent>
            </Card>

            <Card>
              <CardContent>
                <Typography variant="h6" gutterBottom>
                  Past Appointments
                </Typography>
                <Table size="small">
                  <TableHead>
                    <TableRow>
                      <TableCell>Doctor</TableCell>
                      <TableCell>Date</TableCell>
                      <TableCell>Time</TableCell>
                      <TableCell>Symptoms</TableCell>
                      <TableCell>Status</TableCell>
                    </TableRow>
                  </TableHead>
                  <TableBody>
                    {pastAppointments.map((appointment) => (
                      <TableRow key={appointment.id}>
                        <TableCell>{appointment.doctor?.name}</TableCell>
                        <TableCell>{appointment.date}</TableCell>
                        <TableCell>{appointment.time}</TableCell>
                        <TableCell>{appointment.symptoms}</TableCell>
                        <TableCell>{appointment.status}</TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </CardContent>
            </Card>
          </Stack>
        </Grid>
      </Grid>
    </AppLayout>
  );
};

export default PatientDashboard;
