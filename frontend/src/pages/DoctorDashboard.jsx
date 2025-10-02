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

const STATUS_OPTIONS = ['Pending', 'Approved', 'Rejected', 'Completed'];

const DoctorDashboard = () => {
  const { authAxios } = useAuth();
  const [doctor, setDoctor] = useState(null);
  const [appointments, setAppointments] = useState([]);
  const [filters, setFilters] = useState({ search: '', status: '', date: '' });
  const [statusDialog, setStatusDialog] = useState({ open: false, appointment: null, status: '' });
  const [editDialog, setEditDialog] = useState({
    open: false,
    appointmentId: null,
    form: { date: '', time: '', symptoms: '' }
  });
  const [message, setMessage] = useState(null);
  const [error, setError] = useState(null);

  const fetchDashboard = async () => {
    const response = await authAxios.get('dashboard/doctor/');
    setDoctor(response.data.doctor);
    setAppointments(response.data.upcoming);
  };

  const fetchAppointments = async () => {
    const params = {};
    if (filters.search) params.search = filters.search;
    if (filters.status) params.status = filters.status;
    if (filters.date) params.date = filters.date;
    const response = await authAxios.get('appointments/', { params });
    setAppointments(response.data);
  };

  useEffect(() => {
    fetchDashboard();
    fetchAppointments();
  }, []);

  const handleFilter = async (event) => {
    event.preventDefault();
    fetchAppointments();
  };

  const handleStatusUpdate = async () => {
    try {
      await authAxios.post(`appointments/${statusDialog.appointment.id}/status/`, { status: statusDialog.status });
      setMessage('Appointment status updated');
      fetchAppointments();
      fetchDashboard();
    } catch (err) {
      setError(err.response?.data?.detail || 'Failed to update status');
    } finally {
      setStatusDialog({ open: false, appointment: null, status: '' });
      setTimeout(() => {
        setMessage(null);
        setError(null);
      }, 2000);
    }
  };

  const handleDelete = async (appointmentId) => {
    await authAxios.delete(`appointments/${appointmentId}/`);
    fetchAppointments();
    fetchDashboard();
  };

  const handleEditSave = async (event) => {
    event.preventDefault();
    try {
      await authAxios.patch(`appointments/${editDialog.appointmentId}/`, editDialog.form);
      setMessage('Appointment updated successfully');
      fetchAppointments();
      fetchDashboard();
    } catch (err) {
      setError(err.response?.data?.detail || 'Unable to update appointment');
    } finally {
      setEditDialog({ open: false, appointmentId: null, form: { date: '', time: '', symptoms: '' } });
      setTimeout(() => {
        setMessage(null);
        setError(null);
      }, 2000);
    }
  };

  return (
    <Stack spacing={3}>
      <Typography variant="h4">Doctor Dashboard</Typography>
      {doctor && (
        <Card>
          <CardContent>
            <Typography variant="h6">Welcome {doctor.name}</Typography>
            <Typography color="text.secondary">Specialization: {doctor.specialization}</Typography>
            <Typography color="text.secondary">Availability: {doctor.availability_schedule}</Typography>
          </CardContent>
        </Card>
      )}

      {message && <Alert severity="success">{message}</Alert>}
      {error && <Alert severity="error">{error}</Alert>}

      <Card>
        <CardHeader title="Filter Appointments" />
        <CardContent>
          <Box component="form" onSubmit={handleFilter}>
            <Stack direction={{ xs: 'column', md: 'row' }} spacing={2}>
              <TextField
                label="Search patient or symptoms"
                value={filters.search}
                onChange={(e) => setFilters({ ...filters, search: e.target.value })}
                fullWidth
              />
              <TextField
                select
                label="Status"
                value={filters.status}
                onChange={(e) => setFilters({ ...filters, status: e.target.value })}
                fullWidth
              >
                <MenuItem value="">All</MenuItem>
                {STATUS_OPTIONS.map((status) => (
                  <MenuItem key={status} value={status}>
                    {status}
                  </MenuItem>
                ))}
              </TextField>
              <TextField
                type="date"
                label="Date"
                InputLabelProps={{ shrink: true }}
                value={filters.date}
                onChange={(e) => setFilters({ ...filters, date: e.target.value })}
              />
              <Button type="submit" variant="contained">
                Search
              </Button>
            </Stack>
          </Box>
        </CardContent>
      </Card>

      <Card>
        <CardHeader title="Assigned Appointments" />
        <CardContent>
          <Table size="small">
            <TableHead>
              <TableRow>
                <TableCell>Patient</TableCell>
                <TableCell>Date</TableCell>
                <TableCell>Time</TableCell>
                <TableCell>Symptoms</TableCell>
                <TableCell>Status</TableCell>
                <TableCell>Actions</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {appointments.map((appointment) => (
                <TableRow key={appointment.id}>
                  <TableCell>{appointment.patient?.name}</TableCell>
                  <TableCell>{dayjs(appointment.date).format('YYYY-MM-DD')}</TableCell>
                  <TableCell>{appointment.time}</TableCell>
                  <TableCell>{appointment.symptoms}</TableCell>
                  <TableCell>
                    <Chip label={appointment.status} color={appointment.status === 'Approved' ? 'success' : appointment.status === 'Rejected' ? 'error' : appointment.status === 'Completed' ? 'primary' : 'default'} size="small" />
                  </TableCell>
                  <TableCell>
                    <Stack direction="row" spacing={1}>
                      <Button
                        size="small"
                        variant="outlined"
                        onClick={() => setStatusDialog({ open: true, appointment, status: appointment.status })}
                      >
                        Status
                      </Button>
                      <Button
                        size="small"
                        variant="outlined"
                        onClick={() =>
                          setEditDialog({
                            open: true,
                            appointmentId: appointment.id,
                            form: {
                              date: appointment.date,
                              time: appointment.time,
                              symptoms: appointment.symptoms
                            }
                          })
                        }
                      >
                        Edit
                      </Button>
                      <Button size="small" color="error" onClick={() => handleDelete(appointment.id)}>
                        Delete
                      </Button>
                    </Stack>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      <Dialog open={statusDialog.open} onClose={() => setStatusDialog({ open: false, appointment: null, status: '' })}>
        <DialogTitle>Update Appointment Status</DialogTitle>
        <DialogContent>
          <TextField
            select
            label="Status"
            value={statusDialog.status}
            onChange={(e) => setStatusDialog((prev) => ({ ...prev, status: e.target.value }))}
            fullWidth
          >
            {STATUS_OPTIONS.map((status) => (
              <MenuItem key={status} value={status}>
                {status}
              </MenuItem>
            ))}
          </TextField>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setStatusDialog({ open: false, appointment: null, status: '' })}>Cancel</Button>
          <Button onClick={handleStatusUpdate} variant="contained">
            Update
          </Button>
        </DialogActions>
      </Dialog>

      <Dialog
        open={editDialog.open}
        onClose={() => setEditDialog({ open: false, appointmentId: null, form: { date: '', time: '', symptoms: '' } })}
      >
        <DialogTitle>Edit Appointment</DialogTitle>
        {editDialog.appointmentId && (
          <Box component="form" onSubmit={handleEditSave}>
            <DialogContent>
              <Stack spacing={2}>
                <TextField
                  type="date"
                  label="Date"
                  InputLabelProps={{ shrink: true }}
                  value={editDialog.form.date}
                  onChange={(e) => setEditDialog((prev) => ({ ...prev, form: { ...prev.form, date: e.target.value } }))}
                  fullWidth
                />
                <TextField
                  type="time"
                  label="Time"
                  InputLabelProps={{ shrink: true }}
                  value={editDialog.form.time}
                  onChange={(e) => setEditDialog((prev) => ({ ...prev, form: { ...prev.form, time: e.target.value } }))}
                  fullWidth
                />
                <TextField
                  label="Symptoms"
                  value={editDialog.form.symptoms}
                  onChange={(e) => setEditDialog((prev) => ({ ...prev, form: { ...prev.form, symptoms: e.target.value } }))}
                  multiline
                  minRows={3}
                  fullWidth
                />
              </Stack>
            </DialogContent>
            <DialogActions>
              <Button onClick={() => setEditDialog({ open: false, appointmentId: null, form: { date: '', time: '', symptoms: '' } })}>
                Cancel
              </Button>
              <Button type="submit" variant="contained">
                Save
              </Button>
            </DialogActions>
          </Box>
        )}
      </Dialog>
    </Stack>
  );
};

export default DoctorDashboard;
