import React, { useState } from 'react'

import client from '../../api/client.js'
import usePaginatedResource from '../../hooks/usePaginatedResource.js'

const statusOptions = ['PENDING', 'APPROVED', 'REJECTED', 'COMPLETED']

const DoctorAppointments = () => {
  const { items, page, setPage, search, setSearch, filters, setFilters, loading, error, refresh } =
    usePaginatedResource('/doctor/appointments/', { status: '' })
  const [updatingId, setUpdatingId] = useState(null)
  const [statusError, setStatusError] = useState('')

  const updateStatus = async (id, status) => {
    setUpdatingId(id)
    setStatusError('')
    try {
      await client.patch(`/doctor/appointments/${id}/`, { status })
      refresh()
    } catch (err) {
      setStatusError('Unable to update appointment status.')
    } finally {
      setUpdatingId(null)
    }
  }

  return (
    <div>
      <h2>My Appointments</h2>
      {statusError && <div className="alert">{statusError}</div>}
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
                <th>Patient</th>
                <th>Date</th>
                <th>Time</th>
                <th>Status</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {items.map((appointment) => (
                <tr key={appointment.id}>
                  <td>{appointment.patient_name}</td>
                  <td>{appointment.date}</td>
                  <td>{appointment.time}</td>
                  <td>{appointment.status}</td>
                  <td className="actions">
                    {statusOptions.map((option) => (
                      <button
                        key={option}
                        type="button"
                        disabled={updatingId === appointment.id || appointment.status === option}
                        onClick={() => updateStatus(appointment.id, option)}
                      >
                        {option}
                      </button>
                    ))}
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

export default DoctorAppointments
