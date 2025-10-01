import { Navigate, Route, Routes, useLocation } from 'react-router-dom'
import AppNavbar from './components/AppNavbar'
import LoginPage from './pages/LoginPage'
import RegisterPage from './pages/RegisterPage'
import UserDashboard from './pages/UserDashboard'
import AdminDashboard from './pages/AdminDashboard'
import NotFound from './pages/NotFound'
import { useAuth } from './context/AuthContext'

const ProtectedRoute = ({ children, requireAdmin = false }) => {
  const { isAuthenticated, isAdmin } = useAuth()
  const location = useLocation()

  if (!isAuthenticated) {
    return <Navigate to="/login" replace state={{ from: location }} />
  }

  if (requireAdmin && !isAdmin) {
    return <Navigate to="/dashboard" replace />
  }

  return children
}

const App = () => {
  const { isAuthenticated, isAdmin } = useAuth()
  const defaultPath = isAuthenticated ? (isAdmin ? '/admin' : '/dashboard') : '/login'

  return (
    <div className="min-vh-100 bg-body-secondary">
      <AppNavbar />
      <Routes>
        <Route path="/" element={<Navigate to={defaultPath} replace />} />
        <Route
          path="/login"
          element={isAuthenticated ? <Navigate to={defaultPath} replace /> : <LoginPage />}
        />
        <Route
          path="/register"
          element={isAuthenticated ? <Navigate to={defaultPath} replace /> : <RegisterPage />}
        />
        <Route
          path="/dashboard"
          element={
            <ProtectedRoute>
              <UserDashboard />
            </ProtectedRoute>
          }
        />
        <Route
          path="/admin"
          element={
            <ProtectedRoute requireAdmin>
              <AdminDashboard />
            </ProtectedRoute>
          }
        />
        <Route path="*" element={<NotFound />} />
      </Routes>
    </div>
  )
}

export default App
