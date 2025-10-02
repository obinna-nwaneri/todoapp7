import { Navigate, Route, Routes, Link } from "react-router-dom";

import ProtectedRoute from "./components/ProtectedRoute.jsx";
import { useAuth } from "./context/AuthContext.jsx";
import LoginPage from "./pages/LoginPage.jsx";
import RegisterDoctorPage from "./pages/RegisterDoctorPage.jsx";
import RegisterPatientPage from "./pages/RegisterPatientPage.jsx";
import AdminDashboardPage from "./pages/admin/AdminDashboardPage.jsx";
import AdminDoctorsPage from "./pages/admin/AdminDoctorsPage.jsx";
import AdminPatientsPage from "./pages/admin/AdminPatientsPage.jsx";
import AdminAppointmentsPage from "./pages/admin/AdminAppointmentsPage.jsx";
import DoctorDashboardPage from "./pages/doctor/DoctorDashboardPage.jsx";
import DoctorAppointmentsPage from "./pages/doctor/DoctorAppointmentsPage.jsx";
import PatientDashboardPage from "./pages/patient/PatientDashboardPage.jsx";
import PatientAppointmentsPage from "./pages/patient/PatientAppointmentsPage.jsx";
import PatientBookPage from "./pages/patient/PatientBookPage.jsx";

const dashboardForRole = (role) => {
  switch (role) {
    case "ADMIN":
      return "/admin-panel/dashboard";
    case "DOCTOR":
      return "/doctor-panel/dashboard";
    case "PATIENT":
      return "/patient-panel/dashboard";
    default:
      return "/login";
  }
};

function App() {
  const { user, logout } = useAuth();

  return (
    <div>
      <header>
        <nav className="navbar">
          <Link to="/">Enterprise Doctor App</Link>
          <div className="nav-links">
            {user ? (
              <>
                <Link to={dashboardForRole(user.role)}>Dashboard</Link>
                <button type="button" className="secondary" onClick={logout}>
                  Logout
                </button>
              </>
            ) : (
              <>
                <Link to="/login">Login</Link>
                <Link to="/register-doctor">Register Doctor</Link>
                <Link to="/register-patient">Register Patient</Link>
              </>
            )}
          </div>
        </nav>
      </header>
      <main className="container">
        <Routes>
          <Route
            path="/"
            element={
              user ? <Navigate to={dashboardForRole(user.role)} replace /> : <Navigate to="/login" replace />
            }
          />
          <Route path="/login" element={<LoginPage />} />
          <Route path="/register-doctor" element={<RegisterDoctorPage />} />
          <Route path="/register-patient" element={<RegisterPatientPage />} />

          <Route
            path="/admin-panel/dashboard"
            element={
              <ProtectedRoute allowedRoles={["ADMIN"]}>
                <AdminDashboardPage />
              </ProtectedRoute>
            }
          />
          <Route
            path="/admin-panel/doctors"
            element={
              <ProtectedRoute allowedRoles={["ADMIN"]}>
                <AdminDoctorsPage />
              </ProtectedRoute>
            }
          />
          <Route
            path="/admin-panel/patients"
            element={
              <ProtectedRoute allowedRoles={["ADMIN"]}>
                <AdminPatientsPage />
              </ProtectedRoute>
            }
          />
          <Route
            path="/admin-panel/appointments"
            element={
              <ProtectedRoute allowedRoles={["ADMIN"]}>
                <AdminAppointmentsPage />
              </ProtectedRoute>
            }
          />

          <Route
            path="/doctor-panel/dashboard"
            element={
              <ProtectedRoute allowedRoles={["DOCTOR"]}>
                <DoctorDashboardPage />
              </ProtectedRoute>
            }
          />
          <Route
            path="/doctor-panel/appointments"
            element={
              <ProtectedRoute allowedRoles={["DOCTOR"]}>
                <DoctorAppointmentsPage />
              </ProtectedRoute>
            }
          />

          <Route
            path="/patient-panel/dashboard"
            element={
              <ProtectedRoute allowedRoles={["PATIENT"]}>
                <PatientDashboardPage />
              </ProtectedRoute>
            }
          />
          <Route
            path="/patient-panel/appointments"
            element={
              <ProtectedRoute allowedRoles={["PATIENT"]}>
                <PatientAppointmentsPage />
              </ProtectedRoute>
            }
          />
          <Route
            path="/patient-panel/book"
            element={
              <ProtectedRoute allowedRoles={["PATIENT"]}>
                <PatientBookPage />
              </ProtectedRoute>
            }
          />
        </Routes>
      </main>
    </div>
  );
}

export default App;
