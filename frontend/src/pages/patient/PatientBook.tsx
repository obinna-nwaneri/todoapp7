import { useEffect, useState } from 'react';
import { Alert, Box, Button, Card, CardContent, MenuItem, Stack, TextField, Typography } from '@mui/material';
import PanelLayout from '../../components/PanelLayout';
import api from '../../services/api';

interface Doctor {
  id: string;
  name: string;
  specialization: string;
}

const PatientBook = () => {
  const [doctors, setDoctors] = useState<Doctor[]>([]);
  const [form, setForm] = useState({ doctorId: '', date: '', time: '', symptoms: '' });
  const [message, setMessage] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const fetchDoctors = async () => {
      const response = await api.get('/doctors');
      setDoctors(response.data);
    };
    fetchDoctors();
  }, []);

  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault();
    setLoading(true);
    setMessage('');
    setError('');
    try {
      await api.post('/appointments', form);
      setMessage('Appointment booked successfully.');
      setForm({ doctorId: '', date: '', time: '', symptoms: '' });
    } catch (err: any) {
      setError(err.response?.data?.message || 'Failed to book appointment');
    } finally {
      setLoading(false);
    }
  };

  return (
    <PanelLayout title="Book Appointment">
      <Card>
        <CardContent>
          <Typography variant="h6" mb={2}>
            Appointment Details
          </Typography>
          {message && (
            <Alert severity="success" sx={{ mb: 2 }}>
              {message}
            </Alert>
          )}
          {error && (
            <Alert severity="error" sx={{ mb: 2 }}>
              {error}
            </Alert>
          )}
          <Box component="form" onSubmit={handleSubmit}>
            <Stack spacing={2}>
              <TextField
                select
                label="Select Doctor"
                value={form.doctorId}
                onChange={(e) => setForm((prev) => ({ ...prev, doctorId: e.target.value }))}
                required
              >
                {doctors.map((doctor) => (
                  <MenuItem key={doctor.id} value={doctor.id}>
                    {doctor.name} - {doctor.specialization}
                  </MenuItem>
                ))}
              </TextField>
              <TextField
                label="Date"
                type="date"
                InputLabelProps={{ shrink: true }}
                value={form.date}
                onChange={(e) => setForm((prev) => ({ ...prev, date: e.target.value }))}
                required
              />
              <TextField
                label="Time"
                type="time"
                InputLabelProps={{ shrink: true }}
                value={form.time}
                onChange={(e) => setForm((prev) => ({ ...prev, time: e.target.value }))}
                required
              />
              <TextField
                label="Symptoms"
                multiline
                minRows={3}
                value={form.symptoms}
                onChange={(e) => setForm((prev) => ({ ...prev, symptoms: e.target.value }))}
                required
              />
              <Button type="submit" variant="contained" disabled={loading}>
                {loading ? 'Booking...' : 'Book Appointment'}
              </Button>
            </Stack>
          </Box>
        </CardContent>
      </Card>
    </PanelLayout>
  );
};

export default PatientBook;
