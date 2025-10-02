import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Alert, Box, Button, Stack, TextField, Typography } from '@mui/material';

import { useAuth } from '../../context/AuthContext';
import { roleToRoute } from '../../hooks/useRoleRedirect';
import { registerPatient } from '../../services/api';

export const RegisterPatientPage: React.FC = () => {
  const { login } = useAuth();
  const navigate = useNavigate();
  const [form, setForm] = useState({
    email: '',
    password: '',
    name: '',
    age: 0,
    gender: '',
    contactInfo: ''
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleChange = (field: string) => (event: React.ChangeEvent<HTMLInputElement>) => {
    setForm((prev) => ({ ...prev, [field]: field === 'age' ? Number(event.target.value) : event.target.value }));
  };

  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault();
    setLoading(true);
    setError(null);
    try {
      const data = await registerPatient(form);
      login(data);
      navigate(roleToRoute(data.role), { replace: true });
    } catch (err) {
      setError('Unable to register patient. Please review the information.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <Box component="form" onSubmit={handleSubmit} sx={{ maxWidth: 500, mx: 'auto' }}>
      <Typography variant="h4" gutterBottom>
        Patient Registration
      </Typography>
      <Stack spacing={2}>
        {error && <Alert severity="error">{error}</Alert>}
        <TextField label="Full Name" value={form.name} onChange={handleChange('name')} required />
        <TextField
          label="Age"
          type="number"
          value={form.age}
          onChange={handleChange('age')}
          required
          inputProps={{ min: 0 }}
        />
        <TextField label="Gender" value={form.gender} onChange={handleChange('gender')} required />
        <TextField label="Contact Info" value={form.contactInfo} onChange={handleChange('contactInfo')} required />
        <TextField label="Email" type="email" value={form.email} onChange={handleChange('email')} required />
        <TextField
          label="Password"
          type="password"
          value={form.password}
          onChange={handleChange('password')}
          required
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
