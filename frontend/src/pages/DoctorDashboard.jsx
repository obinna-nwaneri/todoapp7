import { useEffect, useMemo, useState } from 'react';
import {
  Alert,
  Button,
  Card,
  CardContent,
  Chip,
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
import { AppLayout } from '../components/AppLayout';
import { fetchAppointments, updateAppointmentPartial } from '../api';
import { useAuth } from '../context/AuthContext';

const statusOptions = ['Pending', 'Approved', 'Rejected', 'Completed'];

const DoctorDashboard = () => {
  const { tokens } = useAuth();
  const [appointments, setAppointments] = useState([]);
  const [filters, setFilters] = useState({ search: '', status: '', date: '' });
  const [error, setError] = useState(null);
  const [message, setMessage] = useState(null);

  const loadAppointments = async () => {
    try {
      const data = await fetchAppointments(tokens.access, {
        search: filters.search,
        status: filters.status,
        date: filters.date
      });
      setAppointments(data);
    } catch (err) {
      console.error(err);
      setError('Failed to load appointments.');
    }
  };

  useEffect(() => {
    loadAppointments();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [filters]);

  const upcoming = useMemo(
    () => appointments.filter((appointment) => dayjs(appointment.date).isSame(dayjs(), 'day') || dayjs(appointment.date).isAfter(dayjs())),
    [appointments]
  );

  const handleStatusChange = async (appointmentId, status) => {
    try {
      await updateAppointmentPartial(tokens.access, appointmentId, { status });
      setMessage('Appointment updated successfully.');
      loadAppointments();
    } catch (err) {
      console.error(err);
      setError('Unable to update appointment.');
    }
  };

  const handleFilterChange = (event) => {
    const { name, value } = event.target;
    setFilters((prev) => ({ ...prev, [name]: value }));
  };

  return (
    <AppLayout
      title="Doctor Dashboard"
      actions={
        <Stack direction={{ xs: 'column', sm: 'row' }} spacing={2}>
          <TextField label="Patient" name="search" value={filters.search} onChange={handleFilterChange} size="small" />
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
            {statusOptions.map((option) => (
              <MenuItem key={option} value={option}>
                {option}
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

      <Grid container spacing={3}>
        <Grid item xs={12}>
          <Card>
            <CardContent>
              <Typography variant="h6" gutterBottom>
                Upcoming Appointments
              </Typography>
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
                  {upcoming.map((appointment) => (
                    <TableRow key={appointment.id}>
                      <TableCell>{appointment.patient?.name}</TableCell>
                      <TableCell>{appointment.date}</TableCell>
                      <TableCell>{appointment.time}</TableCell>
                      <TableCell>{appointment.symptoms}</TableCell>
                      <TableCell>
                        <Chip label={appointment.status} color={appointment.status === 'Pending' ? 'warning' : 'success'} />
                      </TableCell>
                      <TableCell>
                        <Stack direction="row" spacing={1}>
                          {statusOptions.map((status) => (
                            <Button
                              key={status}
                              size="small"
                              variant={appointment.status === status ? 'contained' : 'outlined'}
                              onClick={() => handleStatusChange(appointment.id, status)}
                            >
                              {status}
                            </Button>
                          ))}
                        </Stack>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </Grid>
      </Grid>
    </AppLayout>
  );
};

export default DoctorDashboard;
