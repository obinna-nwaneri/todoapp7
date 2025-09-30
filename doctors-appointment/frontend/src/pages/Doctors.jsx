import { useState } from 'react'
import { Link } from 'react-router-dom'
import { useQuery } from '@tanstack/react-query'

import { listDoctors, listSpecialties } from '../api/doctors'

export default function Doctors() {
  const [filters, setFilters] = useState({ search: '', specialty: '' })

  const doctorsQuery = useQuery({
    queryKey: ['doctors', filters],
    queryFn: () => listDoctors(filters),
  })

  const specialtiesQuery = useQuery({
    queryKey: ['specialties'],
    queryFn: listSpecialties,
  })

  const handleChange = (event) => {
    const { name, value } = event.target
    setFilters((prev) => ({ ...prev, [name]: value }))
  }

  return (
    <div className="grid">
      <header>
        <h1>Browse Doctors</h1>
        <p style={{ color: '#475569' }}>Search for a specialist and book a consultation in minutes.</p>
      </header>
      <section className="card">
        <div style={{ display: 'flex', gap: '1rem', flexWrap: 'wrap' }}>
          <input
            name="search"
            placeholder="Search by name, clinic or specialty"
            value={filters.search}
            onChange={handleChange}
            style={{ flex: 1, minWidth: '200px' }}
          />
          <select name="specialty" value={filters.specialty} onChange={handleChange} style={{ minWidth: '200px' }}>
            <option value="">All Specialties</option>
            {specialtiesQuery.data?.results?.map((specialty) => (
              <option key={specialty.id} value={specialty.id}>
                {specialty.name}
              </option>
            ))}
          </select>
        </div>
      </section>
      <section className="grid" style={{ gap: '1.5rem' }}>
        {doctorsQuery.isLoading && <p>Loading doctors...</p>}
        {doctorsQuery.data?.results?.length ? (
          doctorsQuery.data.results.map((doctor) => (
            <article key={doctor.id} className="card" style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
              <h2 style={{ margin: 0 }}>
                Dr. {doctor.user.first_name} {doctor.user.last_name}
              </h2>
              <p style={{ margin: 0, color: '#475569' }}>{doctor.specialty.name}</p>
              <p style={{ flex: 1 }}>{doctor.about}</p>
              <p style={{ margin: '0.5rem 0', fontWeight: 600 }}>₦{Number(doctor.consultation_fee).toLocaleString()}</p>
              <Link to={`/doctors/${doctor.id}`} className="btn" style={{ alignSelf: 'flex-start' }}>
                View Profile
              </Link>
            </article>
          ))
        ) : (
          !doctorsQuery.isLoading && <p>No doctors found. Try adjusting your search.</p>
        )}
      </section>
    </div>
  )
}
