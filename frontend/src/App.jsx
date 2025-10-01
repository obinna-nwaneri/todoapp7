import { Routes, Route, Navigate, Link } from 'react-router-dom';
import LoginPage from './pages/LoginPage.jsx';
import RegisterPage from './pages/RegisterPage.jsx';
import DashboardPage from './pages/DashboardPage.jsx';
import { useAuth } from './context/AuthContext.jsx';

const ProtectedRoute = ({ children }) => {
  const { user } = useAuth();
  if (!user) {
    return <Navigate to="/login" replace />;
  }
  return children;
};

export default function App() {
  const { user, logout } = useAuth();

  return (
    <div className="app-container">
      <header className="app-header">
        <h1>Enterprise Todo</h1>
        <nav>
          {!user && (
            <>
              <Link to="/login">Login</Link>
              <Link to="/register">Register</Link>
            </>
          )}
          {user && (
            <>
              <Link to="/dashboard">Dashboard</Link>
              {user.role === 'admin' && (
                <a href="/admin" target="_blank" rel="noreferrer">Admin Panel</a>
              )}
              <button type="button" onClick={logout} className="link-button">Logout</button>
            </>
          )}
        </nav>
      </header>
      <main>
        <Routes>
          <Route path="/" element={<Navigate to="/dashboard" replace />} />
          <Route path="/login" element={<LoginPage />} />
          <Route path="/register" element={<RegisterPage />} />
          <Route
            path="/dashboard"
            element={(
              <ProtectedRoute>
                <DashboardPage />
              </ProtectedRoute>
            )}
          />
        </Routes>
      </main>
    </div>
  );
}
