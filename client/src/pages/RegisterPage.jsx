import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { api } from '../api.js';

const RegisterPage = () => {
  const navigate = useNavigate();
  const [form, setForm] = useState({ name: '', email: '', phone: '', password: '' });
  const [message, setMessage] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleChange = (event) => {
    const { name, value } = event.target;
    setForm((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (event) => {
    event.preventDefault();
    setLoading(true);
    setError('');
    setMessage('');
    try {
      await api.post('/patients', form);
      setMessage('Account created! You can now login.');
      setTimeout(() => navigate('/'), 1500);
    } catch (err) {
      setError(err.response?.data?.message || 'Registration failed');
    } finally {
      setLoading(false);
    }
  };

  return (
    <section className="card">
      <h2>Create a Patient Account</h2>
      <form onSubmit={handleSubmit} className="form-grid">
        <label>
          Full Name
          <input name="name" value={form.name} onChange={handleChange} required />
        </label>
        <label>
          Email
          <input type="email" name="email" value={form.email} onChange={handleChange} required />
        </label>
        <label>
          Phone
          <input name="phone" value={form.phone} onChange={handleChange} required />
        </label>
        <label>
          Password
          <input
            type="password"
            name="password"
            value={form.password}
            onChange={handleChange}
            required
          />
        </label>
        <div>
          <button type="submit" disabled={loading}>
            {loading ? 'Creating...' : 'Register'}
          </button>
        </div>
      </form>
      {message && <p style={{ color: '#15803d' }}>{message}</p>}
      {error && <p style={{ color: '#b91c1c' }}>{error}</p>}
    </section>
  );
};

export default RegisterPage;
