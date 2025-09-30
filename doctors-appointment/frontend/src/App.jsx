import React from "react";
import { Navigate, Route, Routes } from "react-router-dom";

import Layout from "./components/Layout.jsx";
import { RequireAuth } from "./auth/RequireAuth.jsx";
import Login from "./pages/Login.jsx";
import Register from "./pages/Register.jsx";
import Dashboard from "./pages/Dashboard.jsx";
import Doctors from "./pages/Doctors.jsx";
import DoctorDetail from "./pages/DoctorDetail.jsx";
import BookAppointment from "./pages/BookAppointment.jsx";
import MyAppointments from "./pages/MyAppointments.jsx";
import DoctorSchedule from "./pages/DoctorSchedule.jsx";
import AdminPanel from "./pages/AdminPanel.jsx";

const App = () => (
  <Routes>
    <Route path="/login" element={<Login />} />
    <Route path="/register" element={<Register />} />
    <Route element={<Layout />}>
      <Route index element={<Dashboard />} />
      <Route path="doctors" element={<Doctors />} />
      <Route path="doctors/:id" element={<DoctorDetail />} />
      <Route element={<RequireAuth role="PATIENT" />}>
        <Route path="book/:doctorId" element={<BookAppointment />} />
        <Route path="me/appointments" element={<MyAppointments />} />
      </Route>
      <Route element={<RequireAuth role="DOCTOR" />}>
        <Route path="doctor/schedule" element={<DoctorSchedule />} />
      </Route>
      <Route element={<RequireAuth role="ADMIN" />}>
        <Route path="admin" element={<AdminPanel />} />
      </Route>
      <Route path="*" element={<Navigate to="/" replace />} />
    </Route>
  </Routes>
);

export default App;
