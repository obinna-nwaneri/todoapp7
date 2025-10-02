import { useMemo, useState } from 'react';
import { useNavigate, useParams, Link as RouterLink } from 'react-router-dom';
import {
  Alert,
  Box,
  Button,
  Card,
  CardContent,
  Grid,
  Link,
  MenuItem,
  TextField,
  Typography
} from '@mui/material';
import { registerDoctor, registerPatient } from '../api';

const genderOptions = ['Male', 'Female', 'Non-binary', 'Prefer not to say'];

const RegisterPage = () => {
  const { role } = useParams();
  const navigate = useNavigate();
  const [formData, setFormData] = useState({ email: '', password: '', name: '' });
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(null);
  const isDoctor = role === 'doctor';

  const pageTitle = useMemo(() => (isDoctor ? 'Doctor Registration' : 'Patient Registration'), [isDoctor]);

  const handleChange = (event) => {
    const { name, value } = event.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (event) => {
    event.preventDefault();
    setError(null);
    try {
      if (isDoctor) {
        await registerDoctor(formData);
      } else {
        await registerPatient(formData);
      }
      setSuccess('Registration successful. You may now log in.');
      setTimeout(() => navigate('/login'), 1500);
    } catch (err) {
      console.error(err);
      setError('Registration failed. Please verify your information and try again.');
    }
  };

  return (
    <Box display="flex" justifyContent="center" alignItems="center" minHeight="100vh" bgcolor="#f4f6f8">
      <Card sx={{ width: 640 }}>
        <CardContent>
          <Typography variant="h5" gutterBottom textAlign="center">
            {pageTitle}
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
                <TextField name="email" label="Email" type="email" value={formData.email} onChange={handleChange} fullWidth required />
              </Grid>
              <Grid item xs={12} md={6}>
                <TextField name="password" label="Password" type="password" value={formData.password} onChange={handleChange} fullWidth required />
              </Grid>
              <Grid item xs={12} md={6}>
                <TextField name="name" label="Full Name" value={formData.name} onChange={handleChange} fullWidth required />
              </Grid>
              {isDoctor ? (
                <>
                  <Grid item xs={12} md={6}>
                    <TextField
                      name="specialization"
                      label="Specialization"
                      value={formData.specialization || ''}
                      onChange={handleChange}
                      fullWidth
                      required
                    />
                  </Grid>
                  <Grid item xs={12} md={6}>
                    <TextField
                      name="years_of_experience"
                      label="Years of Experience"
                      type="number"
                      value={formData.years_of_experience || ''}
                      onChange={handleChange}
                      fullWidth
                      required
                    />
                  </Grid>
                  <Grid item xs={12}>
                    <TextField
                      name="availability_schedule"
                      label="Availability Schedule"
                      value={formData.availability_schedule || ''}
                      onChange={handleChange}
                      fullWidth
                    />
                  </Grid>
                </>
              ) : (
                <>
                  <Grid item xs={12} md={6}>
                    <TextField
                      select
                      name="gender"
                      label="Gender"
                      value={formData.gender || ''}
                      onChange={handleChange}
                      fullWidth
                      required
                    >
                      {genderOptions.map((option) => (
                        <MenuItem key={option} value={option}>
                          {option}
                        </MenuItem>
                      ))}
                    </TextField>
                  </Grid>
                  <Grid item xs={12} md={6}>
                    <TextField
                      name="age"
                      label="Age"
                      type="number"
                      value={formData.age || ''}
                      onChange={handleChange}
                      fullWidth
                      required
                    />
                  </Grid>
                  <Grid item xs={12}>
                    <TextField
                      name="contact_info"
                      label="Contact Information"
                      value={formData.contact_info || ''}
                      onChange={handleChange}
                      fullWidth
                      required
                    />
                  </Grid>
                </>
              )}
            </Grid>
            <Button type="submit" variant="contained" color="primary" fullWidth sx={{ mt: 3 }}>
              Register
            </Button>
          </Box>
          <Box mt={2} textAlign="center">
            <Typography variant="body2">
              Already registered?{' '}
              <Link component={RouterLink} to="/login">
                Back to login
              </Link>
            </Typography>
          </Box>
        </CardContent>
      </Card>
    </Box>
  );
};

export default RegisterPage;
