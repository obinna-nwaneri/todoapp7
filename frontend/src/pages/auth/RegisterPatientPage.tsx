import { useState } from 'react';
import {
  Alert,
  Box,
  Button,
  Card,
  CardContent,
  Stack,
  TextField,
  Typography,
} from '@mui/material';
import { Link, useNavigate } from 'react-router-dom';
import api from '../../services/api';

const RegisterPatientPage = () => {
  const navigate = useNavigate();
  const [form, setForm] = useState({
    email: '',
    password: '',
    name: '',
    age: 0,
    gender: '',
    contactInfo: '',
  });
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [loading, setLoading] = useState(false);

  const handleChange = (key: string, value: string) => {
    setForm((prev) => ({ ...prev, [key]: value }));
  };

  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault();
    setLoading(true);
    setError('');
    setSuccess('');
    try {
      const payload = {
        ...form,
        age: Number(form.age),
      };
      await api.post('/auth/register/patient', payload);
      setSuccess('Patient registered successfully. You can now log in.');
      setTimeout(() => navigate('/login'), 1000);
    } catch (err: any) {
      setError(err.response?.data?.message || 'Registration failed');
    } finally {
      setLoading(false);
    }
  };

  return (
    <Box display="flex" justifyContent="center" alignItems="center" minHeight="100vh">
      <Card sx={{ maxWidth: 520, width: '100%' }}>
        <CardContent>
          <Typography variant="h5" mb={2} textAlign="center">
            Patient Registration
          </Typography>
          {error && (
            <Alert severity="error" sx={{ mb: 2 }}>
              {error}
            </Alert>
          )}
          {success && (
            <Alert severity="success" sx={{ mb: 2 }}>
              {success}
            </Alert>
          )}
          <Box component="form" onSubmit={handleSubmit}>
            <Stack spacing={2}>
              <TextField label="Full Name" value={form.name} onChange={(e) => handleChange('name', e.target.value)} required />
              <TextField
                label="Email"
                type="email"
                value={form.email}
                onChange={(e) => handleChange('email', e.target.value)}
                required
              />
              <TextField
                label="Password"
                type="password"
                value={form.password}
                onChange={(e) => handleChange('password', e.target.value)}
                required
              />
              <TextField
                label="Age"
                type="number"
                value={form.age}
                onChange={(e) => handleChange('age', e.target.value)}
                required
              />
              <TextField
                label="Gender"
                value={form.gender}
                onChange={(e) => handleChange('gender', e.target.value)}
                required
              />
              <TextField
                label="Contact Info"
                value={form.contactInfo}
                onChange={(e) => handleChange('contactInfo', e.target.value)}
                required
              />
              <Button type="submit" variant="contained" disabled={loading}>
                {loading ? 'Submitting...' : 'Register'}
              </Button>
              <Link to="/login">Back to login</Link>
            </Stack>
          </Box>
        </CardContent>
      </Card>
    </Box>
  );
};

export default RegisterPatientPage;
