import React, { useEffect } from 'react';
import { Link, Navigate, Route, Routes, useLocation, useNavigate } from 'react-router-dom';
import LoginPage from './pages/LoginPage';
import AdminDashboard from './pages/AdminDashboard';
import DoctorDashboard from './pages/DoctorDashboard';
import PatientDashboard from './pages/PatientDashboard';
import AppointmentsPage from './pages/AppointmentsPage';
import ProtectedRoute from './components/ProtectedRoute';
import { useAuthContext } from './auth/AuthContext';

const App: React.FC = () => {
  const { token, role, logout } = useAuthContext();
  const navigate = useNavigate();
  const location = useLocation();

  useEffect(() => {
    if (!token && location.pathname !== '/login') {
      navigate('/login');
    }
  }, [token, navigate, location.pathname]);

  const renderHomeRedirect = () => {
    if (!token) {
      return <Navigate to="/login" replace />;
    }
    if (role === 'Admin') {
      return <Navigate to="/admin" replace />;
    }
    if (role === 'Doctor') {
      return <Navigate to="/doctor" replace />;
    }
    if (role === 'Patient') {
      return <Navigate to="/patient" replace />;
    }
    return <Navigate to="/login" replace />;
  };

  return (
    <div>
      <nav className="navbar navbar-expand-lg navbar-dark bg-primary mb-4">
        <div className="container-fluid">
          <Link className="navbar-brand" to="/">
            MediBooker
          </Link>
          <div className="collapse navbar-collapse show">
            <ul className="navbar-nav me-auto mb-2 mb-lg-0">
              {token && (
                <li className="nav-item">
                  <Link className="nav-link" to="/appointments">
                    Appointments
                  </Link>
                </li>
              )}
            </ul>
            <div className="d-flex">
              {token ? (
                <button className="btn btn-outline-light" onClick={logout}>
                  Logout
                </button>
              ) : (
                <Link to="/login" className="btn btn-outline-light">
                  Login
                </Link>
              )}
            </div>
          </div>
        </div>
      </nav>
      <div className="container pb-5">
        <Routes>
          <Route path="/" element={renderHomeRedirect()} />
          <Route path="/login" element={<LoginPage />} />
          <Route
            path="/admin"
            element={
              <ProtectedRoute allowedRoles={['Admin']}>
                <AdminDashboard />
              </ProtectedRoute>
            }
          />
          <Route
            path="/doctor"
            element={
              <ProtectedRoute allowedRoles={['Doctor']}>
                <DoctorDashboard />
              </ProtectedRoute>
            }
          />
          <Route
            path="/patient"
            element={
              <ProtectedRoute allowedRoles={['Patient']}>
                <PatientDashboard />
              </ProtectedRoute>
            }
          />
          <Route
            path="/appointments"
            element={
              <ProtectedRoute allowedRoles={['Admin', 'Doctor', 'Patient']}>
                <AppointmentsPage />
              </ProtectedRoute>
            }
          />
        </Routes>
      </div>
    </div>
  );
};

export default App;
