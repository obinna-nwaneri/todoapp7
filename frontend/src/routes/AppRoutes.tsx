import { Navigate, Route, Routes } from 'react-router-dom';

import { ProtectedRoute } from './ProtectedRoute';
import { useAuth } from '../context/AuthContext';
import { useRoleRedirect } from '../hooks/useRoleRedirect';
import { AdminAppointmentsPage } from '../pages/admin/AdminAppointmentsPage';
import { AdminDashboardPage } from '../pages/admin/AdminDashboardPage';
import { AdminDoctorsPage } from '../pages/admin/AdminDoctorsPage';
import { AdminPatientsPage } from '../pages/admin/AdminPatientsPage';
import { LoginPage } from '../pages/auth/LoginPage';
import { RegisterDoctorPage } from '../pages/auth/RegisterDoctorPage';
import { RegisterPatientPage } from '../pages/auth/RegisterPatientPage';
import { DoctorAppointmentsPage } from '../pages/doctor/DoctorAppointmentsPage';
import { DoctorDashboardPage } from '../pages/doctor/DoctorDashboardPage';
import { PatientAppointmentsPage } from '../pages/patient/PatientAppointmentsPage';
import { PatientBookPage } from '../pages/patient/PatientBookPage';
import { PatientDashboardPage } from '../pages/patient/PatientDashboardPage';

export const AppRoutes: React.FC = () => {
  const { role } = useAuth();
  const redirect = useRoleRedirect(role);

  return (
    <Routes>
      <Route path="/" element={<Navigate to={role ? redirect : '/login'} replace />} />
      <Route path="/login" element={<LoginPage />} />
      <Route path="/register-doctor" element={<RegisterDoctorPage />} />
      <Route path="/register-patient" element={<RegisterPatientPage />} />

      <Route element={<ProtectedRoute allowedRoles={['ADMIN']} />}>
        <Route path="/admin-panel/dashboard" element={<AdminDashboardPage />} />
        <Route path="/admin-panel/doctors" element={<AdminDoctorsPage />} />
        <Route path="/admin-panel/patients" element={<AdminPatientsPage />} />
        <Route path="/admin-panel/appointments" element={<AdminAppointmentsPage />} />
      </Route>

      <Route element={<ProtectedRoute allowedRoles={['DOCTOR']} />}>
        <Route path="/doctor-panel/dashboard" element={<DoctorDashboardPage />} />
        <Route path="/doctor-panel/appointments" element={<DoctorAppointmentsPage />} />
      </Route>

      <Route element={<ProtectedRoute allowedRoles={['PATIENT']} />}>
        <Route path="/patient-panel/dashboard" element={<PatientDashboardPage />} />
        <Route path="/patient-panel/appointments" element={<PatientAppointmentsPage />} />
        <Route path="/patient-panel/book" element={<PatientBookPage />} />
      </Route>

      <Route path="*" element={<Navigate to={role ? redirect : '/login'} replace />} />
    </Routes>
  );
};
