import React, { useEffect, useState } from 'react'

import client from '../../api/client.js'

const PatientDashboard = () => {
  const [upcoming, setUpcoming] = useState([])
  const [past, setPast] = useState([])
  const [error, setError] = useState('')

  useEffect(() => {
    const load = async () => {
      try {
        const { data } = await client.get('/patient/appointments/', { params: { page: 1 } })
        const results = data.results || []
        const today = new Date()
        setUpcoming(
          results.filter((appointment) => new Date(`${appointment.date}T${appointment.time}`) >= today).slice(0, 5),
        )
        setPast(
          results.filter((appointment) => new Date(`${appointment.date}T${appointment.time}`) < today).slice(0, 5),
        )
      } catch (err) {
        setError('Unable to load appointments.')
      }
    }
    load()
  }, [])

  return (
    <div>
      <h2>Patient Dashboard</h2>
      {error && <div className="alert">{error}</div>}
      <div className="card">
        <h3>Upcoming Appointments</h3>
        {upcoming.length === 0 ? (
          <p>No upcoming appointments.</p>
        ) : (
          <ul>
            {upcoming.map((appointment) => (
              <li key={appointment.id}>
                {appointment.date} at {appointment.time} with {appointment.doctor_name} – {appointment.status}
              </li>
            ))}
          </ul>
        )}
      </div>
      <div className="card" style={{ marginTop: '1rem' }}>
        <h3>Recent Appointments</h3>
        {past.length === 0 ? (
          <p>No past appointments yet.</p>
        ) : (
          <ul>
            {past.map((appointment) => (
              <li key={appointment.id}>
                {appointment.date} at {appointment.time} with {appointment.doctor_name} – {appointment.status}
              </li>
            ))}
          </ul>
        )}
      </div>
    </div>
  )
}

export default PatientDashboard
