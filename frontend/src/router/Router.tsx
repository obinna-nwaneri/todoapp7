import { Navigate, Route, Routes } from 'react-router-dom';
import LoginPage from '../pages/auth/LoginPage';
import RegisterDoctorPage from '../pages/auth/RegisterDoctorPage';
import RegisterPatientPage from '../pages/auth/RegisterPatientPage';
import ProtectedRoute from '../components/ProtectedRoute';
import AdminDashboard from '../pages/admin/AdminDashboard';
import AdminDoctors from '../pages/admin/AdminDoctors';
import AdminPatients from '../pages/admin/AdminPatients';
import AdminAppointments from '../pages/admin/AdminAppointments';
import DoctorDashboard from '../pages/doctor/DoctorDashboard';
import DoctorAppointments from '../pages/doctor/DoctorAppointments';
import PatientDashboard from '../pages/patient/PatientDashboard';
import PatientAppointments from '../pages/patient/PatientAppointments';
import PatientBook from '../pages/patient/PatientBook';
import { useAuth } from '../contexts/AuthContext';

const Router = () => {
  const { user } = useAuth();

  return (
    <Routes>
      <Route path="/" element={<Navigate to={user ? panelRedirect(user.role) : '/login'} replace />} />
      <Route path="/login" element={<LoginPage />} />
      <Route path="/register-doctor" element={<RegisterDoctorPage />} />
      <Route path="/register-patient" element={<RegisterPatientPage />} />

      <Route element={<ProtectedRoute role="ADMIN" />}>
        <Route path="/admin-panel/dashboard" element={<AdminDashboard />} />
        <Route path="/admin-panel/doctors" element={<AdminDoctors />} />
        <Route path="/admin-panel/patients" element={<AdminPatients />} />
        <Route path="/admin-panel/appointments" element={<AdminAppointments />} />
      </Route>

      <Route element={<ProtectedRoute role="DOCTOR" />}>
        <Route path="/doctor-panel/dashboard" element={<DoctorDashboard />} />
        <Route path="/doctor-panel/appointments" element={<DoctorAppointments />} />
      </Route>

      <Route element={<ProtectedRoute role="PATIENT" />}>
        <Route path="/patient-panel/dashboard" element={<PatientDashboard />} />
        <Route path="/patient-panel/appointments" element={<PatientAppointments />} />
        <Route path="/patient-panel/book" element={<PatientBook />} />
      </Route>

      <Route path="*" element={<Navigate to="/login" replace />} />
    </Routes>
  );
};

const panelRedirect = (role: string | null) => {
  switch (role) {
    case 'ADMIN':
      return '/admin-panel/dashboard';
    case 'DOCTOR':
      return '/doctor-panel/dashboard';
    case 'PATIENT':
      return '/patient-panel/dashboard';
    default:
      return '/login';
  }
};

export default Router;
