import { Navigate, Route, Routes } from 'react-router-dom';
import { ProtectedRoute } from './components/ProtectedRoute';
import LoginPage from './pages/LoginPage';
import RegisterPage from './pages/RegisterPage';
import AdminDashboard from './pages/AdminDashboard';
import DoctorDashboard from './pages/DoctorDashboard';
import PatientDashboard from './pages/PatientDashboard';
import { useAuth } from './context/AuthContext';

const HomeRedirect = () => {
  const { user } = useAuth();
  if (!user) {
    return <Navigate to="/login" replace />;
  }
  return <Navigate to={user.redirect_url || '/login'} replace />;
};

const App = () => (
  <Routes>
    <Route path="/" element={<HomeRedirect />} />
    <Route path="/login" element={<LoginPage />} />
    <Route path="/register/:role" element={<RegisterPage />} />

    <Route element={<ProtectedRoute allowedRoles={["ADMIN"]} />}>
      <Route path="/admin-panel/dashboard" element={<AdminDashboard />} />
    </Route>

    <Route element={<ProtectedRoute allowedRoles={["DOCTOR"]} />}>
      <Route path="/doctor-panel/dashboard" element={<DoctorDashboard />} />
    </Route>

    <Route element={<ProtectedRoute allowedRoles={["PATIENT"]} />}>
      <Route path="/patient-panel/dashboard" element={<PatientDashboard />} />
    </Route>

    <Route path="*" element={<Navigate to="/" replace />} />
  </Routes>
);

export default App;
