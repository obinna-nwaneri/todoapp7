import { useState } from 'react'
import { useLocation, useNavigate, useParams } from 'react-router-dom'
import { useMutation } from '@tanstack/react-query'

import { createAppointment } from '../api/appointments'

export default function BookAppointment() {
  const { doctorId } = useParams()
  const navigate = useNavigate()
  const location = useLocation()
  const initialState = location.state ?? {}
  const [reason, setReason] = useState('')
  const [error, setError] = useState('')

  const mutation = useMutation({
    mutationFn: (payload) => createAppointment(payload),
    onSuccess: () => {
      navigate('/me/appointments')
    },
    onError: (err) => {
      setError(err.response?.data?.detail ?? 'Unable to book appointment. Please try again.')
    },
  })

  const handleSubmit = (event) => {
    event.preventDefault()
    if (!initialState?.slot || !initialState?.date) {
      setError('Please select a slot from the doctor page first.')
      return
    }
    mutation.mutate({
      doctor: Number(doctorId),
      date: initialState.date,
      start_time: initialState.slot.start_time,
      end_time: initialState.slot.end_time,
      reason,
    })
  }

  return (
    <div className="card" style={{ maxWidth: 520, margin: '2rem auto' }}>
      <h2>Confirm Appointment</h2>
      <p>
        Date: <strong>{initialState.date}</strong>
      </p>
      <p>
        Time: <strong>{initialState.slot?.start_time} - {initialState.slot?.end_time}</strong>
      </p>
      <form onSubmit={handleSubmit}>
        <label htmlFor="reason">Reason (optional)</label>
        <textarea id="reason" value={reason} onChange={(event) => setReason(event.target.value)} rows={4} />
        {error && <p style={{ color: '#dc2626' }}>{error}</p>}
        <button className="btn" type="submit" disabled={mutation.isLoading}>
          {mutation.isLoading ? 'Booking...' : 'Confirm appointment'}
        </button>
      </form>
    </div>
  )
}
