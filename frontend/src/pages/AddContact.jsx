import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import ContactForm from '../components/ContactForm.jsx';
import { createContact } from '../api/client.js';
import { useAuth } from '../context/AuthContext.jsx';

const AddContact = () => {
  const { token } = useAuth();
  const navigate = useNavigate();
  const [error, setError] = useState('');

  const handleCreate = async (values) => {
    try {
      setError('');
      await createContact({ token, values });
      navigate('/contacts');
    } catch (err) {
      setError(err.message);
    }
  };

  return (
    <div>
      <h1>Add Contact</h1>
      {error && <div className="error">{error}</div>}
      <ContactForm submitLabel="Create Contact" onSubmit={handleCreate} />
    </div>
  );
};

export default AddContact;
