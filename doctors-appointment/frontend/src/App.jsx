import { Navigate, Route, Routes } from 'react-router-dom'

import RequireAuth from './auth/RequireAuth'
import Layout from './components/Layout'
import AdminPanel from './pages/AdminPanel'
import BookAppointment from './pages/BookAppointment'
import Dashboard from './pages/Dashboard'
import DoctorDetail from './pages/DoctorDetail'
import DoctorSchedule from './pages/DoctorSchedule'
import Doctors from './pages/Doctors'
import Login from './pages/Login'
import MyAppointments from './pages/MyAppointments'
import Register from './pages/Register'

export default function App() {
  return (
    <Routes>
      <Route path="/" element={<Layout />}>
        <Route
          index
          element={(
            <RequireAuth roles={['ADMIN', 'DOCTOR', 'PATIENT']}>
              <Dashboard />
            </RequireAuth>
          )}
        />
        <Route path="login" element={<Login />} />
        <Route path="register" element={<Register />} />
        <Route path="doctors" element={<Doctors />} />
        <Route path="doctors/:id" element={<DoctorDetail />} />
        <Route
          path="book/:doctorId"
          element={(
            <RequireAuth roles={['PATIENT']}>
              <BookAppointment />
            </RequireAuth>
          )}
        />
        <Route
          path="me/appointments"
          element={(
            <RequireAuth roles={['PATIENT']}>
              <MyAppointments />
            </RequireAuth>
          )}
        />
        <Route
          path="doctor/schedule"
          element={(
            <RequireAuth roles={['DOCTOR']}>
              <DoctorSchedule />
            </RequireAuth>
          )}
        />
        <Route
          path="admin"
          element={(
            <RequireAuth roles={['ADMIN']}>
              <AdminPanel />
            </RequireAuth>
          )}
        />
        <Route path="*" element={<Navigate to="/" replace />} />
      </Route>
    </Routes>
  )
}
