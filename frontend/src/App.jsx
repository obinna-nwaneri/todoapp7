import { BrowserRouter, Navigate, Route, Routes } from "react-router-dom";
import ProtectedRoute from "./components/ProtectedRoute";
import DashboardLayout from "./components/DashboardLayout";
import LoginPage from "./pages/LoginPage";
import RegisterDoctorPage from "./pages/RegisterDoctorPage";
import RegisterPatientPage from "./pages/RegisterPatientPage";
import AdminDashboardPage from "./pages/AdminDashboardPage";
import AdminDoctorsPage from "./pages/AdminDoctorsPage";
import AdminPatientsPage from "./pages/AdminPatientsPage";
import AdminAppointmentsPage from "./pages/AdminAppointmentsPage";
import DoctorDashboardPage from "./pages/DoctorDashboardPage";
import DoctorAppointmentsPage from "./pages/DoctorAppointmentsPage";
import PatientDashboardPage from "./pages/PatientDashboardPage";
import PatientAppointmentsPage from "./pages/PatientAppointmentsPage";
import PatientBookPage from "./pages/PatientBookPage";

const App = () => {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<Navigate to="/login" replace />} />
        <Route path="/login" element={<LoginPage />} />
        <Route path="/register-doctor" element={<RegisterDoctorPage />} />
        <Route path="/register-patient" element={<RegisterPatientPage />} />

        <Route element={<ProtectedRoute allowedRoles={["ADMIN"]} />}>
          <Route element={<DashboardLayout />}>
            <Route path="/admin-panel/dashboard" element={<AdminDashboardPage />} />
            <Route path="/admin-panel/doctors" element={<AdminDoctorsPage />} />
            <Route path="/admin-panel/patients" element={<AdminPatientsPage />} />
            <Route path="/admin-panel/appointments" element={<AdminAppointmentsPage />} />
          </Route>
        </Route>

        <Route element={<ProtectedRoute allowedRoles={["DOCTOR"]} />}>
          <Route element={<DashboardLayout />}>
            <Route path="/doctor-panel/dashboard" element={<DoctorDashboardPage />} />
            <Route path="/doctor-panel/appointments" element={<DoctorAppointmentsPage />} />
          </Route>
        </Route>

        <Route element={<ProtectedRoute allowedRoles={["PATIENT"]} />}>
          <Route element={<DashboardLayout />}>
            <Route path="/patient-panel/dashboard" element={<PatientDashboardPage />} />
            <Route path="/patient-panel/appointments" element={<PatientAppointmentsPage />} />
            <Route path="/patient-panel/book" element={<PatientBookPage />} />
          </Route>
        </Route>

        <Route path="*" element={<Navigate to="/login" replace />} />
      </Routes>
    </BrowserRouter>
  );
};

export default App;
