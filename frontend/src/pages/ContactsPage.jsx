import { useEffect, useMemo, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import api from '../api.js';
import { useAuthHeaders } from '../hooks/useAuth.jsx';

const ContactsPage = () => {
  const headers = useAuthHeaders();
  const [contacts, setContacts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [searchTerm, setSearchTerm] = useState('');
  const navigate = useNavigate();

  useEffect(() => {
    const fetchContacts = async () => {
      try {
        const response = await api.get('/contacts', { headers });
        setContacts(response.data);
      } catch (err) {
        setError('Unable to load contacts.');
      } finally {
        setLoading(false);
      }
    };

    fetchContacts();
  }, [headers]);

  const filteredContacts = useMemo(() => {
    const query = searchTerm.toLowerCase();
    return contacts.filter(
      (contact) =>
        contact.name.toLowerCase().includes(query) ||
        contact.email.toLowerCase().includes(query) ||
        contact.phone.toLowerCase().includes(query),
    );
  }, [contacts, searchTerm]);

  const handleDelete = async (id) => {
    if (!window.confirm('Are you sure you want to delete this contact?')) {
      return;
    }
    try {
      await api.delete(`/contacts/${id}`, { headers });
      setContacts((prev) => prev.filter((contact) => contact.id !== id));
    } catch (err) {
      setError('Failed to delete contact.');
    }
  };

  if (loading) {
    return <p>Loading contacts...</p>;
  }

  return (
    <section className="card">
      <header className="card-header">
        <h2>Contacts</h2>
        <button type="button" className="primary" onClick={() => navigate('/contacts/new')}>
          Add Contact
        </button>
      </header>
      <div className="toolbar">
        <input
          type="search"
          placeholder="Search contacts"
          value={searchTerm}
          onChange={(event) => setSearchTerm(event.target.value)}
        />
      </div>
      {error && <p className="error">{error}</p>}
      <div className="table-wrapper">
        <table>
          <thead>
            <tr>
              <th>Name</th>
              <th>Email</th>
              <th>Phone</th>
              <th>Address</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {filteredContacts.map((contact) => (
              <tr key={contact.id}>
                <td>{contact.name}</td>
                <td>{contact.email}</td>
                <td>{contact.phone}</td>
                <td>{contact.address}</td>
                <td className="table-actions">
                  <Link className="link" to={`/contacts/${contact.id}/edit`}>
                    Edit
                  </Link>
                  <button type="button" className="link danger" onClick={() => handleDelete(contact.id)}>
                    Delete
                  </button>
                </td>
              </tr>
            ))}
            {filteredContacts.length === 0 && (
              <tr>
                <td colSpan="5" className="empty">
                  No contacts found.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </section>
  );
};

export default ContactsPage;
