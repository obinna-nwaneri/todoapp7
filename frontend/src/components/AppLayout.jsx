import { Link, Outlet, useLocation } from 'react-router-dom';
import { ADMIN_PANEL_URL } from '../utils.js';
import { useAuth } from '../context/AuthContext.jsx';

const AppLayout = () => {
  const { user, logout, token } = useAuth();
  const location = useLocation();

  const handleLogout = () => {
    logout();
  };

  return (
    <div className="app-shell">
      <header className="app-header">
        <div className="branding">Enterprise Todo</div>
        <nav className="nav-links">
          {token ? (
            <>
              <Link className={location.pathname === '/todos' ? 'active' : ''} to="/todos">
                My Todos
              </Link>
              {user?.isAdmin && (
                <Link className={location.pathname === '/admin' ? 'active' : ''} to="/admin">
                  Admin Panel
                </Link>
              )}
              <span className="user-pill">{user?.email}</span>
              <button type="button" className="secondary" onClick={handleLogout}>
                Log out
              </button>
            </>
          ) : (
            <>
              <Link to="/login">Login</Link>
              <Link to="/register">Register</Link>
            </>
          )}
        </nav>
      </header>
      <main className="app-main">
        <Outlet />
      </main>
      {user?.isAdmin && (
        <footer className="app-footer">
          Admins can also open the panel directly at{' '}
          <a href={ADMIN_PANEL_URL} target="_blank" rel="noreferrer">
            {ADMIN_PANEL_URL}
          </a>
        </footer>
      )}
    </div>
  );
};

export default AppLayout;
