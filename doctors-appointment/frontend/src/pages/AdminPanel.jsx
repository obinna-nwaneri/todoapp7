import { useMemo } from 'react'
import { useQuery } from '@tanstack/react-query'

import { listDoctorAppointments } from '../api/appointments'
import { listDoctors } from '../api/doctors'

export default function AdminPanel() {
  const doctorsQuery = useQuery({ queryKey: ['admin-doctors'], queryFn: () => listDoctors() })
  const appointmentsQuery = useQuery({ queryKey: ['admin-appointments'], queryFn: () => listDoctorAppointments() })

  const stats = useMemo(() => {
    const results = appointmentsQuery.data?.results ?? []
    const grouped = results.reduce(
      (acc, appt) => {
        acc[appt.status] = (acc[appt.status] ?? 0) + 1
        return acc
      },
      {}
    )
    return grouped
  }, [appointmentsQuery.data])

  return (
    <div className="grid" style={{ gap: '1.5rem' }}>
      <div>
        <h1>Admin Overview</h1>
        <p style={{ color: '#475569' }}>Monitor platform activity, doctor availability and appointments.</p>
      </div>
      <section className="card" style={{ display: 'grid', gap: '1rem' }}>
        <h2>Snapshot</h2>
        <div style={{ display: 'flex', gap: '2rem', flexWrap: 'wrap' }}>
          <div>
            <p style={{ margin: 0, color: '#475569' }}>Registered Doctors</p>
            <h3 style={{ margin: '0.25rem 0' }}>{doctorsQuery.data?.count ?? '--'}</h3>
          </div>
          <div>
            <p style={{ margin: 0, color: '#475569' }}>Total Appointments</p>
            <h3 style={{ margin: '0.25rem 0' }}>{appointmentsQuery.data?.count ?? '--'}</h3>
          </div>
          <div>
            <p style={{ margin: 0, color: '#475569' }}>Pending</p>
            <h3 style={{ margin: '0.25rem 0' }}>{stats.PENDING ?? 0}</h3>
          </div>
          <div>
            <p style={{ margin: 0, color: '#475569' }}>Confirmed</p>
            <h3 style={{ margin: '0.25rem 0' }}>{stats.CONFIRMED ?? 0}</h3>
          </div>
        </div>
      </section>
      <section className="card">
        <h2>Recently created appointments</h2>
        <ul style={{ padding: 0, listStyle: 'none', margin: 0 }}>
          {appointmentsQuery.data?.results?.slice(0, 5).map((appointment) => (
            <li key={appointment.id} style={{ padding: '0.5rem 0', borderBottom: '1px solid #e2e8f0' }}>
              {appointment.date} · Dr. {appointment.doctor_detail?.user?.last_name ?? appointment.doctor}{' '}
              — {appointment.status}
            </li>
          )) || <li>No appointments yet.</li>}
        </ul>
      </section>
    </div>
  )
}
