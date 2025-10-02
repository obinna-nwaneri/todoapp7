import { useEffect, useMemo, useState } from 'react';
import { Alert, Button, LinearProgress, Stack } from '@mui/material';

import { PageHeader } from '../../components/PageHeader';
import { SimpleTable } from '../../components/SimpleTable';
import { apiClient } from '../../services/api';

function isFuture(dateStr: string, timeStr: string) {
  const date = new Date(`${dateStr}T${timeStr}`);
  return date.getTime() >= Date.now();
}

export const PatientDashboardPage: React.FC = () => {
  const [appointments, setAppointments] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

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

  const cancel = async (id: string) => {
    try {
      await apiClient.delete(`/appointments/${id}/patient`);
      load();
    } catch (err) {
      setError('Failed to cancel appointment');
    }
  };

  const upcoming = useMemo(
    () =>
      appointments
        .filter((appointment) => isFuture(appointment.date, appointment.time))
        .map((appointment) => ({
          id: appointment.id,
          doctor: appointment.doctor?.name ?? 'N/A',
          date: appointment.date,
          time: appointment.time,
          symptoms: appointment.symptoms,
          status: appointment.status
        })),
    [appointments]
  );

  const past = useMemo(
    () =>
      appointments
        .filter((appointment) => !isFuture(appointment.date, appointment.time))
        .map((appointment) => ({
          id: appointment.id,
          doctor: appointment.doctor?.name ?? 'N/A',
          date: appointment.date,
          time: appointment.time,
          symptoms: appointment.symptoms,
          status: appointment.status
        })),
    [appointments]
  );

  return (
    <>
      <PageHeader title="Patient Dashboard" subtitle="Track your appointments" actions={<Button onClick={load}>Refresh</Button>} />
      {loading && <LinearProgress sx={{ mb: 2 }} />}
      {error && <Alert severity="error" sx={{ mb: 2 }}>{error}</Alert>}
      <SimpleTable
        title="Upcoming Appointments"
        columns={[
          { key: 'doctor', label: 'Doctor' },
          { key: 'date', label: 'Date' },
          { key: 'time', label: 'Time' },
          { key: 'symptoms', label: 'Symptoms' },
          { key: 'status', label: 'Status' },
          { key: 'actions', label: 'Actions' }
        ]}
        data={upcoming.map((appointment) => ({
          ...appointment,
          actions: (
            <Stack direction="row" spacing={1}>
              <Button size="small" color="error" onClick={() => cancel(appointment.id)}>
                Cancel
              </Button>
            </Stack>
          )
        }))}
      />
      <SimpleTable
        title="Past Appointments"
        columns={[
          { key: 'doctor', label: 'Doctor' },
          { key: 'date', label: 'Date' },
          { key: 'time', label: 'Time' },
          { key: 'symptoms', label: 'Symptoms' },
          { key: 'status', label: 'Status' }
        ]}
        data={past}
      />
    </>
  );
};
