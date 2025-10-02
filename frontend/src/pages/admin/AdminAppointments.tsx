import { useEffect, useState } from 'react';
import {
  Box,
  Button,
  MenuItem,
  Select,
  Stack,
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableRow,
  TextField,
} from '@mui/material';
import PanelLayout from '../../components/PanelLayout';
import api from '../../services/api';

interface Appointment {
  id: string;
  date: string;
  time: string;
  symptoms: string;
  status: string;
  patient: { id: string; name: string };
  doctor: { id: string; name: string };
}

const AdminAppointments = () => {
  const [appointments, setAppointments] = useState<Appointment[]>([]);
  const [filters, setFilters] = useState({ q: '', status: '' });

  const fetchAppointments = async () => {
    const response = await api.get('/search', {
      params: { entity: 'appointments', q: filters.q || undefined, status: filters.status || undefined },
    });
    setAppointments(response.data);
  };

  useEffect(() => {
    fetchAppointments();
  }, []);

  const handleFilter = (event: React.FormEvent) => {
    event.preventDefault();
    fetchAppointments();
  };

  const handleStatusChange = async (id: string, status: string) => {
    await api.patch(`/appointments/${id}`, { status });
    fetchAppointments();
  };

  return (
    <PanelLayout title="Manage Appointments">
      <Box component="form" onSubmit={handleFilter} mb={2}>
        <Stack direction={{ xs: 'column', md: 'row' }} spacing={2}>
          <TextField
            label="Search"
            value={filters.q}
            onChange={(e) => setFilters((prev) => ({ ...prev, q: e.target.value }))}
            sx={{ flexGrow: 1 }}
          />
          <Select
            value={filters.status}
            displayEmpty
            onChange={(e) => setFilters((prev) => ({ ...prev, status: e.target.value as string }))}
            sx={{ minWidth: 160 }}
          >
            <MenuItem value="">All statuses</MenuItem>
            <MenuItem value="PENDING">Pending</MenuItem>
            <MenuItem value="APPROVED">Approved</MenuItem>
            <MenuItem value="REJECTED">Rejected</MenuItem>
            <MenuItem value="COMPLETED">Completed</MenuItem>
          </Select>
          <Button type="submit" variant="contained">
            Filter
          </Button>
        </Stack>
      </Box>

      <Table>
        <TableHead>
          <TableRow>
            <TableCell>Patient</TableCell>
            <TableCell>Doctor</TableCell>
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
              <TableCell>{appointment.doctor?.name}</TableCell>
              <TableCell>{appointment.date}</TableCell>
              <TableCell>{appointment.time}</TableCell>
              <TableCell>{appointment.symptoms}</TableCell>
              <TableCell>{appointment.status}</TableCell>
              <TableCell align="right">
                <Stack direction="row" spacing={1} justifyContent="flex-end">
                  {['PENDING', 'APPROVED', 'REJECTED', 'COMPLETED'].map((status) => (
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
    </PanelLayout>
  );
};

export default AdminAppointments;
