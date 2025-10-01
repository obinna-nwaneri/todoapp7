import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext.jsx';

const Navbar = () => {
  const { auth, logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate('/');
  };

  return (
    <header>
      <nav>
        <strong>Doctor Appointment System</strong>
        <div style={{ flex: 1 }} />
        {!auth && (
          <>
            <Link to="/">Login</Link>
            <Link to="/register">Patient Sign Up</Link>
          </>
        )}
        {auth && auth.role === 'patient' && <Link to="/patient">My Appointments</Link>}
        {auth && auth.role === 'doctor' && <Link to="/doctor">Doctor Dashboard</Link>}
        {auth && auth.role === 'admin' && <Link to="/admin">Admin Dashboard</Link>}
        {auth && (
          <button className="link-button" onClick={handleLogout}>
            Logout
          </button>
        )}
      </nav>
    </header>
  );
};

export default Navbar;
