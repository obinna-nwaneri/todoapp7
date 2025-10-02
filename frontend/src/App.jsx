import { Navigate, Route, Routes, useLocation } from "react-router-dom";
import Layout from "./components/Layout";
import ProtectedRoute from "./components/ProtectedRoute";
import { useAuth } from "./hooks/useAuth";
import LoginPage from "./pages/LoginPage";
import RegisterDoctorPage from "./pages/RegisterDoctorPage";
import RegisterPatientPage from "./pages/RegisterPatientPage";
import AdminDashboardPage from "./pages/admin/AdminDashboardPage";
import AdminDoctorsPage from "./pages/admin/AdminDoctorsPage";
import AdminPatientsPage from "./pages/admin/AdminPatientsPage";
import AdminAppointmentsPage from "./pages/admin/AdminAppointmentsPage";
import DoctorDashboardPage from "./pages/doctor/DoctorDashboardPage";
import DoctorAppointmentsPage from "./pages/doctor/DoctorAppointmentsPage";
import PatientDashboardPage from "./pages/patient/PatientDashboardPage";
import PatientAppointmentsPage from "./pages/patient/PatientAppointmentsPage";
import PatientBookPage from "./pages/patient/PatientBookPage";

function RoleRedirect() {
  const { user } = useAuth();
  const location = useLocation();

  if (!user) {
    return <Navigate to="/login" replace state={{ from: location }} />;
  }

  if (user.role === "ADMIN") {
    return <Navigate to="/admin-panel/dashboard" replace />;
  }
  if (user.role === "DOCTOR") {
    return <Navigate to="/doctor-panel/dashboard" replace />;
  }
  return <Navigate to="/patient-panel/dashboard" replace />;
}

function AppLayout({ children, roles }) {
  return (
    <ProtectedRoute roles={roles}>
      <Layout>{children}</Layout>
    </ProtectedRoute>
  );
}

export default function App() {
  return (
    <Routes>
      <Route path="/" element={<RoleRedirect />} />
      <Route path="/login" element={<LoginPage />} />
      <Route path="/register-doctor" element={<RegisterDoctorPage />} />
      <Route path="/register-patient" element={<RegisterPatientPage />} />

      <Route
        path="/admin-panel/dashboard"
        element={
          <AppLayout roles={["ADMIN"]}>
            <AdminDashboardPage />
          </AppLayout>
        }
      />
      <Route
        path="/admin-panel/doctors"
        element={
          <AppLayout roles={["ADMIN"]}>
            <AdminDoctorsPage />
          </AppLayout>
        }
      />
      <Route
        path="/admin-panel/patients"
        element={
          <AppLayout roles={["ADMIN"]}>
            <AdminPatientsPage />
          </AppLayout>
        }
      />
      <Route
        path="/admin-panel/appointments"
        element={
          <AppLayout roles={["ADMIN"]}>
            <AdminAppointmentsPage />
          </AppLayout>
        }
      />

      <Route
        path="/doctor-panel/dashboard"
        element={
          <AppLayout roles={["DOCTOR"]}>
            <DoctorDashboardPage />
          </AppLayout>
        }
      />
      <Route
        path="/doctor-panel/appointments"
        element={
          <AppLayout roles={["DOCTOR"]}>
            <DoctorAppointmentsPage />
          </AppLayout>
        }
      />

      <Route
        path="/patient-panel/dashboard"
        element={
          <AppLayout roles={["PATIENT"]}>
            <PatientDashboardPage />
          </AppLayout>
        }
      />
      <Route
        path="/patient-panel/appointments"
        element={
          <AppLayout roles={["PATIENT"]}>
            <PatientAppointmentsPage />
          </AppLayout>
        }
      />
      <Route
        path="/patient-panel/book"
        element={
          <AppLayout roles={["PATIENT"]}>
            <PatientBookPage />
          </AppLayout>
        }
      />

      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  );
}
