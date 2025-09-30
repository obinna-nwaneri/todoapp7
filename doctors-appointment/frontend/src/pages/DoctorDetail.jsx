import { useMemo, useState } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import { useQuery } from '@tanstack/react-query'

import { useAuth } from '../auth/AuthContext'
import { getDoctor, getDoctorSlots } from '../api/doctors'

export default function DoctorDetail() {
  const { id } = useParams()
  const navigate = useNavigate()
  const { role, isAuthenticated } = useAuth()
  const [selectedDate, setSelectedDate] = useState(() => new Date().toISOString().slice(0, 10))
  const [selectedSlot, setSelectedSlot] = useState(null)

  const doctorQuery = useQuery({ queryKey: ['doctor', id], queryFn: () => getDoctor(id) })
  const slotsQuery = useQuery({
    queryKey: ['doctor-slots', id, selectedDate],
    queryFn: () => getDoctorSlots(id, selectedDate),
    enabled: Boolean(selectedDate),
  })

  const maxDate = useMemo(() => {
    const date = new Date()
    date.setDate(date.getDate() + 14)
    return date.toISOString().slice(0, 10)
  }, [])

  const handleBook = () => {
    if (!isAuthenticated) {
      navigate('/login', { state: { from: { pathname: `/doctors/${id}` } } })
      return
    }
    navigate(`/book/${id}`, { state: { date: selectedDate, slot: selectedSlot } })
  }

  return (
    <div className="grid" style={{ gap: '2rem' }}>
      <section className="card">
        {doctorQuery.isLoading ? (
          <p>Loading doctor...</p>
        ) : doctorQuery.data ? (
          <>
            <h1>Dr. {doctorQuery.data.user.first_name} {doctorQuery.data.user.last_name}</h1>
            <p style={{ margin: '0.25rem 0', color: '#475569' }}>{doctorQuery.data.specialty.name}</p>
            <p style={{ margin: '0.25rem 0' }}>{doctorQuery.data.clinic_name}</p>
            <p style={{ margin: '0.25rem 0' }}>{doctorQuery.data.about}</p>
            <p style={{ fontWeight: 600 }}>Consultation Fee: ₦{Number(doctorQuery.data.consultation_fee).toLocaleString()}</p>
          </>
        ) : (
          <p>Doctor not found.</p>
        )}
      </section>
      <section className="card">
        <h2>Available slots</h2>
        <div style={{ display: 'flex', gap: '1rem', marginBottom: '1rem', flexWrap: 'wrap' }}>
          <label htmlFor="date" style={{ flexBasis: '100%', fontWeight: 600 }}>Select date</label>
          <input
            id="date"
            type="date"
            min={new Date().toISOString().slice(0, 10)}
            max={maxDate}
            value={selectedDate}
            onChange={(event) => {
              setSelectedDate(event.target.value)
              setSelectedSlot(null)
            }}
            style={{ maxWidth: '200px' }}
          />
        </div>
        {slotsQuery.isLoading && <p>Loading slots...</p>}
        {slotsQuery.data?.length ? (
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.75rem' }}>
            {slotsQuery.data.map((slot) => {
              const active = selectedSlot?.start_time === slot.start_time
              return (
                <button
                  key={`${slot.start_time}-${slot.end_time}`}
                  type="button"
                  onClick={() => setSelectedSlot(slot)}
                  className="btn"
                  style={{
                    background: active ? '#4338ca' : '#2563eb',
                    padding: '0.5rem 1rem',
                  }}
                >
                  {slot.start_time} - {slot.end_time}
                </button>
              )
            })}
          </div>
        ) : (
          !slotsQuery.isLoading && <p>No slots available for this date.</p>
        )}
        <div style={{ marginTop: '1.5rem' }}>
          <button
            className="btn"
            type="button"
            onClick={handleBook}
            disabled={!selectedSlot || role !== 'PATIENT'}
          >
            {role === 'PATIENT' ? 'Book this slot' : 'Login as patient to book'}
          </button>
        </div>
      </section>
    </div>
  )
}
