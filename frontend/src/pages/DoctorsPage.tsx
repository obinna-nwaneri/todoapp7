import type { FormEvent } from 'react'
import { useState } from 'react'
import { useQuery } from '@tanstack/react-query'
import Layout from '../components/Layout'
import DataTable from '../components/DataTable'
import api from '../api/client'
import { useAuth, useAuthGuard } from '../hooks/useAuth'

const DoctorsPage = () => {
  useAuthGuard()
  const { user } = useAuth()
  const [filters, setFilters] = useState({ specialty: '', location: '', type: '' })

  const doctorsQuery = useQuery({
    queryKey: ['doctors', filters],
    queryFn: async () => {
      const { data } = await api.get('/doctors', {
        params: {
          specialty: filters.specialty || undefined,
          location: filters.location || undefined,
          type: filters.type || undefined,
        },
      })
      return data.data
    },
  })

  const handleSubmit = (event: FormEvent) => {
    event.preventDefault()
    doctorsQuery.refetch()
  }

  if (!user) {
    return null
  }

  return (
    <Layout title="Find doctors">
      <form className="filter-row" onSubmit={handleSubmit}>
        <label>
          Specialty
          <input
            value={filters.specialty}
            onChange={(event) => setFilters((prev) => ({ ...prev, specialty: event.target.value }))}
            placeholder="Cardiology, pediatrics…"
          />
        </label>
        <label>
          Location
          <input
            value={filters.location}
            onChange={(event) => setFilters((prev) => ({ ...prev, location: event.target.value }))}
            placeholder="City, clinic, or virtual"
          />
        </label>
        <label>
          Consultation type
          <select value={filters.type} onChange={(event) => setFilters((prev) => ({ ...prev, type: event.target.value }))}>
            <option value="">Any</option>
            <option value="physical">In-person</option>
            <option value="virtual">Virtual</option>
          </select>
        </label>
        <button type="submit" className="btn-secondary">
          Apply filters
        </button>
      </form>
      {doctorsQuery.isLoading && <p>Searching doctors…</p>}
      {doctorsQuery.error && <p className="form-error">Unable to fetch doctors.</p>}
      <DataTable
        data={doctorsQuery.data ?? []}
        columns={[
          { header: 'Name', key: 'user', render: (row: any) => row.user?.name ?? 'Unknown' },
          { header: 'Specialty', key: 'specialty' },
          { header: 'Experience', key: 'yearsExperience', render: (row: any) => `${row.yearsExperience} years` },
          { header: 'Fee', key: 'consultationFee', render: (row: any) => `$${row.consultationFee}` },
          { header: 'Location', key: 'location' },
        ]}
        emptyMessage="No doctors match the filters yet."
      />
    </Layout>
  )
}

export default DoctorsPage
