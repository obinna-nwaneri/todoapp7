import { useEffect, useMemo, useState } from 'react';
import { fetchContacts } from '../api/client.js';
import { useAuth } from '../context/AuthContext.jsx';

const Dashboard = () => {
  const { token } = useAuth();
  const [contacts, setContacts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    const loadContacts = async () => {
      try {
        setLoading(true);
        setError('');
        const data = await fetchContacts({ token });
        setContacts(data);
      } catch (err) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };
    loadContacts();
  }, [token]);

  const recentContacts = useMemo(() => contacts.slice(0, 5), [contacts]);

  return (
    <div>
      <h1>Dashboard</h1>
      {error && <div className="error">{error}</div>}
      <div className="card" style={{ marginBottom: '1.5rem' }}>
        <h2>Total Contacts</h2>
        <p style={{ fontSize: '2.5rem', margin: 0 }}>{contacts.length}</p>
        <p style={{ color: '#64748b' }}>Keep track of everyone in one place.</p>
      </div>
      <div className="card">
        <h2 style={{ marginTop: 0 }}>Recent Contacts</h2>
        {loading ? (
          <p>Loading...</p>
        ) : recentContacts.length === 0 ? (
          <p>No contacts yet. Add your first contact to get started.</p>
        ) : (
          <ul style={{ listStyle: 'none', padding: 0, margin: 0 }}>
            {recentContacts.map((contact) => (
              <li
                key={contact.id}
                style={{
                  display: 'flex',
                  justifyContent: 'space-between',
                  padding: '0.75rem 0',
                  borderBottom: '1px solid #e2e8f0'
                }}
              >
                <span>
                  <strong>{contact.name}</strong>
                  <br />
                  <small>{contact.email}</small>
                </span>
                <span style={{ color: '#64748b' }}>{new Date(contact.created_at).toLocaleDateString()}</span>
              </li>
            ))}
          </ul>
        )}
      </div>
    </div>
  );
};

export default Dashboard;
