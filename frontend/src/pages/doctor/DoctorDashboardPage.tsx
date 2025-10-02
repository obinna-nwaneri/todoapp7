import { useEffect, useState } from 'react';
import { Alert, FormControl, InputLabel, LinearProgress, MenuItem, Select } from '@mui/material';

import { PageHeader } from '../../components/PageHeader';
import { SimpleTable } from '../../components/SimpleTable';
import { apiClient } from '../../services/api';

const STATUS_OPTIONS = ['PENDING', 'APPROVED', 'REJECTED', 'COMPLETED'];

export const DoctorDashboardPage: React.FC = () => {
  const [appointments, setAppointments] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const load = async () => {
    try {
      setLoading(true);
      const { data } = await apiClient.get('/appointments/doctor');
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

  const updateStatus = async (id: string, status: string) => {
    try {
      await apiClient.put(`/appointments/${id}/status`, { status });
      load();
    } catch (err) {
      setError('Failed to update appointment status');
    }
  };

  return (
    <>
      <PageHeader title="Doctor Dashboard" subtitle="Manage your upcoming appointments" />
      {loading && <LinearProgress sx={{ mb: 2 }} />}
      {error && <Alert severity="error" sx={{ mb: 2 }}>{error}</Alert>}
      <SimpleTable
        title="Upcoming Appointments"
        columns={[
          { key: 'patient', label: 'Patient' },
          { key: 'date', label: 'Date' },
          { key: 'time', label: 'Time' },
          { key: 'symptoms', label: 'Symptoms' },
          { key: 'status', label: 'Status' }
        ]}
        data={appointments.map((appointment) => ({
          patient: appointment.patient?.name ?? 'N/A',
          date: appointment.date,
          time: appointment.time,
          symptoms: appointment.symptoms,
          status: (
            <FormControl size="small" fullWidth>
              <InputLabel>Status</InputLabel>
              <Select
                label="Status"
                value={appointment.status}
                onChange={(e) => updateStatus(appointment.id, e.target.value)}
              >
                {STATUS_OPTIONS.map((option) => (
                  <MenuItem value={option} key={option}>
                    {option}
                  </MenuItem>
                ))}
              </Select>
            </FormControl>
          )
        }))}
      />
    </>
  );
};
