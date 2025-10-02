import { useEffect, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Alert, Box, Button, Stack, TextField, Typography } from '@mui/material';

import { useAuth } from '../../context/AuthContext';
import { roleToRoute, useRoleRedirect } from '../../hooks/useRoleRedirect';
import { loginRequest } from '../../services/api';

export const LoginPage: React.FC = () => {
  const { login, role } = useAuth();
  const navigate = useNavigate();
  const redirect = useRoleRedirect(role);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (role) {
      navigate(redirect, { replace: true });
    }
  }, [role, redirect, navigate]);

  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault();
    setLoading(true);
    setError(null);
    try {
      const data = await loginRequest(email, password);
      login(data);
      navigate(roleToRoute(data.role), { replace: true });
    } catch (err) {
      setError('Unable to log in. Please check your credentials.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <Box component="form" onSubmit={handleSubmit} sx={{ maxWidth: 400, mx: 'auto' }}>
      <Typography variant="h4" gutterBottom>
        Welcome Back
      </Typography>
      <Stack spacing={2}>
        {error && <Alert severity="error">{error}</Alert>}
        <TextField label="Email" type="email" value={email} onChange={(e) => setEmail(e.target.value)} required />
        <TextField
          label="Password"
          type="password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          required
        />
        <Button type="submit" variant="contained" disabled={loading}>
          {loading ? 'Signing in...' : 'Login'}
        </Button>
        <Typography variant="body2">
          Are you a doctor? <Link to="/register-doctor">Register here</Link>
        </Typography>
        <Typography variant="body2">
          Are you a patient? <Link to="/register-patient">Register here</Link>
        </Typography>
      </Stack>
    </Box>
  );
};
