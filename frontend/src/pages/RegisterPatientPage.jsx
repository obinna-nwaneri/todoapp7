import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Alert, Box, Button, Card, CardContent, Grid, Stack, TextField, Typography } from '@mui/material';
import axios from 'axios';
import { API_BASE_URL } from '../context/AuthContext.jsx';

const RegisterPatientPage = () => {
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    email: '',
    password: '',
    first_name: '',
    last_name: '',
    name: '',
    age: '',
    gender: '',
    contact_info: ''
  });
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(null);
  const [loading, setLoading] = useState(false);

  const handleChange = (event) => {
    const { name, value } = event.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (event) => {
    event.preventDefault();
    setError(null);
    setSuccess(null);
    setLoading(true);
    try {
      await axios.post(`${API_BASE_URL}auth/register/patient/`, formData);
      setSuccess('Patient registered successfully. You can now login.');
      setTimeout(() => navigate('/login'), 1000);
    } catch (err) {
      setError(err.response?.data?.detail || 'Unable to register patient');
    } finally {
      setLoading(false);
    }
  };

  return (
    <Box maxWidth={720} mx="auto">
      <Card>
        <CardContent>
          <Typography variant="h5" gutterBottom>
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
            <Grid container spacing={2}>
              <Grid item xs={12} md={6}>
                <TextField label="Email" name="email" value={formData.email} onChange={handleChange} required fullWidth />
              </Grid>
              <Grid item xs={12} md={6}>
                <TextField
                  label="Password"
                  name="password"
                  type="password"
                  value={formData.password}
                  onChange={handleChange}
                  required
                  fullWidth
                />
              </Grid>
              <Grid item xs={12} md={6}>
                <TextField label="First Name" name="first_name" value={formData.first_name} onChange={handleChange} fullWidth />
              </Grid>
              <Grid item xs={12} md={6}>
                <TextField label="Last Name" name="last_name" value={formData.last_name} onChange={handleChange} fullWidth />
              </Grid>
              <Grid item xs={12}>
                <TextField label="Full Name" name="name" value={formData.name} onChange={handleChange} required fullWidth />
              </Grid>
              <Grid item xs={12} md={4}>
                <TextField label="Age" name="age" type="number" value={formData.age} onChange={handleChange} required fullWidth />
              </Grid>
              <Grid item xs={12} md={4}>
                <TextField label="Gender" name="gender" value={formData.gender} onChange={handleChange} required fullWidth />
              </Grid>
              <Grid item xs={12} md={4}>
                <TextField
                  label="Contact Info"
                  name="contact_info"
                  value={formData.contact_info}
                  onChange={handleChange}
                  required
                  fullWidth
                />
              </Grid>
            </Grid>
            <Stack direction="row" spacing={2} sx={{ mt: 3 }}>
              <Button type="submit" variant="contained" disabled={loading}>
                {loading ? 'Submitting...' : 'Register'}
              </Button>
              <Button variant="outlined" onClick={() => navigate('/login')}>
                Back to Login
              </Button>
            </Stack>
          </Box>
        </CardContent>
      </Card>
    </Box>
  );
};

export default RegisterPatientPage;
