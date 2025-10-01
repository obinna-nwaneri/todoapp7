import { useEffect, useState } from 'react'

import { fetchCurrentUser, login as loginRequest } from './api/client'
import { Dashboard } from './components/Dashboard'
import { LoginForm } from './components/LoginForm'
import type { UserSummary } from './types'

const TOKEN_STORAGE_KEY = 'enterprise_todo_token'

function App() {
  const [token, setToken] = useState<string | null>(() => localStorage.getItem(TOKEN_STORAGE_KEY))
  const [currentUser, setCurrentUser] = useState<UserSummary | null>(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [bootstrapping, setBootstrapping] = useState(true)

  useEffect(() => {
    const bootstrap = async () => {
      if (!token) {
        setBootstrapping(false)
        return
      }

      try {
        const user = await fetchCurrentUser(token)
        setCurrentUser(user)
      } catch (requestError) {
        console.warn('Unable to restore session', requestError)
        localStorage.removeItem(TOKEN_STORAGE_KEY)
        setToken(null)
      } finally {
        setBootstrapping(false)
      }
    }

    void bootstrap()
  }, [token])

  const handleLogin = async (email: string, password: string) => {
    setLoading(true)
    setError(null)
    try {
      const response = await loginRequest(email, password)
      localStorage.setItem(TOKEN_STORAGE_KEY, response.token)
      setToken(response.token)
      setCurrentUser(response.user)
    } catch (requestError) {
      if (requestError instanceof Error) {
        setError(requestError.message)
      } else {
        setError('Unable to login. Please try again later.')
      }
    } finally {
      setLoading(false)
    }
  }

  const handleLoggedOut = () => {
    localStorage.removeItem(TOKEN_STORAGE_KEY)
    setToken(null)
    setCurrentUser(null)
  }

  if (bootstrapping) {
    return (
      <div className="page-container" style={{ display: 'grid', placeItems: 'center', minHeight: '100vh' }}>
        <div className="card" style={{ padding: '2rem', textAlign: 'center' }}>
          <div className="badge" style={{ marginBottom: '1rem', background: 'rgba(79,70,229,0.12)', color: '#312e81' }}>
            Enterprise Todo Platform
          </div>
          <strong>Preparing your workspace…</strong>
        </div>
      </div>
    )
  }

  if (!token || !currentUser) {
    return <LoginForm onSubmit={handleLogin} loading={loading} error={error} />
  }

  return <Dashboard token={token} currentUser={currentUser} onLoggedOut={handleLoggedOut} />
}

export default App
