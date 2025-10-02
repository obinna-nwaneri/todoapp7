import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Alert, Box, Button, Stack, TextField, Typography } from '@mui/material';

import { useAuth } from '../../context/AuthContext';
import { roleToRoute } from '../../hooks/useRoleRedirect';
import { registerDoctor } from '../../services/api';

export const RegisterDoctorPage: React.FC = () => {
  const { login } = useAuth();
  const navigate = useNavigate();
  const [form, setForm] = useState({
    email: '',
    password: '',
    name: '',
    specialization: '',
    yearsOfExperience: 0,
    availabilitySchedule: ''
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleChange = (field: string) => (event: React.ChangeEvent<HTMLInputElement>) => {
    setForm((prev) => ({ ...prev, [field]: field === 'yearsOfExperience' ? Number(event.target.value) : event.target.value }));
  };

  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault();
    setLoading(true);
    setError(null);
    try {
      const availabilitySchedule = form.availabilitySchedule
        ? JSON.parse(form.availabilitySchedule)
        : undefined;
      const data = await registerDoctor({
        email: form.email,
        password: form.password,
        name: form.name,
        specialization: form.specialization,
        yearsOfExperience: form.yearsOfExperience,
        availabilitySchedule
      });
      login(data);
      navigate(roleToRoute(data.role), { replace: true });
    } catch (err) {
      setError('Unable to register doctor. Please verify the information. Availability should be valid JSON.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <Box component="form" onSubmit={handleSubmit} sx={{ maxWidth: 500, mx: 'auto' }}>
      <Typography variant="h4" gutterBottom>
        Doctor Registration
      </Typography>
      <Stack spacing={2}>
        {error && <Alert severity="error">{error}</Alert>}
        <TextField label="Full Name" value={form.name} onChange={handleChange('name')} required />
        <TextField label="Specialization" value={form.specialization} onChange={handleChange('specialization')} required />
        <TextField
          label="Years of Experience"
          type="number"
          value={form.yearsOfExperience}
          onChange={handleChange('yearsOfExperience')}
          required
          inputProps={{ min: 0 }}
        />
        <TextField label="Email" type="email" value={form.email} onChange={handleChange('email')} required />
        <TextField
          label="Password"
          type="password"
          value={form.password}
          onChange={handleChange('password')}
          required
        />
        <TextField
          label="Availability Schedule (JSON)"
          helperText="Example: {\"monday\": [\"09:00\", \"13:00\"]}"
          value={form.availabilitySchedule}
          onChange={handleChange('availabilitySchedule')}
        />
        <Button type="submit" variant="contained" disabled={loading}>
          {loading ? 'Submitting...' : 'Create Account'}
        </Button>
        <Typography variant="body2">
          Already registered? <Link to="/login">Login</Link>
        </Typography>
      </Stack>
    </Box>
  );
};
