import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

const NavBar = () => {
  const { isAuthenticated, logout, user } = useAuth();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  return (
    <nav className="navbar">
      <div className="navbar-brand">To-Do App</div>
      <div className="navbar-links">
        {isAuthenticated ? (
          <>
            <Link to="/dashboard">Dashboard</Link>
            <Link to="/tasks">Tasks</Link>
            <Link to="/tasks/new">Add Task</Link>
            {user?.role === 'admin' && (
              <div className="dropdown">
                <span>Admin</span>
                <div className="dropdown-content">
                  <Link to="/admin/dashboard">Dashboard</Link>
                  <Link to="/admin/users">Users</Link>
                  <Link to="/admin/tasks">Tasks</Link>
                </div>
              </div>
            )}
            <button type="button" className="link-button" onClick={handleLogout}>
              Logout
            </button>
          </>
        ) : (
          <>
            <Link to="/login">Login</Link>
            <Link to="/register">Register</Link>
            <Link to="/admin/login">Admin</Link>
          </>
        )}
      </div>
    </nav>
  );
};

export default NavBar;
