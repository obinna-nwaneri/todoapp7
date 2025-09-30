import { Link, Outlet, useNavigate } from 'react-router-dom'

import { useAuth } from '../auth/AuthContext'
import ProtectedNav from './ProtectedNav'

export default function Layout() {
  const navigate = useNavigate()
  const { isAuthenticated, user, logout, role } = useAuth()

  const handleLogout = () => {
    logout()
    navigate('/login')
  }

  return (
    <div>
      <header className="navbar">
        <div className="container" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: '1rem' }}>
          <Link to="/" style={{ fontSize: '1.1rem', fontWeight: 700 }}>MedBookr</Link>
          <nav className="navbar-links">
            <ProtectedNav role={role} />
            {!isAuthenticated ? (
              <>
                <Link to="/login">Login</Link>
                <Link to="/register">Register</Link>
              </>
            ) : (
              <button className="btn" style={{ padding: '0.5rem 1rem' }} onClick={handleLogout}>
                Logout {user?.first_name}
              </button>
            )}
          </nav>
        </div>
      </header>
      <main className="container">
        <Outlet />
      </main>
    </div>
  )
}
