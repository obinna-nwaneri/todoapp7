import { useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import api from '../api.js';
import { useAuthHeaders } from '../hooks/useAuth.jsx';
import ContactForm from '../components/ContactForm.jsx';

const ContactEditPage = () => {
  const { id } = useParams();
  const headers = useAuthHeaders();
  const navigate = useNavigate();
  const [contact, setContact] = useState(null);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    const fetchContact = async () => {
      try {
        const response = await api.get(`/contacts/${id}`, { headers });
        setContact(response.data);
      } catch (err) {
        setError('Failed to load contact.');
      } finally {
        setLoading(false);
      }
    };

    fetchContact();
  }, [headers, id]);

  const handleSubmit = async (values) => {
    setError('');
    setSubmitting(true);
    try {
      await api.put(`/contacts/${id}`, values, { headers });
      navigate('/contacts');
    } catch (err) {
      const detail = err.response?.data?.detail;
      const emailError = err.response?.data?.email?.[0];
      setError(detail || emailError || 'Failed to update contact.');
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) {
    return <p>Loading contact...</p>;
  }

  if (!contact) {
    return <p className="error">{error || 'Contact not found.'}</p>;
  }

  return (
    <section className="card">
      <h2>Edit Contact</h2>
      {error && <p className="error">{error}</p>}
      <ContactForm initialData={contact} onSubmit={handleSubmit} submitting={submitting} />
    </section>
  );
};

export default ContactEditPage;
