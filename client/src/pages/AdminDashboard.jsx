import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import axios from 'axios';
import { useAuth } from '../context/AuthContext';

const AdminDashboard = () => {
  const { token } = useAuth();
  const [summary, setSummary] = useState(null);
  const [error, setError] = useState('');

  useEffect(() => {
    const fetchSummary = async () => {
      try {
        const response = await axios.get('/api/admin/summary', {
          headers: {
            Authorization: `Bearer ${token}`
          }
        });
        setSummary(response.data);
      } catch (err) {
        setError(err.response?.data?.message || 'Unable to load admin dashboard');
      }
    };

    fetchSummary();
  }, [token]);

  return (
    <div className="card">
      <h2>Admin Dashboard</h2>
      {error && <div className="error">{error}</div>}
      {!summary && !error && <p>Loading summary...</p>}
      {summary && (
        <>
          <div className="admin-summary">
            <p><strong>Total Users:</strong> {summary.totalUsers}</p>
            <p><strong>Total Tasks:</strong> {summary.totalTasks}</p>
            <h3>Tasks by Status</h3>
            <ul>
              {summary.taskBreakdown.map((item) => (
                <li key={item.status}>
                  {item.status}: {item.count}
                </li>
              ))}
            </ul>
          </div>
          <nav className="admin-menu">
            <h3>Admin Menu</h3>
            <ul>
              <li>
                <Link to="/admin/tasks">Manage Tasks</Link>
              </li>
              <li>
                <Link to="/admin/users">Manage Users</Link>
              </li>
            </ul>
          </nav>
        </>
      )}
    </div>
  );
};

export default AdminDashboard;
