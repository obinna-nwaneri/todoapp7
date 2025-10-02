import { useEffect, useState } from 'react';
import { Alert, Button, FormControl, InputLabel, LinearProgress, MenuItem, Select, Stack } from '@mui/material';

import { PageHeader } from '../../components/PageHeader';
import { SimpleTable } from '../../components/SimpleTable';
import { apiClient } from '../../services/api';

const STATUS_OPTIONS = ['PENDING', 'APPROVED', 'REJECTED', 'COMPLETED'];

export const DoctorAppointmentsPage: React.FC = () => {
  const [appointments, setAppointments] = useState<any[]>([]);
  const [statusFilter, setStatusFilter] = useState('');
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

  const filteredAppointments = appointments.filter((appointment) =>
    statusFilter ? appointment.status === statusFilter : true
  );

  return (
    <>
      <PageHeader
        title="Appointments"
        subtitle="Review and manage appointment history"
        actions={
          <Stack direction="row" spacing={2}>
            <FormControl size="small" sx={{ minWidth: 160 }}>
              <InputLabel>Status</InputLabel>
              <Select value={statusFilter} label="Status" onChange={(e) => setStatusFilter(e.target.value)}>
                <MenuItem value="">All</MenuItem>
                {STATUS_OPTIONS.map((status) => (
                  <MenuItem value={status} key={status}>
                    {status}
                  </MenuItem>
                ))}
              </Select>
            </FormControl>
            <Button variant="outlined" onClick={load}>
              Refresh
            </Button>
          </Stack>
        }
      />
      {loading && <LinearProgress sx={{ mb: 2 }} />}
      {error && <Alert severity="error" sx={{ mb: 2 }}>{error}</Alert>}
      <SimpleTable
        title="Appointments"
        columns={[
          { key: 'patient', label: 'Patient' },
          { key: 'date', label: 'Date' },
          { key: 'time', label: 'Time' },
          { key: 'symptoms', label: 'Symptoms' },
          { key: 'status', label: 'Status' }
        ]}
        data={filteredAppointments.map((appointment) => ({
          patient: appointment.patient?.name ?? 'N/A',
          date: appointment.date,
          time: appointment.time,
          symptoms: appointment.symptoms,
          status: appointment.status
        }))}
      />
    </>
  );
};
