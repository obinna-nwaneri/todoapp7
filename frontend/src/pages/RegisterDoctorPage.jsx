import React, { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'

import { useAuth } from '../context/AuthContext.jsx'

const RegisterDoctorPage = () => {
  const { registerDoctor } = useAuth()
  const [form, setForm] = useState({
    email: '',
    password: '',
    name: '',
    specialization: '',
    years_of_experience: 0,
  })
  const [message, setMessage] = useState('')
  const [error, setError] = useState('')
  const navigate = useNavigate()

  const handleChange = (event) => {
    const { name, value } = event.target
    setForm((prev) => ({ ...prev, [name]: value }))
  }

  const handleSubmit = async (event) => {
    event.preventDefault()
    setError('')
    try {
      await registerDoctor({
        email: form.email,
        password: form.password,
        name: form.name,
        specialization: form.specialization,
        years_of_experience: Number(form.years_of_experience),
      })
      setMessage('Registration successful! You can now log in.')
      setTimeout(() => navigate('/login'), 1500)
    } catch (err) {
      setError('Registration failed. Please verify the information and try again.')
    }
  }

  return (
    <div style={{ maxWidth: '480px', margin: '3rem auto', background: 'white', padding: '2rem', borderRadius: '8px' }}>
      <h2>Doctor Registration</h2>
      {message && <div className="alert">{message}</div>}
      {error && <div className="alert">{error}</div>}
      <form onSubmit={handleSubmit}>
        <label>
          Email
          <input type="email" name="email" value={form.email} onChange={handleChange} required />
        </label>
        <label>
          Password
          <input type="password" name="password" value={form.password} onChange={handleChange} required minLength={8} />
        </label>
        <label>
          Full Name
          <input type="text" name="name" value={form.name} onChange={handleChange} required />
        </label>
        <label>
          Specialization
          <input type="text" name="specialization" value={form.specialization} onChange={handleChange} required />
        </label>
        <label>
          Years of Experience
          <input type="number" name="years_of_experience" value={form.years_of_experience} onChange={handleChange} min={0} required />
        </label>
        <button className="primary" type="submit">
          Register as Doctor
        </button>
      </form>
      <p>
        Already have an account? <Link to="/login">Log in</Link>
      </p>
    </div>
  )
}

export default RegisterDoctorPage
