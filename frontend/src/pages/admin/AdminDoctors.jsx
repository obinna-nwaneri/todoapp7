import React, { useEffect, useState } from 'react'

import client from '../../api/client.js'
import usePaginatedResource from '../../hooks/usePaginatedResource.js'

const defaultForm = {
  name: '',
  specialization: '',
  years_of_experience: 0,
  availability_schedule: '',
  new_email: '',
  new_password: '',
}

const AdminDoctors = () => {
  const { items, page, setPage, search, setSearch, loading, error, refresh } = usePaginatedResource('/admin/doctors/')
  const [form, setForm] = useState(defaultForm)
  const [editingId, setEditingId] = useState(null)
  const [formError, setFormError] = useState('')
  const [success, setSuccess] = useState('')

  useEffect(() => {
    if (!editingId) {
      setForm(defaultForm)
    }
  }, [editingId])

  const handleInputChange = (event) => {
    const { name, value } = event.target
    setForm((prev) => ({ ...prev, [name]: value }))
  }

  const handleEdit = (doctor) => {
    setEditingId(doctor.id)
    setForm({
      name: doctor.name,
      specialization: doctor.specialization,
      years_of_experience: doctor.years_of_experience,
      availability_schedule: JSON.stringify(doctor.availability_schedule || {}, null, 2),
      new_email: '',
      new_password: '',
    })
  }

  const handleDelete = async (id) => {
    await client.delete(`/admin/doctors/${id}/`)
    refresh()
  }

  const handleSubmit = async (event) => {
    event.preventDefault()
    setFormError('')
    setSuccess('')
    try {
      const payload = {
        name: form.name,
        specialization: form.specialization,
        years_of_experience: Number(form.years_of_experience),
        availability_schedule: form.availability_schedule ? JSON.parse(form.availability_schedule || '{}') : {},
      }
      if (editingId) {
        await client.patch(`/admin/doctors/${editingId}/`, payload)
        setSuccess('Doctor updated successfully.')
      } else {
        payload.new_email = form.new_email
        payload.new_password = form.new_password
        await client.post('/admin/doctors/', payload)
        setSuccess('Doctor created successfully.')
      }
      setEditingId(null)
      setForm(defaultForm)
      refresh()
    } catch (err) {
      setFormError('Unable to submit the doctor form. Please verify all fields.')
    }
  }

  return (
    <div>
      <h2>Manage Doctors</h2>
      {formError && <div className="alert">{formError}</div>}
      {success && <div className="alert">{success}</div>}
      <form onSubmit={handleSubmit}>
        <label>
          Name
          <input name="name" value={form.name} onChange={handleInputChange} required />
        </label>
        <label>
          Specialization
          <input name="specialization" value={form.specialization} onChange={handleInputChange} required />
        </label>
        <label>
          Years of Experience
          <input type="number" name="years_of_experience" value={form.years_of_experience} onChange={handleInputChange} min={0} required />
        </label>
        <label>
          Availability (JSON)
          <textarea name="availability_schedule" value={form.availability_schedule} onChange={handleInputChange} placeholder='{"monday": "09:00-17:00"}' />
        </label>
        {!editingId && (
          <>
            <label>
              New Doctor Email
              <input type="email" name="new_email" value={form.new_email} onChange={handleInputChange} required />
            </label>
            <label>
              Password
              <input type="password" name="new_password" value={form.new_password} onChange={handleInputChange} required minLength={8} />
            </label>
          </>
        )}
        <button className="primary" type="submit">{editingId ? 'Update Doctor' : 'Create Doctor'}</button>
        {editingId && (
          <button type="button" onClick={() => setEditingId(null)}>
            Cancel
          </button>
        )}
      </form>

      <div style={{ marginBottom: '1rem' }}>
        <input
          type="search"
          placeholder="Search doctors"
          value={search}
          onChange={(event) => setSearch(event.target.value)}
        />
      </div>

      {loading ? (
        <p>Loading doctors...</p>
      ) : (
        <div className="table-wrapper">
          <table>
            <thead>
              <tr>
                <th>Name</th>
                <th>Specialization</th>
                <th>Experience</th>
                <th>Email</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {items.map((doctor) => (
                <tr key={doctor.id}>
                  <td>{doctor.name}</td>
                  <td>{doctor.specialization}</td>
                  <td>{doctor.years_of_experience} yrs</td>
                  <td>{doctor.email}</td>
                  <td className="actions">
                    <button type="button" onClick={() => handleEdit(doctor)}>
                      Edit
                    </button>
                    <button className="danger" type="button" onClick={() => handleDelete(doctor.id)}>
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

export default AdminDoctors
