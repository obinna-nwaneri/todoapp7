import { Link, NavLink } from 'react-router-dom'
import { useAuth } from '../hooks/useAuth'

interface LayoutProps {
  title?: string
  children: React.ReactNode
}

const Layout = ({ title, children }: LayoutProps) => {
  const { user, logout } = useAuth()

  return (
    <div className="app-shell">
      <header className="app-header">
        <div className="app-header__inner">
          <Link to="/" className="app-logo">
            HealthPlus Appointments
          </Link>
          <nav className="app-nav">
            {user && (
              <>
                <NavLink to="/dashboard" className={({ isActive }) => (isActive ? 'active' : undefined)}>
                  Dashboard
                </NavLink>
                {user.role === 'patient' && (
                  <NavLink to="/doctors" className={({ isActive }) => (isActive ? 'active' : undefined)}>
                    Find Doctors
                  </NavLink>
                )}
                <NavLink to="/appointments" className={({ isActive }) => (isActive ? 'active' : undefined)}>
                  Appointments
                </NavLink>
                {user.role === 'admin' && (
                  <NavLink to="/admin" className={({ isActive }) => (isActive ? 'active' : undefined)}>
                    Admin Panel
                  </NavLink>
                )}
                <button
                  onClick={logout}
                  className="logout-btn"
                >
                  Logout
                </button>
              </>
            )}
            {!user && (
              <>
                <NavLink to="/login">Login</NavLink>
                <NavLink to="/register/patient">Register</NavLink>
              </>
            )}
          </nav>
        </div>
      </header>
      <main className="app-main">
        {title && <h1 className="page-title">{title}</h1>}
        <div className="card">{children}</div>
      </main>
    </div>
  )
}

export default Layout
