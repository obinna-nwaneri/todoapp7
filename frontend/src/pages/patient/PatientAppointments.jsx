import React, { useEffect, useState } from 'react'

import client from '../../api/client.js'
import usePaginatedResource from '../../hooks/usePaginatedResource.js'

const statusOptions = ['PENDING', 'APPROVED', 'REJECTED', 'COMPLETED']

const PatientAppointments = () => {
  const { items, page, setPage, search, setSearch, filters, setFilters, loading, error, refresh } =
    usePaginatedResource('/patient/appointments/', { status: '' })
  const [doctorOptions, setDoctorOptions] = useState([])
  const [editingId, setEditingId] = useState(null)
  const [form, setForm] = useState({ doctor: '', date: '', time: '', symptoms: '' })
  const [formError, setFormError] = useState('')

  useEffect(() => {
    const loadDoctors = async () => {
      try {
        const { data } = await client.get('/public/doctors/', { params: { page_size: 100 } })
        setDoctorOptions(data.results || data)
      } catch (err) {
        console.error('Failed to load doctors', err)
      }
    }
    loadDoctors()
  }, [])

  const beginEdit = (appointment) => {
    setEditingId(appointment.id)
    setForm({
      doctor: String(appointment.doctor),
      date: appointment.date,
      time: appointment.time,
      symptoms: appointment.symptoms,
    })
  }

  const handleInputChange = (event) => {
    const { name, value } = event.target
    setForm((prev) => ({ ...prev, [name]: value }))
  }

  const submitEdit = async (event) => {
    event.preventDefault()
    setFormError('')
    try {
      await client.patch(`/patient/appointments/${editingId}/`, {
        doctor: Number(form.doctor),
        date: form.date,
        time: form.time,
        symptoms: form.symptoms,
      })
      setEditingId(null)
      refresh()
    } catch (err) {
      setFormError('Unable to update appointment. Ensure the appointment is still pending and fields are valid.')
    }
  }

  const cancelAppointment = async (id) => {
    try {
      await client.delete(`/patient/appointments/${id}/`)
      refresh()
    } catch (err) {
      setFormError('Unable to cancel appointment. Only pending appointments can be cancelled.')
    }
  }

  return (
    <div>
      <h2>My Appointments</h2>
      {formError && <div className="alert">{formError}</div>}

      {editingId && (
        <form onSubmit={submitEdit} style={{ marginBottom: '1.5rem' }}>
          <h3>Edit Appointment</h3>
          <label>
            Doctor
            <select name="doctor" value={form.doctor} onChange={handleInputChange} required>
              <option value="">Select doctor</option>
              {doctorOptions.map((doctor) => (
                <option key={doctor.id} value={doctor.id}>
                  {doctor.name} ({doctor.specialization})
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
            Symptoms
            <textarea name="symptoms" value={form.symptoms} onChange={handleInputChange} required minLength={10} />
          </label>
          <div className="actions">
            <button className="primary" type="submit">
              Save Changes
            </button>
            <button type="button" onClick={() => setEditingId(null)}>
              Cancel
            </button>
          </div>
        </form>
      )}

      <div style={{ display: 'flex', gap: '1rem', marginBottom: '1rem' }}>
        <input
          type="search"
          placeholder="Search appointments"
          value={search}
          onChange={(event) => setSearch(event.target.value)}
        />
        <select value={filters.status || ''} onChange={(event) => setFilters({ status: event.target.value })}>
          <option value="">All Statuses</option>
          {statusOptions.map((option) => (
            <option key={option} value={option}>
              {option}
            </option>
          ))}
        </select>
      </div>

      {loading ? (
        <p>Loading appointments...</p>
      ) : (
        <div className="table-wrapper">
          <table>
            <thead>
              <tr>
                <th>Doctor</th>
                <th>Date</th>
                <th>Time</th>
                <th>Status</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {items.map((appointment) => (
                <tr key={appointment.id}>
                  <td>{appointment.doctor_name}</td>
                  <td>{appointment.date}</td>
                  <td>{appointment.time}</td>
                  <td>{appointment.status}</td>
                  <td className="actions">
                    <button type="button" disabled={appointment.status !== 'PENDING'} onClick={() => beginEdit(appointment)}>
                      Edit
                    </button>
                    <button
                      className="danger"
                      type="button"
                      disabled={appointment.status !== 'PENDING'}
                      onClick={() => cancelAppointment(appointment.id)}
                    >
                      Cancel
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {error && <div className="alert">{error}</div>}

      <div style={{ marginTop: '1rem', display: 'flex', gap: '0.5rem' }}>
        <button type="button" disabled={page <= 1} onClick={() => setPage(page - 1)}>
          Previous
        </button>
        <span>Page {page}</span>
        <button type="button" onClick={() => setPage(page + 1)}>
          Next
        </button>
      </div>
    </div>
  )
}

export default PatientAppointments
