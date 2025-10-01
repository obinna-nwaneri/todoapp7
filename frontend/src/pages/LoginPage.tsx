import React, { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'

const LoginPage: React.FC = () => {
  const navigate = useNavigate()
  const { login } = useAuth()
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState<string | null>(null)

  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault()
    setError(null)
    try {
      await login(email, password)
      navigate('/dashboard')
    } catch (err) {
      setError('Invalid credentials')
    }
  }

  return (
    <div className="flex min-h-screen items-center justify-center bg-slate-100">
      <div className="w-full max-w-md rounded-xl bg-white p-8 shadow-lg">
        <h1 className="mb-6 text-2xl font-semibold text-slate-900">Enterprise Todo Login</h1>
        <form className="space-y-4" onSubmit={handleSubmit}>
          <div>
            <label className="block text-sm font-medium text-slate-600">Email</label>
            <input
              className="mt-1 w-full rounded border border-slate-200 px-3 py-2 focus:border-blue-500 focus:outline-none"
              type="email"
              value={email}
              onChange={(event) => setEmail(event.target.value)}
              required
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-slate-600">Password</label>
            <input
              className="mt-1 w-full rounded border border-slate-200 px-3 py-2 focus:border-blue-500 focus:outline-none"
              type="password"
              value={password}
              onChange={(event) => setPassword(event.target.value)}
              required
            />
          </div>
          {error && <p className="text-sm text-red-600">{error}</p>}
          <button
            type="submit"
            className="w-full rounded bg-blue-600 py-2 text-white transition hover:bg-blue-700"
          >
            Sign in
          </button>
        </form>
        <p className="mt-4 text-center text-sm text-slate-600">
          No account yet?{' '}
          <Link className="text-blue-600" to="/register">
            Create one
          </Link>
        </p>
        <div className="mt-4 rounded bg-slate-50 p-4 text-xs text-slate-600">
          <p className="font-semibold">Sample Accounts</p>
          <ul className="mt-2 space-y-1">
            <li>Admin: admin@example.com / Admin123!</li>
            <li>User: user@example.com / User123!</li>
            <li>Team Lead: lead@example.com / Lead123!</li>
          </ul>
        </div>
      </div>
    </div>
  )
}

export default LoginPage
