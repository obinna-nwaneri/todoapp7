import React, { useEffect, useState } from 'react'

import client from '../../api/client.js'
import usePaginatedResource from '../../hooks/usePaginatedResource.js'

const defaultForm = {
  name: '',
  age: 0,
  gender: '',
  contact_info: '',
  new_email: '',
  new_password: '',
}

const AdminPatients = () => {
  const { items, page, setPage, search, setSearch, loading, error, refresh } = usePaginatedResource('/admin/patients/')
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

  const handleEdit = (patient) => {
    setEditingId(patient.id)
    setForm({
      name: patient.name,
      age: patient.age,
      gender: patient.gender,
      contact_info: JSON.stringify(patient.contact_info || {}, null, 2),
      new_email: '',
      new_password: '',
    })
  }

  const handleDelete = async (id) => {
    await client.delete(`/admin/patients/${id}/`)
    refresh()
  }

  const handleSubmit = async (event) => {
    event.preventDefault()
    setFormError('')
    setSuccess('')
    try {
      let contact = {}
      if (form.contact_info) {
        try {
          contact = JSON.parse(form.contact_info || '{}')
        } catch (parseError) {
          setFormError('Contact info must be valid JSON.')
          return
        }
      }
      const payload = {
        name: form.name,
        age: Number(form.age),
        gender: form.gender,
        contact_info: contact,
      }
      if (editingId) {
        await client.patch(`/admin/patients/${editingId}/`, payload)
        setSuccess('Patient updated successfully.')
      } else {
        payload.new_email = form.new_email
        payload.new_password = form.new_password
        await client.post('/admin/patients/', payload)
        setSuccess('Patient created successfully.')
      }
      setEditingId(null)
      setForm(defaultForm)
      refresh()
    } catch (err) {
      setFormError('Unable to submit the patient form. Please verify all fields.')
    }
  }

  return (
    <div>
      <h2>Manage Patients</h2>
      {formError && <div className="alert">{formError}</div>}
      {success && <div className="alert">{success}</div>}
      <form onSubmit={handleSubmit}>
        <label>
          Name
          <input name="name" value={form.name} onChange={handleInputChange} required />
        </label>
        <label>
          Age
          <input type="number" name="age" value={form.age} onChange={handleInputChange} min={0} required />
        </label>
        <label>
          Gender
          <input name="gender" value={form.gender} onChange={handleInputChange} required />
        </label>
        <label>
          Contact Info (JSON)
          <textarea name="contact_info" value={form.contact_info} onChange={handleInputChange} placeholder='{"phone": "123"}' />
        </label>
        {!editingId && (
          <>
            <label>
              New Patient Email
              <input type="email" name="new_email" value={form.new_email} onChange={handleInputChange} required />
            </label>
            <label>
              Password
              <input type="password" name="new_password" value={form.new_password} onChange={handleInputChange} required minLength={8} />
            </label>
          </>
        )}
        <button className="primary" type="submit">{editingId ? 'Update Patient' : 'Create Patient'}</button>
        {editingId && (
          <button type="button" onClick={() => setEditingId(null)}>
            Cancel
          </button>
        )}
      </form>

      <div style={{ marginBottom: '1rem' }}>
        <input
          type="search"
          placeholder="Search patients"
          value={search}
          onChange={(event) => setSearch(event.target.value)}
        />
      </div>

      {loading ? (
        <p>Loading patients...</p>
      ) : (
        <div className="table-wrapper">
          <table>
            <thead>
              <tr>
                <th>Name</th>
                <th>Age</th>
                <th>Gender</th>
                <th>Email</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {items.map((patient) => (
                <tr key={patient.id}>
                  <td>{patient.name}</td>
                  <td>{patient.age}</td>
                  <td>{patient.gender}</td>
                  <td>{patient.email}</td>
                  <td className="actions">
                    <button type="button" onClick={() => handleEdit(patient)}>
                      Edit
                    </button>
                    <button className="danger" type="button" onClick={() => handleDelete(patient.id)}>
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

export default AdminPatients
