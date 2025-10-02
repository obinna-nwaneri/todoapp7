import React, { useEffect, useState } from 'react'

import client from '../../api/client.js'

const DoctorDashboard = () => {
  const [upcoming, setUpcoming] = useState([])
  const [error, setError] = useState('')

  useEffect(() => {
    const load = async () => {
      try {
        const { data } = await client.get('/doctor/appointments/', { params: { page: 1 } })
        const results = data.results || []
        setUpcoming(results.slice(0, 5))
      } catch (err) {
        setError('Unable to load appointments.')
      }
    }
    load()
  }, [])

  return (
    <div>
      <h2>Doctor Dashboard</h2>
      {error && <div className="alert">{error}</div>}
      <div className="card">
        <h3>Upcoming Appointments</h3>
        {upcoming.length === 0 ? (
          <p>No upcoming appointments.</p>
        ) : (
          <ul>
            {upcoming.map((appointment) => (
              <li key={appointment.id}>
                {appointment.date} at {appointment.time} with {appointment.patient_name} – {appointment.status}
              </li>
            ))}
          </ul>
        )}
      </div>
    </div>
  )
}

export default DoctorDashboard
