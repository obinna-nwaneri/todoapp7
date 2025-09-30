import { useEffect, useState } from 'react';
import axios from 'axios';
import { useAuth } from '../context/AuthContext';

const Dashboard = () => {
  const { token, user } = useAuth();
  const [summary, setSummary] = useState({ Pending: 0, 'In Progress': 0, Completed: 0 });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    const fetchSummary = async () => {
      try {
        const response = await axios.get('/api/tasks', {
          headers: {
            Authorization: `Bearer ${token}`
          }
        });
        const counts = response.data.reduce(
          (acc, task) => {
            acc[task.status] = (acc[task.status] || 0) + 1;
            return acc;
          },
          { Pending: 0, 'In Progress': 0, Completed: 0 }
        );
        setSummary(counts);
      } catch (err) {
        setError(err.response?.data?.message || 'Failed to load dashboard');
      } finally {
        setLoading(false);
      }
    };

    fetchSummary();
  }, [token]);

  return (
    <div className="card">
      <h2>Welcome back, {user?.username}</h2>
      {loading && <p>Loading dashboard...</p>}
      {error && <div className="error">{error}</div>}
      {!loading && !error && (
        <div className="dashboard-grid">
          <div className="flex-between">
            <h3>Pending</h3>
            <span className="status-pill status-pending">{summary['Pending']}</span>
          </div>
          <div className="flex-between">
            <h3>In Progress</h3>
            <span className="status-pill status-in-progress">{summary['In Progress']}</span>
          </div>
          <div className="flex-between">
            <h3>Completed</h3>
            <span className="status-pill status-completed">{summary['Completed']}</span>
          </div>
        </div>
      )}
    </div>
  );
};

export default Dashboard;
