import React, { useState } from 'react'
import { Link, useLocation, useNavigate } from 'react-router-dom'

import { useAuth } from '../context/AuthContext.jsx'

const roleRedirectMap = {
  ADMIN: '/admin-panel/dashboard',
  DOCTOR: '/doctor-panel/dashboard',
  PATIENT: '/patient-panel/dashboard',
}

const LoginPage = () => {
  const { login, loading } = useAuth()
  const [form, setForm] = useState({ email: '', password: '' })
  const [error, setError] = useState('')
  const navigate = useNavigate()
  const location = useLocation()

  const handleChange = (event) => {
    const { name, value } = event.target
    setForm((prev) => ({ ...prev, [name]: value }))
  }

  const handleSubmit = async (event) => {
    event.preventDefault()
    setError('')
    try {
      const profile = await login(form.email, form.password)
      if (!profile) {
        setError('Unable to log in with provided credentials.')
        return
      }
      const destination = roleRedirectMap[profile.role] || '/login'
      const from = location.state?.from?.pathname
      navigate(from || destination, { replace: true })
    } catch (err) {
      setError('Invalid login credentials. Please try again.')
    }
  }

  return (
    <div style={{ maxWidth: '420px', margin: '4rem auto', background: 'white', padding: '2rem', borderRadius: '8px' }}>
      <h2>Log In</h2>
      {error && <div className="alert">{error}</div>}
      <form onSubmit={handleSubmit}>
        <label>
          Email
          <input type="email" name="email" value={form.email} onChange={handleChange} required />
        </label>
        <label>
          Password
          <input type="password" name="password" value={form.password} onChange={handleChange} required />
        </label>
        <button className="primary" type="submit" disabled={loading}>
          {loading ? 'Signing in...' : 'Sign In'}
        </button>
      </form>
      <p>
        Doctor? <Link to="/register-doctor">Register here</Link>
      </p>
      <p>
        Patient? <Link to="/register-patient">Register here</Link>
      </p>
    </div>
  )
}

export default LoginPage
