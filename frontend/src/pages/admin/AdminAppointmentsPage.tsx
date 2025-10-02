import { useEffect, useState } from 'react';
import {
  Alert,
  Button,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  FormControl,
  InputLabel,
  LinearProgress,
  MenuItem,
  Select,
  Stack,
  TextField
} from '@mui/material';

import { PageHeader } from '../../components/PageHeader';
import { SimpleTable } from '../../components/SimpleTable';
import { apiClient } from '../../services/api';

interface AppointmentForm {
  id?: string;
  doctorId: string;
  patientId: string;
  date: string;
  time: string;
  symptoms: string;
  status: string;
}

const STATUS_OPTIONS = ['PENDING', 'APPROVED', 'REJECTED', 'COMPLETED'];

export const AdminAppointmentsPage: React.FC = () => {
  const [filters, setFilters] = useState({ q: '', status: '', date: '' });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [appointments, setAppointments] = useState<any[]>([]);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [form, setForm] = useState<AppointmentForm>({
    doctorId: '',
    patientId: '',
    date: '',
    time: '',
    symptoms: '',
    status: 'PENDING'
  });

  const loadAppointments = async () => {
    try {
      setLoading(true);
      const params: Record<string, string> = {};
      if (filters.q) params.q = filters.q;
      if (filters.status) params.status = filters.status;
      if (filters.date) params.date = filters.date;
      const { data } = await apiClient.get('/appointments', { params });
      setAppointments(data);
      setError(null);
    } catch (err) {
      setError('Failed to load appointments');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadAppointments();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const handleSubmit = async () => {
    try {
      const payload = {
        doctorId: form.doctorId,
        patientId: form.patientId,
        date: form.date,
        time: form.time,
        symptoms: form.symptoms,
        status: form.status
      };
      if (form.id) {
        await apiClient.put(`/appointments/${form.id}`, payload);
      } else {
        await apiClient.post('/appointments', payload);
      }
      setDialogOpen(false);
      await loadAppointments();
    } catch (err) {
      setError('Failed to save appointment');
    }
  };

  const handleEdit = (appointment: any) => {
    setForm({
      id: appointment.id,
      doctorId: appointment.doctor?.id ?? '',
      patientId: appointment.patient?.id ?? '',
      date: appointment.date,
      time: appointment.time,
      symptoms: appointment.symptoms,
      status: appointment.status
    });
    setDialogOpen(true);
  };

  const handleDelete = async (id: string) => {
    try {
      await apiClient.delete(`/appointments/${id}`);
      loadAppointments();
    } catch (err) {
      setError('Failed to delete appointment');
    }
  };

  const actions = (
    <Stack direction={{ xs: 'column', md: 'row' }} spacing={2}>
      <TextField
        size="small"
        placeholder="Search"
        value={filters.q}
        onChange={(e) => setFilters((prev) => ({ ...prev, q: e.target.value }))}
      />
      <TextField
        size="small"
        type="date"
        label="Date"
        InputLabelProps={{ shrink: true }}
        value={filters.date}
        onChange={(e) => setFilters((prev) => ({ ...prev, date: e.target.value }))}
      />
      <FormControl size="small" sx={{ minWidth: 150 }}>
        <InputLabel>Status</InputLabel>
        <Select
          label="Status"
          value={filters.status}
          onChange={(e) => setFilters((prev) => ({ ...prev, status: e.target.value }))}
        >
          <MenuItem value="">All</MenuItem>
          {STATUS_OPTIONS.map((status) => (
            <MenuItem value={status} key={status}>
              {status}
            </MenuItem>
          ))}
        </Select>
      </FormControl>
      <Button variant="outlined" onClick={loadAppointments}>
        Search
      </Button>
      <Button
        variant="contained"
        onClick={() => {
          setForm({ doctorId: '', patientId: '', date: '', time: '', symptoms: '', status: 'PENDING' });
          setDialogOpen(true);
        }}
      >
        New Appointment
      </Button>
    </Stack>
  );

  return (
    <>
      <PageHeader title="Manage Appointments" subtitle="Full control over appointments" actions={actions} />
      {loading && <LinearProgress sx={{ mb: 2 }} />}
      {error && <Alert severity="error" sx={{ mb: 2 }}>{error}</Alert>}
      <SimpleTable
        title="Appointments"
        columns={[
          { key: 'patient', label: 'Patient' },
          { key: 'doctor', label: 'Doctor' },
          { key: 'date', label: 'Date' },
          { key: 'time', label: 'Time' },
          { key: 'status', label: 'Status' },
          { key: 'actions', label: 'Actions' }
        ]}
        data={appointments.map((appointment) => ({
          patient: appointment.patient?.name ?? 'N/A',
          doctor: appointment.doctor?.name ?? 'N/A',
          date: appointment.date,
          time: appointment.time,
          status: appointment.status,
          actions: (
            <Stack direction="row" spacing={1}>
              <Button size="small" onClick={() => handleEdit(appointment)}>
                Edit
              </Button>
              <Button size="small" color="error" onClick={() => handleDelete(appointment.id)}>
                Delete
              </Button>
            </Stack>
          )
        }))}
      />

      <Dialog open={dialogOpen} onClose={() => setDialogOpen(false)} fullWidth maxWidth="sm">
        <DialogTitle>{form.id ? 'Edit Appointment' : 'Create Appointment'}</DialogTitle>
        <DialogContent>
          <Stack spacing={2} sx={{ mt: 1 }}>
            <TextField
              label="Doctor ID"
              value={form.doctorId}
              onChange={(e) => setForm((prev) => ({ ...prev, doctorId: e.target.value }))}
            />
            <TextField
              label="Patient ID"
              value={form.patientId}
              onChange={(e) => setForm((prev) => ({ ...prev, patientId: e.target.value }))}
            />
            <TextField
              label="Date"
              type="date"
              InputLabelProps={{ shrink: true }}
              value={form.date}
              onChange={(e) => setForm((prev) => ({ ...prev, date: e.target.value }))}
            />
            <TextField
              label="Time"
              type="time"
              InputLabelProps={{ shrink: true }}
              value={form.time}
              onChange={(e) => setForm((prev) => ({ ...prev, time: e.target.value }))}
            />
            <TextField
              label="Symptoms"
              value={form.symptoms}
              onChange={(e) => setForm((prev) => ({ ...prev, symptoms: e.target.value }))}
              multiline
              minRows={2}
            />
            <FormControl fullWidth>
              <InputLabel>Status</InputLabel>
              <Select
                label="Status"
                value={form.status}
                onChange={(e) => setForm((prev) => ({ ...prev, status: e.target.value }))}
              >
                {STATUS_OPTIONS.map((status) => (
                  <MenuItem value={status} key={status}>
                    {status}
                  </MenuItem>
                ))}
              </Select>
            </FormControl>
          </Stack>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setDialogOpen(false)}>Cancel</Button>
          <Button variant="contained" onClick={handleSubmit}>
            Save
          </Button>
        </DialogActions>
      </Dialog>
    </>
  );
};
