import React, { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'

import { useAuth } from '../context/AuthContext.jsx'

const RegisterPatientPage = () => {
  const { registerPatient } = useAuth()
  const [form, setForm] = useState({
    email: '',
    password: '',
    name: '',
    age: 0,
    gender: '',
    contact_info: '',
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
      await registerPatient({
        email: form.email,
        password: form.password,
        name: form.name,
        age: Number(form.age),
        gender: form.gender,
        contact_info: form.contact_info ? { note: form.contact_info } : {},
      })
      setMessage('Registration successful! Please log in to continue.')
      setTimeout(() => navigate('/login'), 1500)
    } catch (err) {
      setError('Registration failed. Please check the information and try again.')
    }
  }

  return (
    <div style={{ maxWidth: '480px', margin: '3rem auto', background: 'white', padding: '2rem', borderRadius: '8px' }}>
      <h2>Patient Registration</h2>
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
          Age
          <input type="number" name="age" value={form.age} onChange={handleChange} min={0} required />
        </label>
        <label>
          Gender
          <input type="text" name="gender" value={form.gender} onChange={handleChange} required />
        </label>
        <label>
          Contact Info
          <textarea name="contact_info" value={form.contact_info} onChange={handleChange} placeholder="Provide phone or notes" />
        </label>
        <button className="primary" type="submit">
          Register as Patient
        </button>
      </form>
      <p>
        Already have an account? <Link to="/login">Log in</Link>
      </p>
    </div>
  )
}

export default RegisterPatientPage
