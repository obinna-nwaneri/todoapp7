import { Navigate, Route, Routes, Link, useNavigate } from 'react-router-dom'
import { useAuth } from './hooks/useAuth'
import LoginForm from './components/LoginForm'
import RegisterForm from './components/RegisterForm'
import UserDashboard from './pages/UserDashboard'
import AdminDashboard from './pages/AdminDashboard'

function PrivateRoute({ children }) {
  const { isAuthenticated } = useAuth()
  return isAuthenticated ? children : <Navigate to="/login" replace />
}

function AdminRoute({ children }) {
  const { isAuthenticated, user } = useAuth()
  if (!isAuthenticated) return <Navigate to="/login" replace />
  if (user?.role !== 'admin') return <Navigate to="/dashboard" replace />
  return children
}

function Navigation() {
  const { isAuthenticated, user, logout } = useAuth()
  const navigate = useNavigate()

  const handleLogout = () => {
    logout()
    navigate('/login')
  }

  return (
    <header className="navbar">
      <div>
        <Link to="/dashboard">Enterprise Todo</Link>
      </div>
      <nav>
        {isAuthenticated ? (
          <>
            <span style={{ marginRight: '1rem', fontWeight: 600 }}>Hello, {user?.name}</span>
            {user?.role === 'admin' && (
              <Link to="/admin" style={{ marginRight: '1rem' }}>
                Admin
              </Link>
            )}
            <button className="secondary" onClick={handleLogout} type="button">
              Logout
            </button>
          </>
        ) : (
          <>
            <Link to="/login">Login</Link>
            <Link to="/register" style={{ marginLeft: '1rem' }}>
              Register
            </Link>
          </>
        )}
      </nav>
    </header>
  )
}

export default function App() {
  return (
    <div className="app-shell">
      <Navigation />
      <main className="main-content">
        <Routes>
          <Route path="/" element={<Navigate to="/login" replace />} />
          <Route path="/login" element={<LoginForm />} />
          <Route path="/register" element={<RegisterForm />} />
          <Route
            path="/dashboard"
            element={
              <PrivateRoute>
                <UserDashboard />
              </PrivateRoute>
            }
          />
          <Route
            path="/admin"
            element={
              <AdminRoute>
                <AdminDashboard />
              </AdminRoute>
            }
          />
          <Route path="*" element={<Navigate to="/dashboard" replace />} />
        </Routes>
      </main>
    </div>
  )
}
