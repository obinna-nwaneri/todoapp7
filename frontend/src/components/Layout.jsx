import { NavLink, Outlet, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext.jsx';

const navLinkClass = ({ isActive }) => (isActive ? 'active' : undefined);

const Layout = () => {
  const { logout, user } = useAuth();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  return (
    <div>
      <header>
        <nav>
          <div>
            <strong>Contact Manager</strong>
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
            <NavLink to="/" end className={navLinkClass}>
              Dashboard
            </NavLink>
            <NavLink to="/contacts" className={navLinkClass}>
              Contacts
            </NavLink>
            <span className="badge">{user?.username}</span>
            <button className="btn btn-secondary" onClick={handleLogout}>
              Logout
            </button>
          </div>
        </nav>
      </header>
      <main className="container">
        <Outlet />
      </main>
    </div>
  );
};

export default Layout;
