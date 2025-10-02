import React, { useEffect, useState } from 'react'

import client from '../../api/client.js'

const PatientBookPage = () => {
  const [form, setForm] = useState({ doctor: '', date: '', time: '', symptoms: '' })
  const [doctorOptions, setDoctorOptions] = useState([])
  const [message, setMessage] = useState('')
  const [error, setError] = useState('')

  useEffect(() => {
    const loadDoctors = async () => {
      try {
        const { data } = await client.get('/public/doctors/', { params: { page_size: 100 } })
        setDoctorOptions(data.results || data)
      } catch (err) {
        setError('Unable to load doctors. Please try again later.')
      }
    }
    loadDoctors()
  }, [])

  const handleInputChange = (event) => {
    const { name, value } = event.target
    setForm((prev) => ({ ...prev, [name]: value }))
  }

  const handleSubmit = async (event) => {
    event.preventDefault()
    setError('')
    setMessage('')
    try {
      await client.post('/patient/appointments/', {
        doctor: Number(form.doctor),
        date: form.date,
        time: form.time,
        symptoms: form.symptoms,
      })
      setMessage('Appointment request submitted successfully!')
      setForm({ doctor: '', date: '', time: '', symptoms: '' })
    } catch (err) {
      setError('Unable to create appointment. Ensure all fields are valid and the slot is available.')
    }
  }

  return (
    <div>
      <h2>Book an Appointment</h2>
      {message && <div className="alert">{message}</div>}
      {error && <div className="alert">{error}</div>}
      <form onSubmit={handleSubmit} style={{ maxWidth: '600px' }}>
        <label>
          Doctor
          <select name="doctor" value={form.doctor} onChange={handleInputChange} required>
            <option value="">Select doctor</option>
            {doctorOptions.map((doctor) => (
              <option key={doctor.id} value={doctor.id}>
                {doctor.name} – {doctor.specialization}
              </option>
            ))}
          </select>
        </label>
        <label>
          Date
          <input type="date" name="date" value={form.date} onChange={handleInputChange} required />
        </label>
        <label>
          Time
          <input type="time" name="time" value={form.time} onChange={handleInputChange} required />
        </label>
        <label>
          Describe Your Symptoms
          <textarea name="symptoms" value={form.symptoms} onChange={handleInputChange} required minLength={10} />
        </label>
        <button className="primary" type="submit">
          Book Appointment
        </button>
      </form>
    </div>
  )
}

export default PatientBookPage
