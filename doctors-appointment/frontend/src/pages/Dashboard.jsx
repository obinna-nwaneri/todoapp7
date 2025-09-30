import { useMemo } from 'react'
import { useQuery } from '@tanstack/react-query'

import { useAuth } from '../auth/AuthContext'
import { listDoctorAppointments, listMyAppointments } from '../api/appointments'
import AppointmentCard from '../components/AppointmentCard'

export default function Dashboard() {
  const { role, user } = useAuth()
  const today = new Date().toISOString().slice(0, 10)

  const query = useQuery({
    queryKey: ['dashboard-appointments', role],
    queryFn: () => {
      if (role === 'PATIENT') {
        return listMyAppointments({ date_after: today })
      }
      if (role === 'DOCTOR') {
        return listDoctorAppointments({ date_after: today })
      }
      if (role === 'ADMIN') {
        return listDoctorAppointments({ date_after: today })
      }
      return Promise.resolve({ results: [] })
    },
    enabled: Boolean(role),
  })

  const title = useMemo(() => {
    switch (role) {
      case 'PATIENT':
        return 'Upcoming appointments'
      case 'DOCTOR':
        return 'Today and upcoming schedule'
      case 'ADMIN':
        return 'All upcoming appointments'
      default:
        return 'Overview'
    }
  }, [role])

  return (
    <div className="grid" style={{ gap: '2rem' }}>
      <div>
        <h1>Welcome back, {user?.first_name || 'Guest'}!</h1>
        <p style={{ color: '#475569' }}>
          {role === 'PATIENT' && 'Manage your healthcare seamlessly and never miss a visit.'}
          {role === 'DOCTOR' && 'Stay on top of your consultation schedule and patient updates.'}
          {role === 'ADMIN' && 'Oversee clinic operations, doctors and appointments.'}
        </p>
      </div>
      <div>
        <h2>{title}</h2>
        {query.isLoading && <p>Loading appointments...</p>}
        {query.data?.results?.length ? (
          <div className="grid">
            {query.data.results.slice(0, 4).map((appointment) => (
              <AppointmentCard key={appointment.id} appointment={appointment} role={role} />
            ))}
          </div>
        ) : (
          !query.isLoading && <p>No appointments scheduled yet.</p>
        )}
      </div>
    </div>
  )
}
