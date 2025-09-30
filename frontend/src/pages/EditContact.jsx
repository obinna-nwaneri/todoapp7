import { useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import ContactForm from '../components/ContactForm.jsx';
import { fetchContact, updateContact } from '../api/client.js';
import { useAuth } from '../context/AuthContext.jsx';

const EditContact = () => {
  const { token } = useAuth();
  const navigate = useNavigate();
  const { id } = useParams();
  const [initialValues, setInitialValues] = useState(null);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadContact = async () => {
      try {
        setError('');
        setLoading(true);
        const data = await fetchContact({ token, id });
        setInitialValues(data);
      } catch (err) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };
    loadContact();
  }, [token, id]);

  const handleUpdate = async (values) => {
    try {
      setError('');
      await updateContact({ token, id, values });
      navigate('/contacts');
    } catch (err) {
      setError(err.message);
    }
  };

  if (loading) {
    return <p>Loading contact...</p>;
  }

  if (!initialValues) {
    return <div className="error">Contact not found.</div>;
  }

  return (
    <div>
      <h1>Edit Contact</h1>
      {error && <div className="error">{error}</div>}
      <ContactForm
        submitLabel="Update Contact"
        onSubmit={handleUpdate}
        initialValues={initialValues}
      />
    </div>
  );
};

export default EditContact;
