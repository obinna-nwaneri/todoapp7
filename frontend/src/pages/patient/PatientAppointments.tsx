import { useEffect, useState } from 'react';
import { Button, Stack, Table, TableBody, TableCell, TableHead, TableRow } from '@mui/material';
import PanelLayout from '../../components/PanelLayout';
import api from '../../services/api';
import { useNavigate } from 'react-router-dom';

interface Appointment {
  id: string;
  date: string;
  time: string;
  symptoms: string;
  status: string;
  doctor: { name: string };
}

const PatientAppointments = () => {
  const [appointments, setAppointments] = useState<Appointment[]>([]);
  const navigate = useNavigate();

  const load = async () => {
    const response = await api.get('/appointments');
    setAppointments(response.data);
  };

  useEffect(() => {
    load();
  }, []);

  const cancel = async (id: string) => {
    await api.delete(`/appointments/${id}`);
    load();
  };

  const goToBooking = () => navigate('/patient-panel/book');

  return (
    <PanelLayout title="My Appointments" actions={<Button onClick={goToBooking} variant="contained">Book Appointment</Button>}>
      <Table>
        <TableHead>
          <TableRow>
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
              <TableCell>{appointment.doctor?.name}</TableCell>
              <TableCell>{appointment.date}</TableCell>
              <TableCell>{appointment.time}</TableCell>
              <TableCell>{appointment.symptoms}</TableCell>
              <TableCell>{appointment.status}</TableCell>
              <TableCell align="right">
                <Stack direction="row" spacing={1} justifyContent="flex-end">
                  <Button size="small" variant="outlined" onClick={() => cancel(appointment.id)} disabled={appointment.status !== 'PENDING'}>
                    Cancel
                  </Button>
                </Stack>
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </PanelLayout>
  );
};

export default PatientAppointments;
