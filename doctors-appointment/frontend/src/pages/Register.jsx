import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useMutation } from '@tanstack/react-query'

import { useAuth } from '../auth/AuthContext'

export default function Register() {
  const navigate = useNavigate()
  const { register } = useAuth()
  const [form, setForm] = useState({
    first_name: '',
    last_name: '',
    email: '',
    username: '',
    password: '',
    phone: '',
  })
  const [error, setError] = useState('')
  const [success, setSuccess] = useState('')

  const mutation = useMutation({
    mutationFn: register,
    onSuccess: () => {
      setSuccess('Account created! You can now login.')
      setTimeout(() => navigate('/login'), 1200)
    },
    onError: (err) => {
      setError(err.response?.data?.detail ?? 'Registration failed.')
    },
  })

  const handleChange = (event) => {
    const { name, value } = event.target
    setForm((prev) => ({ ...prev, [name]: value }))
  }

  const handleSubmit = (event) => {
    event.preventDefault()
    setError('')
    setSuccess('')
    mutation.mutate(form)
  }

  return (
    <div className="card" style={{ maxWidth: 520, margin: '2rem auto' }}>
      <h2>Register</h2>
      <form onSubmit={handleSubmit}>
        <div style={{ display: 'flex', gap: '1rem' }}>
          <div style={{ flex: 1 }}>
            <label htmlFor="first_name">First Name</label>
            <input id="first_name" name="first_name" value={form.first_name} onChange={handleChange} />
          </div>
          <div style={{ flex: 1 }}>
            <label htmlFor="last_name">Last Name</label>
            <input id="last_name" name="last_name" value={form.last_name} onChange={handleChange} />
          </div>
        </div>
        <label htmlFor="email">Email</label>
        <input id="email" name="email" type="email" value={form.email} onChange={handleChange} />
        <label htmlFor="phone">Phone</label>
        <input id="phone" name="phone" value={form.phone} onChange={handleChange} required />
        <label htmlFor="username">Username</label>
        <input id="username" name="username" value={form.username} onChange={handleChange} required />
        <label htmlFor="password">Password</label>
        <input id="password" name="password" type="password" value={form.password} onChange={handleChange} required />
        {error && <p style={{ color: '#dc2626' }}>{error}</p>}
        {success && <p style={{ color: '#16a34a' }}>{success}</p>}
        <button className="btn" type="submit" disabled={mutation.isLoading}>
          {mutation.isLoading ? 'Submitting...' : 'Create Account'}
        </button>
      </form>
    </div>
  )
}
