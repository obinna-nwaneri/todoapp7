import React, { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'

const RegisterPage: React.FC = () => {
  const navigate = useNavigate()
  const { register } = useAuth()
  const [form, setForm] = useState({ fullName: '', email: '', password: '' })
  const [error, setError] = useState<string | null>(null)

  const handleChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    setForm((prev) => ({ ...prev, [event.target.name]: event.target.value }))
  }

  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault()
    setError(null)
    try {
      await register(form)
      navigate('/dashboard')
    } catch (err) {
      setError('Could not register. Please try again.')
    }
  }

  return (
    <div className="flex min-h-screen items-center justify-center bg-slate-100">
      <div className="w-full max-w-md rounded-xl bg-white p-8 shadow-lg">
        <h1 className="mb-6 text-2xl font-semibold text-slate-900">Create your account</h1>
        <form className="space-y-4" onSubmit={handleSubmit}>
          <div>
            <label className="block text-sm font-medium text-slate-600">Full name</label>
            <input
              name="fullName"
              className="mt-1 w-full rounded border border-slate-200 px-3 py-2 focus:border-blue-500 focus:outline-none"
              value={form.fullName}
              onChange={handleChange}
              required
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-slate-600">Email</label>
            <input
              name="email"
              type="email"
              className="mt-1 w-full rounded border border-slate-200 px-3 py-2 focus:border-blue-500 focus:outline-none"
              value={form.email}
              onChange={handleChange}
              required
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-slate-600">Password</label>
            <input
              name="password"
              type="password"
              className="mt-1 w-full rounded border border-slate-200 px-3 py-2 focus:border-blue-500 focus:outline-none"
              value={form.password}
              onChange={handleChange}
              required
            />
          </div>
          {error && <p className="text-sm text-red-600">{error}</p>}
          <button
            type="submit"
            className="w-full rounded bg-blue-600 py-2 text-white transition hover:bg-blue-700"
          >
            Sign up
          </button>
        </form>
        <p className="mt-4 text-center text-sm text-slate-600">
          Already have an account?{' '}
          <Link className="text-blue-600" to="/login">
            Sign in
          </Link>
        </p>
      </div>
    </div>
  )
}

export default RegisterPage
