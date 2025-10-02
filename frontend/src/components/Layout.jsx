import React from 'react'
import { Link } from 'react-router-dom'

import { useAuth } from '../context/AuthContext.jsx'

const Layout = ({ children }) => {
  const { user, logout } = useAuth()

  const renderNavLinks = () => {
    if (!user) return null
    if (user.role === 'ADMIN') {
      return (
        <nav>
          <Link to="/admin-panel/dashboard">Dashboard</Link>
          <Link to="/admin-panel/doctors">Doctors</Link>
          <Link to="/admin-panel/patients">Patients</Link>
          <Link to="/admin-panel/appointments">Appointments</Link>
        </nav>
      )
    }
    if (user.role === 'DOCTOR') {
      return (
        <nav>
          <Link to="/doctor-panel/dashboard">Dashboard</Link>
          <Link to="/doctor-panel/appointments">Appointments</Link>
        </nav>
      )
    }
    if (user.role === 'PATIENT') {
      return (
        <nav>
          <Link to="/patient-panel/dashboard">Dashboard</Link>
          <Link to="/patient-panel/appointments">Appointments</Link>
          <Link to="/patient-panel/book">Book Appointment</Link>
        </nav>
      )
    }
    return null
  }

  return (
    <div className="app-container">
      <header className="header">
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <div>
            <strong>Enterprise Doctor App</strong>
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
            {renderNavLinks()}
            {user && (
              <button className="primary" onClick={logout} style={{ background: '#0d47a1' }}>
                Logout
              </button>
            )}
          </div>
        </div>
      </header>
      <main>{children}</main>
    </div>
  )
}

export default Layout
