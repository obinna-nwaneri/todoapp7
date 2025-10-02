import React, { useEffect, useState } from 'react'

import client from '../../api/client.js'
import usePaginatedResource from '../../hooks/usePaginatedResource.js'

const defaultForm = {
  patient: '',
  doctor: '',
  date: '',
  time: '',
  symptoms: '',
  status: 'PENDING',
}

const AdminAppointments = () => {
  const { items, page, setPage, search, setSearch, filters, setFilters, loading, error, refresh } =
    usePaginatedResource('/admin/appointments/', { status: '', date: '' })
  const [form, setForm] = useState(defaultForm)
  const [editingId, setEditingId] = useState(null)
  const [formError, setFormError] = useState('')
  const [success, setSuccess] = useState('')
  const [doctorOptions, setDoctorOptions] = useState([])
  const [patientOptions, setPatientOptions] = useState([])

  useEffect(() => {
    const loadOptions = async () => {
      try {
        const [doctorsRes, patientsRes] = await Promise.all([
          client.get('/public/doctors/', { params: { page_size: 100 } }),
          client.get('/admin/patients/', { params: { page_size: 100 } }),
        ])
        setDoctorOptions(doctorsRes.data.results || doctorsRes.data)
        setPatientOptions(patientsRes.data.results || patientsRes.data)
      } catch (err) {
        console.error('Failed to load options', err)
      }
    }
    loadOptions()
  }, [])

  useEffect(() => {
    if (!editingId) {
      setForm(defaultForm)
    }
  }, [editingId])

  const handleInputChange = (event) => {
    const { name, value } = event.target
    setForm((prev) => ({ ...prev, [name]: value }))
  }

  const handleEdit = (appointment) => {
    setEditingId(appointment.id)
    setForm({
      patient: String(appointment.patient),
      doctor: String(appointment.doctor),
      date: appointment.date,
      time: appointment.time,
      symptoms: appointment.symptoms,
      status: appointment.status,
    })
  }

  const handleDelete = async (id) => {
    await client.delete(`/admin/appointments/${id}/`)
    refresh()
  }

  const handleSubmit = async (event) => {
    event.preventDefault()
    setFormError('')
    setSuccess('')
    try {
      const payload = {
        patient: Number(form.patient),
        doctor: Number(form.doctor),
        date: form.date,
        time: form.time,
        symptoms: form.symptoms,
        status: form.status,
      }
      if (editingId) {
        await client.put(`/admin/appointments/${editingId}/`, payload)
        setSuccess('Appointment updated successfully.')
      } else {
        await client.post('/admin/appointments/', payload)
        setSuccess('Appointment created successfully.')
      }
      setEditingId(null)
      setForm(defaultForm)
      refresh()
    } catch (err) {
      setFormError('Unable to submit the appointment form. Please verify all fields.')
    }
  }

  const statusOptions = ['PENDING', 'APPROVED', 'REJECTED', 'COMPLETED']

  return (
    <div>
      <h2>Manage Appointments</h2>
      {formError && <div className="alert">{formError}</div>}
      {success && <div className="alert">{success}</div>}
      <form onSubmit={handleSubmit}>
        <label>
          Patient
          <select name="patient" value={form.patient} onChange={handleInputChange} required>
            <option value="">Select patient</option>
            {patientOptions.map((patient) => (
              <option key={patient.id} value={patient.id}>
                {patient.name} ({patient.email})
              </option>
            ))}
          </select>
        </label>
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
        <label>
          Status
          <select name="status" value={form.status} onChange={handleInputChange}>
            {statusOptions.map((option) => (
              <option key={option} value={option}>
                {option}
              </option>
            ))}
          </select>
        </label>
        <button className="primary" type="submit">{editingId ? 'Update Appointment' : 'Create Appointment'}</button>
        {editingId && (
          <button type="button" onClick={() => setEditingId(null)}>
            Cancel
          </button>
        )}
      </form>

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
        <input
          type="date"
          value={filters.date || ''}
          onChange={(event) => setFilters({ date: event.target.value })}
        />
      </div>

      {loading ? (
        <p>Loading appointments...</p>
      ) : (
        <div className="table-wrapper">
          <table>
            <thead>
              <tr>
                <th>ID</th>
                <th>Patient</th>
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
                  <td>{appointment.id}</td>
                  <td>{appointment.patient_name}</td>
                  <td>{appointment.doctor_name}</td>
                  <td>{appointment.date}</td>
                  <td>{appointment.time}</td>
                  <td>{appointment.status}</td>
                  <td className="actions">
                    <button type="button" onClick={() => handleEdit(appointment)}>
                      Edit
                    </button>
                    <button className="danger" type="button" onClick={() => handleDelete(appointment.id)}>
                      Delete
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

export default AdminAppointments
