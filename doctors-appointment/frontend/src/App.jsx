import { Routes, Route, Navigate } from "react-router-dom";

import Layout from "./components/Layout.jsx";
import RequireAuth from "./auth/RequireAuth.jsx";
import Dashboard from "./pages/Dashboard.jsx";
import Login from "./pages/Login.jsx";
import Register from "./pages/Register.jsx";
import Doctors from "./pages/Doctors.jsx";
import DoctorDetail from "./pages/DoctorDetail.jsx";
import BookAppointment from "./pages/BookAppointment.jsx";
import MyAppointments from "./pages/MyAppointments.jsx";
import DoctorSchedule from "./pages/DoctorSchedule.jsx";
import AdminPanel from "./pages/AdminPanel.jsx";

function App() {
  return (
    <Routes>
      <Route element={<Layout />}>
        <Route
          index
          element={
            <RequireAuth>
              <Dashboard />
            </RequireAuth>
          }
        />
        <Route path="login" element={<Login />} />
        <Route path="register" element={<Register />} />
        <Route path="doctors" element={<Doctors />} />
        <Route path="doctors/:doctorId" element={<DoctorDetail />} />
        <Route
          path="book/:doctorId"
          element={
            <RequireAuth role="PATIENT">
              <BookAppointment />
            </RequireAuth>
          }
        />
        <Route
          path="me/appointments"
          element={
            <RequireAuth role="PATIENT">
              <MyAppointments />
            </RequireAuth>
          }
        />
        <Route
          path="doctor/schedule"
          element={
            <RequireAuth role="DOCTOR">
              <DoctorSchedule />
            </RequireAuth>
          }
        />
        <Route
          path="admin"
          element={
            <RequireAuth role="ADMIN">
              <AdminPanel />
            </RequireAuth>
          }
        />
        <Route path="*" element={<Navigate to="/" />} />
      </Route>
    </Routes>
  );
}

export default App;
