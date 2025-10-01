import type { FormEvent } from 'react'
import { useState } from 'react'
import Layout from '../components/Layout'
import { useAuth } from '../hooks/useAuth'
import { useNavigate } from 'react-router-dom'

const PatientRegisterPage = () => {
  const { registerPatient } = useAuth()
  const navigate = useNavigate()
  const [form, setForm] = useState({
    name: '',
    email: '',
    password: '',
    phone: '',
    gender: '',
    dateOfBirth: '',
  })
  const [error, setError] = useState<string | null>(null)
  const [loading, setLoading] = useState(false)

  const handleChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    setForm((prev) => ({ ...prev, [event.target.name]: event.target.value }))
  }

  const handleSubmit = async (event: FormEvent) => {
    event.preventDefault()
    setError(null)
    setLoading(true)
    try {
      await registerPatient({
        ...form,
        dateOfBirth: form.dateOfBirth || undefined,
        phone: form.phone || undefined,
        gender: form.gender || undefined,
      })
      navigate('/dashboard')
    } catch (err) {
      setError('Unable to create account. Please review your details.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <Layout title="Create a patient account">
      <form className="form" onSubmit={handleSubmit}>
        <label>
          Full name
          <input name="name" value={form.name} onChange={handleChange} required />
        </label>
        <label>
          Email address
          <input type="email" name="email" value={form.email} onChange={handleChange} required />
        </label>
        <label>
          Password
          <input type="password" name="password" value={form.password} onChange={handleChange} required />
        </label>
        <label>
          Phone number
          <input name="phone" value={form.phone} onChange={handleChange} placeholder="Optional" />
        </label>
        <label>
          Gender
          <input name="gender" value={form.gender} onChange={handleChange} placeholder="Optional" />
        </label>
        <label>
          Date of birth
          <input type="date" name="dateOfBirth" value={form.dateOfBirth} onChange={handleChange} />
        </label>
        {error && <p className="form-error">{error}</p>}
        <button type="submit" className="btn-primary" disabled={loading}>
          {loading ? 'Creating account…' : 'Create account'}
        </button>
      </form>
    </Layout>
  )
}

export default PatientRegisterPage
