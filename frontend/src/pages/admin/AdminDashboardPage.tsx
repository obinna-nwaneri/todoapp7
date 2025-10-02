import { useEffect, useState } from 'react';
import { Alert, Grid, LinearProgress } from '@mui/material';

import { DashboardCard } from '../../components/DashboardCard';
import { PageHeader } from '../../components/PageHeader';
import { SimpleTable } from '../../components/SimpleTable';
import { apiClient } from '../../services/api';

interface AppointmentRow {
  patient: string;
  doctor: string;
  date: string;
  time: string;
  status: string;
}

export const AdminDashboardPage: React.FC = () => {
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [counts, setCounts] = useState({ doctors: 0, patients: 0, appointments: 0 });
  const [appointments, setAppointments] = useState<AppointmentRow[]>([]);

  useEffect(() => {
    const load = async () => {
      try {
        setError(null);
        const [doctorsRes, patientsRes, appointmentsRes] = await Promise.all([
          apiClient.get('/doctors'),
          apiClient.get('/patients'),
          apiClient.get('/appointments')
        ]);
        setCounts({
          doctors: doctorsRes.data.length,
          patients: patientsRes.data.length,
          appointments: appointmentsRes.data.length
        });
        setAppointments(
          appointmentsRes.data.slice(0, 5).map((appt: any) => ({
            patient: appt.patient?.name ?? 'N/A',
            doctor: appt.doctor?.name ?? 'N/A',
            date: appt.date,
            time: appt.time,
            status: appt.status
          }))
        );
      } catch (err) {
        setError('Failed to load dashboard information.');
      } finally {
        setLoading(false);
      }
    };

    load();
  }, []);

  return (
    <>
      <PageHeader title="Admin Dashboard" subtitle="Monitor your platform at a glance." />
      {loading && <LinearProgress />}
      {error && <Alert severity="error" sx={{ mb: 2 }}>{error}</Alert>}
      <Grid container spacing={2} sx={{ mt: 1 }}>
        <Grid item xs={12} md={4}>
          <DashboardCard title="Doctors" value={counts.doctors} />
        </Grid>
        <Grid item xs={12} md={4}>
          <DashboardCard title="Patients" value={counts.patients} />
        </Grid>
        <Grid item xs={12} md={4}>
          <DashboardCard title="Appointments" value={counts.appointments} />
        </Grid>
      </Grid>
      <SimpleTable
        title="Recent Appointments"
        columns={[
          { key: 'patient', label: 'Patient' },
          { key: 'doctor', label: 'Doctor' },
          { key: 'date', label: 'Date' },
          { key: 'time', label: 'Time' },
          { key: 'status', label: 'Status' }
        ]}
        data={appointments}
      />
    </>
  );
};
