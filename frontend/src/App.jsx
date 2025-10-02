import React from 'react'
import { Navigate, Route, Routes } from 'react-router-dom'

import Layout from './components/Layout.jsx'
import { useAuth } from './context/AuthContext.jsx'
import LoginPage from './pages/LoginPage.jsx'
import RegisterDoctorPage from './pages/RegisterDoctorPage.jsx'
import RegisterPatientPage from './pages/RegisterPatientPage.jsx'
import AdminAppointments from './pages/admin/AdminAppointments.jsx'
import AdminDashboard from './pages/admin/AdminDashboard.jsx'
import AdminDoctors from './pages/admin/AdminDoctors.jsx'
import AdminPatients from './pages/admin/AdminPatients.jsx'
import DoctorAppointments from './pages/doctor/DoctorAppointments.jsx'
import DoctorDashboard from './pages/doctor/DoctorDashboard.jsx'
import PatientAppointments from './pages/patient/PatientAppointments.jsx'
import PatientBookPage from './pages/patient/PatientBookPage.jsx'
import PatientDashboard from './pages/patient/PatientDashboard.jsx'
import ProtectedRoute from './routes/ProtectedRoute.jsx'

const roleRedirectMap = {
  ADMIN: '/admin-panel/dashboard',
  DOCTOR: '/doctor-panel/dashboard',
  PATIENT: '/patient-panel/dashboard',
}

const App = () => {
  const { user } = useAuth()

  return (
    <Routes>
      <Route path="/" element={<Navigate to="/login" replace />} />
      <Route path="/login" element={<LoginPage />} />
      <Route path="/register-doctor" element={<RegisterDoctorPage />} />
      <Route path="/register-patient" element={<RegisterPatientPage />} />

      <Route
        path="/admin-panel/dashboard"
        element={
          <ProtectedRoute allowedRoles={['ADMIN']}>
            <Layout>
              <AdminDashboard />
            </Layout>
          </ProtectedRoute>
        }
      />
      <Route
        path="/admin-panel/doctors"
        element={
          <ProtectedRoute allowedRoles={['ADMIN']}>
            <Layout>
              <AdminDoctors />
            </Layout>
          </ProtectedRoute>
        }
      />
      <Route
        path="/admin-panel/patients"
        element={
          <ProtectedRoute allowedRoles={['ADMIN']}>
            <Layout>
              <AdminPatients />
            </Layout>
          </ProtectedRoute>
        }
      />
      <Route
        path="/admin-panel/appointments"
        element={
          <ProtectedRoute allowedRoles={['ADMIN']}>
            <Layout>
              <AdminAppointments />
            </Layout>
          </ProtectedRoute>
        }
      />

      <Route
        path="/doctor-panel/dashboard"
        element={
          <ProtectedRoute allowedRoles={['DOCTOR']}>
            <Layout>
              <DoctorDashboard />
            </Layout>
          </ProtectedRoute>
        }
      />
      <Route
        path="/doctor-panel/appointments"
        element={
          <ProtectedRoute allowedRoles={['DOCTOR']}>
            <Layout>
              <DoctorAppointments />
            </Layout>
          </ProtectedRoute>
        }
      />

      <Route
        path="/patient-panel/dashboard"
        element={
          <ProtectedRoute allowedRoles={['PATIENT']}>
            <Layout>
              <PatientDashboard />
            </Layout>
          </ProtectedRoute>
        }
      />
      <Route
        path="/patient-panel/appointments"
        element={
          <ProtectedRoute allowedRoles={['PATIENT']}>
            <Layout>
              <PatientAppointments />
            </Layout>
          </ProtectedRoute>
        }
      />
      <Route
        path="/patient-panel/book"
        element={
          <ProtectedRoute allowedRoles={['PATIENT']}>
            <Layout>
              <PatientBookPage />
            </Layout>
          </ProtectedRoute>
        }
      />

      <Route
        path="*"
        element={
          user ? (
            <Navigate to={roleRedirectMap[user.role] || '/login'} replace />
          ) : (
            <Navigate to="/login" replace />
          )
        }
      />
    </Routes>
  )
}

export default App
