import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'

import { cancelAppointment, listMyAppointments } from '../api/appointments'
import AppointmentCard from '../components/AppointmentCard'
import { useAuth } from '../auth/AuthContext'

export default function MyAppointments() {
  const queryClient = useQueryClient()
  const { role } = useAuth()

  const appointmentsQuery = useQuery({
    queryKey: ['my-appointments'],
    queryFn: () => listMyAppointments(),
  })

  const cancelMutation = useMutation({
    mutationFn: (appointment) => cancelAppointment(appointment.id),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['my-appointments'] }),
  })

  return (
    <div className="grid" style={{ gap: '1.5rem' }}>
      <div>
        <h1>My Appointments</h1>
        <p style={{ color: '#475569' }}>Manage and track all of your scheduled visits.</p>
      </div>
      {appointmentsQuery.isLoading && <p>Loading appointments...</p>}
      {appointmentsQuery.data?.results?.length ? (
        <div className="grid">
          {appointmentsQuery.data.results.map((appointment) => (
            <AppointmentCard
              key={appointment.id}
              appointment={appointment}
              role={role}
              onCancel={() => cancelMutation.mutate(appointment)}
            />
          ))}
        </div>
      ) : (
        !appointmentsQuery.isLoading && <p>No appointments yet.</p>
      )}
    </div>
  )
}
