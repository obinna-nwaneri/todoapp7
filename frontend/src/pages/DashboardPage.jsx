import { useEffect, useState } from 'react';
import api from '../api.js';
import { useAuthHeaders } from '../hooks/useAuth.jsx';

const DashboardPage = () => {
  const headers = useAuthHeaders();
  const [count, setCount] = useState(null);
  const [error, setError] = useState('');

  useEffect(() => {
    const fetchContacts = async () => {
      try {
        const response = await api.get('/contacts', { headers });
        setCount(response.data.length);
      } catch (err) {
        setError('Failed to load contacts.');
      }
    };

    fetchContacts();
  }, [headers]);

  return (
    <section className="card">
      <h2>Dashboard</h2>
      {error ? <p className="error">{error}</p> : <p>Total contacts: {count ?? 'Loading...'}</p>}
    </section>
  );
};

export default DashboardPage;
