import { useEffect, useState } from 'react';
import {
  Alert,
  Box,
  Button,
  FormControl,
  InputLabel,
  LinearProgress,
  MenuItem,
  Select,
  Stack,
  TextField
} from '@mui/material';

import { PageHeader } from '../../components/PageHeader';
import { apiClient } from '../../services/api';

interface DoctorOption {
  id: string;
  name: string;
  specialization: string;
}

export const PatientBookPage: React.FC = () => {
  const [doctors, setDoctors] = useState<DoctorOption[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const [form, setForm] = useState({ doctorId: '', date: '', time: '', symptoms: '' });

  useEffect(() => {
    const loadDoctors = async () => {
      try {
        setLoading(true);
        const { data } = await apiClient.get('/doctors');
        setDoctors(data);
        setError(null);
      } catch (err) {
        setError('Failed to load doctors');
      } finally {
        setLoading(false);
      }
    };

    loadDoctors();
  }, []);

  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault();
    try {
      await apiClient.post('/appointments/book', form);
      setSuccess('Appointment request submitted!');
      setError(null);
      setForm({ doctorId: '', date: '', time: '', symptoms: '' });
    } catch (err) {
      setError('Failed to submit appointment request');
      setSuccess(null);
    }
  };

  return (
    <>
      <PageHeader title="Book Appointment" subtitle="Schedule a consultation" />
      {loading && <LinearProgress sx={{ mb: 2 }} />}
      {error && <Alert severity="error" sx={{ mb: 2 }}>{error}</Alert>}
      {success && <Alert severity="success" sx={{ mb: 2 }}>{success}</Alert>}
      <Box component="form" onSubmit={handleSubmit} sx={{ maxWidth: 500 }}>
        <Stack spacing={2}>
          <FormControl fullWidth>
            <InputLabel>Doctor</InputLabel>
            <Select
              label="Doctor"
              value={form.doctorId}
              onChange={(e) => setForm((prev) => ({ ...prev, doctorId: e.target.value }))}
              required
            >
              {doctors.map((doctor) => (
                <MenuItem value={doctor.id} key={doctor.id}>
                  {doctor.name} — {doctor.specialization}
                </MenuItem>
              ))}
            </Select>
          </FormControl>
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
            label="Describe your symptoms"
            value={form.symptoms}
            onChange={(e) => setForm((prev) => ({ ...prev, symptoms: e.target.value }))}
            required
            multiline
            minRows={3}
          />
          <Button type="submit" variant="contained">
            Book Appointment
          </Button>
        </Stack>
      </Box>
    </>
  );
};
