import type { FormEvent } from 'react'
import { useState } from 'react'
import Layout from '../components/Layout'
import { useAuth } from '../hooks/useAuth'
import { useNavigate } from 'react-router-dom'

const defaultAvailability = [
  { dayOfWeek: 'monday', startTime: '09:00', endTime: '12:00' },
  { dayOfWeek: 'wednesday', startTime: '13:00', endTime: '17:00' },
]

const DoctorRegisterPage = () => {
  const { registerDoctor } = useAuth()
  const navigate = useNavigate()
  const [form, setForm] = useState({
    name: '',
    email: '',
    password: '',
    phone: '',
    specialty: '',
    location: '',
    yearsExperience: 5,
    consultationFee: 100,
    bio: '',
    consultationModes: ['physical', 'virtual'] as Array<'physical' | 'virtual'>,
  })
  const [error, setError] = useState<string | null>(null)
  const [loading, setLoading] = useState(false)

  const handleSubmit = async (event: FormEvent) => {
    event.preventDefault()
    setError(null)
    setLoading(true)
    try {
      await registerDoctor({
        ...form,
        phone: form.phone || undefined,
        location: form.location || undefined,
        bio: form.bio || undefined,
        availability: defaultAvailability,
      })
      navigate('/dashboard')
    } catch (err) {
      setError('Unable to submit registration. Please verify your details.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <Layout title="Join as a doctor">
      <form className="form" onSubmit={handleSubmit}>
        <label>
          Full name
          <input name="name" value={form.name} onChange={(event) => setForm({ ...form, name: event.target.value })} required />
        </label>
        <label>
          Email address
          <input
            type="email"
            name="email"
            value={form.email}
            onChange={(event) => setForm({ ...form, email: event.target.value })}
            required
          />
        </label>
        <label>
          Password
          <input
            type="password"
            name="password"
            value={form.password}
            onChange={(event) => setForm({ ...form, password: event.target.value })}
            required
          />
        </label>
        <label>
          Phone number
          <input name="phone" value={form.phone} onChange={(event) => setForm({ ...form, phone: event.target.value })} />
        </label>
        <label>
          Specialty
          <input
            name="specialty"
            value={form.specialty}
            onChange={(event) => setForm({ ...form, specialty: event.target.value })}
            required
          />
        </label>
        <label>
          Primary location
          <input
            name="location"
            value={form.location}
            onChange={(event) => setForm({ ...form, location: event.target.value })}
          />
        </label>
        <div className="form-row">
          <label>
            Years of experience
            <input
              type="number"
              min={0}
              name="yearsExperience"
              value={form.yearsExperience}
              onChange={(event) => setForm({ ...form, yearsExperience: Number(event.target.value) })}
            />
          </label>
          <label>
            Consultation fee ($)
            <input
              type="number"
              min={0}
              name="consultationFee"
              value={form.consultationFee}
              onChange={(event) => setForm({ ...form, consultationFee: Number(event.target.value) })}
            />
          </label>
        </div>
        <label>
          Bio / introduction
          <textarea
            name="bio"
            value={form.bio}
            onChange={(event) => setForm({ ...form, bio: event.target.value })}
            rows={4}
          />
        </label>
        {error && <p className="form-error">{error}</p>}
        <button type="submit" className="btn-primary" disabled={loading}>
          {loading ? 'Submitting…' : 'Submit for review'}
        </button>
      </form>
      <div className="hint-card">
        <h3>Default availability</h3>
        <p>
          New doctor accounts include example availability slots (Monday mornings and Wednesday afternoons). Update
          your schedule anytime from the doctor dashboard after logging in.
        </p>
      </div>
    </Layout>
  )
}

export default DoctorRegisterPage
