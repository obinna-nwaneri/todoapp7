import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'

import { listDoctorAppointments, updateStatus } from '../api/appointments'
import AppointmentCard from '../components/AppointmentCard'
import { useAuth } from '../auth/AuthContext'

export default function DoctorSchedule() {
  const queryClient = useQueryClient()
  const { role } = useAuth()
  const today = new Date().toISOString().slice(0, 10)

  const appointmentsQuery = useQuery({
    queryKey: ['doctor-schedule'],
    queryFn: () => listDoctorAppointments({ date_after: today }),
  })

  const mutation = useMutation({
    mutationFn: ({ appointment, status }) => updateStatus(appointment.id, status),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['doctor-schedule'] }),
  })

  return (
    <div className="grid" style={{ gap: '1.5rem' }}>
      <div>
        <h1>My Schedule</h1>
        <p style={{ color: '#475569' }}>Update appointment statuses and stay organised.</p>
      </div>
      {appointmentsQuery.isLoading && <p>Loading schedule...</p>}
      {appointmentsQuery.data?.results?.length ? (
        <div className="grid">
          {appointmentsQuery.data.results.map((appointment) => (
            <AppointmentCard
              key={appointment.id}
              appointment={appointment}
              role={role}
              onStatusChange={(appt, status) => mutation.mutate({ appointment: appt, status })}
            />
          ))}
        </div>
      ) : (
        !appointmentsQuery.isLoading && <p>No upcoming appointments.</p>
      )}
    </div>
  )
}
