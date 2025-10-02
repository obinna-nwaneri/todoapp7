import React from 'react';
import { Navigate, Route, Routes } from 'react-router-dom';
import CssBaseline from '@mui/material/CssBaseline';
import Container from '@mui/material/Container';
import Toolbar from '@mui/material/Toolbar';
import AppBar from '@mui/material/AppBar';
import Typography from '@mui/material/Typography';
import Button from '@mui/material/Button';
import Stack from '@mui/material/Stack';

import { useAuth } from './context/AuthContext.jsx';
import ProtectedRoute from './components/ProtectedRoute.jsx';
import LoginPage from './pages/LoginPage.jsx';
import RegisterDoctorPage from './pages/RegisterDoctorPage.jsx';
import RegisterPatientPage from './pages/RegisterPatientPage.jsx';
import AdminDashboard from './pages/AdminDashboard.jsx';
import DoctorDashboard from './pages/DoctorDashboard.jsx';
import PatientDashboard from './pages/PatientDashboard.jsx';

const Layout = ({ children }) => {
  const { isAuthenticated, logout, user } = useAuth();
  return (
    <>
      <CssBaseline />
      <AppBar position="static">
        <Toolbar sx={{ display: 'flex', justifyContent: 'space-between' }}>
          <Typography variant="h6">Enterprise Doctor's Appointment</Typography>
          <Stack direction="row" spacing={2} alignItems="center">
            {user?.role && (
              <Typography variant="body2" sx={{ textTransform: 'capitalize' }}>
                {user.role.toLowerCase()} panel
              </Typography>
            )}
            {isAuthenticated ? (
              <Button color="inherit" onClick={logout}>
                Logout
              </Button>
            ) : null}
          </Stack>
        </Toolbar>
      </AppBar>
      <Container maxWidth="lg" sx={{ py: 4 }}>
        {children}
      </Container>
    </>
  );
};

const App = () => {
  const { isAuthenticated, redirect } = useAuth();
  return (
    <Layout>
      <Routes>
        <Route
          path="/"
          element={
            isAuthenticated && redirect ? <Navigate to={redirect} replace /> : <Navigate to="/login" replace />
          }
        />
        <Route path="/login" element={<LoginPage />} />
        <Route path="/register/doctor" element={<RegisterDoctorPage />} />
        <Route path="/register/patient" element={<RegisterPatientPage />} />

        <Route element={<ProtectedRoute allowedRoles={['ADMIN']} />}>
          <Route path="/admin-panel/dashboard" element={<AdminDashboard />} />
        </Route>
        <Route element={<ProtectedRoute allowedRoles={['DOCTOR']} />}>
          <Route path="/doctor-panel/dashboard" element={<DoctorDashboard />} />
        </Route>
        <Route element={<ProtectedRoute allowedRoles={['PATIENT']} />}>
          <Route path="/patient-panel/dashboard" element={<PatientDashboard />} />
        </Route>

        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </Layout>
  );
};

export default App;
