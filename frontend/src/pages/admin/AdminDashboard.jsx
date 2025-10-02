import React, { useEffect, useState } from 'react'

import client from '../../api/client.js'

const AdminDashboard = () => {
  const [stats, setStats] = useState({ doctors: 0, patients: 0, appointments: 0, pending_appointments: 0 })
  const [error, setError] = useState('')

  useEffect(() => {
    const load = async () => {
      try {
        const { data } = await client.get('/admin/stats/')
        setStats(data)
      } catch (err) {
        setError('Unable to load dashboard statistics.')
      }
    }
    load()
  }, [])

  return (
    <div>
      <h2>Admin Dashboard</h2>
      {error && <div className="alert">{error}</div>}
      <div className="card-grid">
        <div className="card">
          <h3>Doctors</h3>
          <p>{stats.doctors}</p>
        </div>
        <div className="card">
          <h3>Patients</h3>
          <p>{stats.patients}</p>
        </div>
        <div className="card">
          <h3>Total Appointments</h3>
          <p>{stats.appointments}</p>
        </div>
        <div className="card">
          <h3>Pending Appointments</h3>
          <p>{stats.pending_appointments}</p>
        </div>
      </div>
    </div>
  )
}

export default AdminDashboard
