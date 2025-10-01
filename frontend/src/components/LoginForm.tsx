import { FormEvent, useState } from 'react'

interface LoginFormProps {
  onSubmit: (email: string, password: string) => Promise<void>
  loading: boolean
  error?: string | null
}

export function LoginForm({ onSubmit, loading, error }: LoginFormProps) {
  const [email, setEmail] = useState('admin@enterprise.todo')
  const [password, setPassword] = useState('Admin@123')

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault()
    await onSubmit(email, password)
  }

  return (
    <div className="page-container" style={{ display: 'grid', placeItems: 'center', minHeight: '100vh' }}>
      <div className="card" style={{ width: '100%', maxWidth: 420, padding: '2.25rem' }}>
        <div style={{ display: 'grid', gap: '1.5rem' }}>
          <div>
            <div className="badge" style={{ background: 'rgba(79, 70, 229, 0.12)', color: '#312e81' }}>
              Enterprise Todo Platform
            </div>
            <h1 style={{ margin: '1rem 0 0.5rem', fontSize: '1.75rem', color: '#0f172a' }}>Welcome back</h1>
            <p className="text-muted" style={{ margin: 0 }}>
              Sign in with your admin credentials to manage enterprise tasks.
            </p>
          </div>

          <form onSubmit={handleSubmit} style={{ display: 'grid', gap: '1rem' }}>
            <div className="field">
              <label htmlFor="email">Work email</label>
              <input
                id="email"
                type="email"
                value={email}
                onChange={(event) => setEmail(event.target.value)}
                placeholder="you@company.com"
                required
              />
            </div>
            <div className="field">
              <label htmlFor="password">Password</label>
              <input
                id="password"
                type="password"
                value={password}
                onChange={(event) => setPassword(event.target.value)}
                placeholder="Enter your password"
                required
              />
            </div>

            {error && (
              <div className="card muted-card" style={{ padding: '0.75rem', color: '#b91c1c' }}>
                {error}
              </div>
            )}

            <button className="button primary" type="submit" disabled={loading}>
              {loading ? 'Signing in…' : 'Access Console'}
            </button>
          </form>
        </div>
      </div>
    </div>
  )
}
