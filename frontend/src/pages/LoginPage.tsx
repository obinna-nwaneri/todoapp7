import type { FormEvent } from 'react'
import { useState } from 'react'
import { useNavigate, Link } from 'react-router-dom'
import Layout from '../components/Layout'
import { useAuth } from '../hooks/useAuth'

const LoginPage = () => {
  const { login } = useAuth()
  const navigate = useNavigate()
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState<string | null>(null)
  const [loading, setLoading] = useState(false)

  const handleSubmit = async (event: FormEvent) => {
    event.preventDefault()
    setError(null)
    setLoading(true)
    try {
      await login(email, password)
      navigate('/dashboard')
    } catch (err) {
      setError('Invalid credentials. Try again or contact support.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <Layout title="Welcome back">
      <form className="form" onSubmit={handleSubmit}>
        <label>
          Email address
          <input type="email" value={email} onChange={(event) => setEmail(event.target.value)} required />
        </label>
        <label>
          Password
          <input
            type="password"
            value={password}
            onChange={(event) => setPassword(event.target.value)}
            required
          />
        </label>
        {error && <p className="form-error">{error}</p>}
        <button type="submit" className="btn-primary" disabled={loading}>
          {loading ? 'Signing in…' : 'Sign in'}
        </button>
        <p className="form-helper">
          Need an account? <Link to="/register/patient">Create a patient profile</Link>
        </p>
      </form>
      <div className="hint-card">
        <h3>Sample credentials</h3>
        <ul>
          <li>Admin: admin@healthplus.test / Admin@123</li>
          <li>Doctor: dr.smith@healthplus.test / Doctor@123</li>
          <li>Patient: john.doe@healthplus.test / Patient@123</li>
        </ul>
      </div>
    </Layout>
  )
}

export default LoginPage
