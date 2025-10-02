import { useState } from 'react';
import { useNavigate, Link as RouterLink } from 'react-router-dom';
import {
  Alert,
  Box,
  Button,
  Card,
  CardContent,
  CircularProgress,
  Link,
  TextField,
  Typography
} from '@mui/material';
import { useAuth } from '../context/AuthContext';

const LoginPage = () => {
  const { login, error, setError, loading } = useAuth();
  const [credentials, setCredentials] = useState({ email: '', password: '' });
  const [submitting, setSubmitting] = useState(false);
  const navigate = useNavigate();

  const handleChange = (event) => {
    const { name, value } = event.target;
    setCredentials((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (event) => {
    event.preventDefault();
    setSubmitting(true);
    setError?.(null);
    try {
      const profile = await login(credentials.email, credentials.password);
      navigate(profile.redirect_url || '/');
    } catch (err) {
      console.error(err);
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <Box display="flex" justifyContent="center" alignItems="center" minHeight="100vh" bgcolor="#f4f6f8">
      <Card sx={{ width: 420 }}>
        <CardContent>
          <Typography variant="h5" textAlign="center" gutterBottom>
            Sign in to continue
          </Typography>
          {error && (
            <Alert severity="error" sx={{ mb: 2 }}>
              {error}
            </Alert>
          )}
          <Box component="form" onSubmit={handleSubmit}>
            <TextField
              label="Email"
              name="email"
              type="email"
              value={credentials.email}
              onChange={handleChange}
              fullWidth
              margin="normal"
              required
            />
            <TextField
              label="Password"
              name="password"
              type="password"
              value={credentials.password}
              onChange={handleChange}
              fullWidth
              margin="normal"
              required
            />
            <Button type="submit" variant="contained" color="primary" fullWidth sx={{ mt: 2 }} disabled={submitting}>
              {submitting || loading ? <CircularProgress size={24} color="inherit" /> : 'Login'}
            </Button>
          </Box>
          <Box mt={2} textAlign="center">
            <Typography variant="body2">
              New doctor?{' '}
              <Link component={RouterLink} to="/register/doctor">
                Register here
              </Link>
            </Typography>
            <Typography variant="body2">
              New patient?{' '}
              <Link component={RouterLink} to="/register/patient">
                Register here
              </Link>
            </Typography>
          </Box>
        </CardContent>
      </Card>
    </Box>
  );
};

export default LoginPage;
