import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../api.js';
import { useAuthHeaders } from '../hooks/useAuth.jsx';
import ContactForm from '../components/ContactForm.jsx';

const ContactCreatePage = () => {
  const headers = useAuthHeaders();
  const navigate = useNavigate();
  const [error, setError] = useState('');
  const [submitting, setSubmitting] = useState(false);

  const handleSubmit = async (values) => {
    setError('');
    setSubmitting(true);
    try {
      await api.post('/contacts', values, { headers });
      navigate('/contacts');
    } catch (err) {
      const detail = err.response?.data?.detail;
      const emailError = err.response?.data?.email?.[0];
      setError(detail || emailError || 'Failed to create contact.');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <section className="card">
      <h2>Add Contact</h2>
      {error && <p className="error">{error}</p>}
      <ContactForm onSubmit={handleSubmit} submitting={submitting} />
    </section>
  );
};

export default ContactCreatePage;
