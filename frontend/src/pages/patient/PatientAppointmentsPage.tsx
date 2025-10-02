import { useEffect, useState } from 'react';
import {
  Alert,
  Button,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  LinearProgress,
  Stack,
  TextField
} from '@mui/material';

import { PageHeader } from '../../components/PageHeader';
import { SimpleTable } from '../../components/SimpleTable';
import { apiClient } from '../../services/api';

interface AppointmentForm {
  id?: string;
  doctorName?: string;
  date: string;
  time: string;
  symptoms: string;
}

export const PatientAppointmentsPage: React.FC = () => {
  const [appointments, setAppointments] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [form, setForm] = useState<AppointmentForm>({ date: '', time: '', symptoms: '' });

  const load = async () => {
    try {
      setLoading(true);
      const { data } = await apiClient.get('/appointments/patient');
      setAppointments(data);
      setError(null);
    } catch (err) {
      setError('Failed to load appointments');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    load();
  }, []);

  const openEdit = (appointment: any) => {
    setForm({
      id: appointment.id,
      doctorName: appointment.doctor?.name,
      date: appointment.date,
      time: appointment.time,
      symptoms: appointment.symptoms
    });
    setDialogOpen(true);
  };

  const cancel = async (id: string) => {
    try {
      await apiClient.delete(`/appointments/${id}/patient`);
      load();
    } catch (err) {
      setError('Failed to cancel appointment');
    }
  };

  const handleSubmit = async () => {
    try {
      await apiClient.put(`/appointments/${form.id}/patient`, {
        date: form.date,
        time: form.time,
        symptoms: form.symptoms
      });
      setDialogOpen(false);
      setError(null);
      load();
    } catch (err) {
      setError('Failed to update appointment');
    }
  };

  return (
    <>
      <PageHeader title="My Appointments" subtitle="Update or cancel appointments" actions={<Button onClick={load}>Refresh</Button>} />
      {loading && <LinearProgress sx={{ mb: 2 }} />}
      {error && <Alert severity="error" sx={{ mb: 2 }}>{error}</Alert>}
      <SimpleTable
        title="Appointments"
        columns={[
          { key: 'doctor', label: 'Doctor' },
          { key: 'date', label: 'Date' },
          { key: 'time', label: 'Time' },
          { key: 'symptoms', label: 'Symptoms' },
          { key: 'status', label: 'Status' },
          { key: 'actions', label: 'Actions' }
        ]}
        data={appointments.map((appointment) => ({
          doctor: appointment.doctor?.name ?? 'N/A',
          date: appointment.date,
          time: appointment.time,
          symptoms: appointment.symptoms,
          status: appointment.status,
          actions: (
            <Stack direction="row" spacing={1}>
              <Button size="small" onClick={() => openEdit(appointment)}>
                Edit
              </Button>
              <Button size="small" color="error" onClick={() => cancel(appointment.id)}>
                Cancel
              </Button>
            </Stack>
          )
        }))}
      />

      <Dialog open={dialogOpen} onClose={() => setDialogOpen(false)} fullWidth maxWidth="sm">
        <DialogTitle>Edit Appointment {form.doctorName ? `with ${form.doctorName}` : ''}</DialogTitle>
        <DialogContent>
          <Stack spacing={2} sx={{ mt: 1 }}>
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
