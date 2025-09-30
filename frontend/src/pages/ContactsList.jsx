import { useCallback, useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { deleteContact, fetchContacts } from '../api/client.js';
import { useAuth } from '../context/AuthContext.jsx';

const ContactsList = () => {
  const { token } = useAuth();
  const navigate = useNavigate();
  const [contacts, setContacts] = useState([]);
  const [search, setSearch] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const loadContacts = useCallback(
    async (searchValue = '') => {
      try {
        setLoading(true);
        setError('');
        const data = await fetchContacts({ token, search: searchValue });
        setContacts(data);
      } catch (err) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    },
    [token]
  );

  useEffect(() => {
    loadContacts();
  }, [loadContacts]);

  const handleSearchChange = (event) => {
    const value = event.target.value;
    setSearch(value);
    loadContacts(value);
  };

  const handleDelete = async (id) => {
    const confirmed = window.confirm('Are you sure you want to delete this contact?');
    if (!confirmed) return;
    try {
      setError('');
      await deleteContact({ token, id });
      setContacts((prev) => prev.filter((contact) => contact.id !== id));
    } catch (err) {
      setError(err.message);
    }
  };

  return (
    <div>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <h1>Contacts</h1>
        <button className="btn btn-primary" onClick={() => navigate('/contacts/new')}>
          Add Contact
        </button>
      </div>
      <div className="card" style={{ marginBottom: '1rem' }}>
        <input
          className="form-control"
          placeholder="Search by name, email, phone, or address"
          value={search}
          onChange={handleSearchChange}
        />
      </div>
      {error && <div className="error">{error}</div>}
      <div className="card">
        {loading ? (
          <p>Loading contacts…</p>
        ) : contacts.length === 0 ? (
          <p>No contacts found.</p>
        ) : (
          <div style={{ overflowX: 'auto' }}>
            <table className="table">
              <thead>
                <tr>
                  <th>Name</th>
                  <th>Email</th>
                  <th>Phone</th>
                  <th>Address</th>
                  <th>Created</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {contacts.map((contact) => (
                  <tr key={contact.id}>
                    <td>{contact.name}</td>
                    <td>{contact.email}</td>
                    <td>{contact.phone}</td>
                    <td>{contact.address}</td>
                    <td>{new Date(contact.created_at).toLocaleDateString()}</td>
                    <td>
                      <div style={{ display: 'flex', gap: '0.5rem' }}>
                        <button
                          className="btn btn-secondary"
                          onClick={() => navigate(`/contacts/${contact.id}/edit`)}
                        >
                          Edit
                        </button>
                        <button className="btn btn-danger" onClick={() => handleDelete(contact.id)}>
                          Delete
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
};

export default ContactsList;
