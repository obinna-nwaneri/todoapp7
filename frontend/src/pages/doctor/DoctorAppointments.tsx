import { useEffect, useState } from 'react';
import { Button, MenuItem, Select, Stack, Table, TableBody, TableCell, TableHead, TableRow } from '@mui/material';
import PanelLayout from '../../components/PanelLayout';
import api from '../../services/api';

interface Appointment {
  id: string;
  date: string;
  time: string;
  symptoms: string;
  status: string;
  patient: { name: string };
}

const DoctorAppointments = () => {
  const [appointments, setAppointments] = useState<Appointment[]>([]);
  const [statusFilter, setStatusFilter] = useState('');

  const loadAppointments = async () => {
    const response = await api.get('/appointments', {
      params: { status: statusFilter || undefined },
    });
    setAppointments(response.data);
  };

  useEffect(() => {
    loadAppointments();
  }, [statusFilter]);

  const updateStatus = async (id: string, status: string) => {
    await api.patch(`/appointments/${id}`, { status });
    loadAppointments();
  };

  return (
    <PanelLayout title="Doctor Appointments">
      <Stack direction={{ xs: 'column', md: 'row' }} spacing={2} mb={2} alignItems="center">
        <Select
          value={statusFilter}
          displayEmpty
          onChange={(e) => setStatusFilter(e.target.value as string)}
          sx={{ minWidth: 160 }}
        >
          <MenuItem value="">All statuses</MenuItem>
          <MenuItem value="PENDING">Pending</MenuItem>
          <MenuItem value="APPROVED">Approved</MenuItem>
          <MenuItem value="REJECTED">Rejected</MenuItem>
          <MenuItem value="COMPLETED">Completed</MenuItem>
        </Select>
        <Button variant="outlined" onClick={loadAppointments}>
          Refresh
        </Button>
      </Stack>
      <Table>
        <TableHead>
          <TableRow>
            <TableCell>Patient</TableCell>
            <TableCell>Date</TableCell>
            <TableCell>Time</TableCell>
            <TableCell>Symptoms</TableCell>
            <TableCell>Status</TableCell>
            <TableCell align="right">Actions</TableCell>
          </TableRow>
        </TableHead>
        <TableBody>
          {appointments.map((appointment) => (
            <TableRow key={appointment.id} hover>
              <TableCell>{appointment.patient?.name}</TableCell>
              <TableCell>{appointment.date}</TableCell>
              <TableCell>{appointment.time}</TableCell>
              <TableCell>{appointment.symptoms}</TableCell>
              <TableCell>{appointment.status}</TableCell>
              <TableCell align="right">
                <Stack direction="row" spacing={1} justifyContent="flex-end">
                  {['APPROVED', 'REJECTED', 'COMPLETED'].map((status) => (
                    <Button
                      key={status}
                      size="small"
                      variant={appointment.status === status ? 'contained' : 'outlined'}
                      onClick={() => updateStatus(appointment.id, status)}
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
    </PanelLayout>
  );
};

export default DoctorAppointments;
