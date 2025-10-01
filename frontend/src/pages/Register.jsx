import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import api from '../services/api';
import { useAuth } from '../context/AuthContext';

const Register = () => {
  const navigate = useNavigate();
  const { login } = useAuth();
  const [form, setForm] = useState({ name: '', email: '', password: '' });
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState(null);

  const handleChange = event => {
    const { name, value } = event.target;
    setForm(prev => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async event => {
    event.preventDefault();
    setLoading(true);
    setMessage(null);
    try {
      const { data } = await api.post('/api/auth/register', form);
      login(data.user, data.token);
      setMessage({ type: 'success', text: 'Registration successful! Redirecting...' });
      setTimeout(() => navigate('/'), 600);
    } catch (error) {
      const text = error.response?.data?.message || 'Unable to register. Please try again.';
      setMessage({ type: 'error', text });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="auth-container">
      <h1>Create your account</h1>
      <p className="muted">Collaborate with your team and stay on top of critical tasks.</p>
      <form onSubmit={handleSubmit} className="auth-form">
        <label htmlFor="name">Full Name</label>
        <input
          id="name"
          name="name"
          value={form.name}
          onChange={handleChange}
          placeholder="Jane Doe"
          required
          disabled={loading}
        />
        <label htmlFor="email">Email</label>
        <input
          id="email"
          name="email"
          type="email"
          value={form.email}
          onChange={handleChange}
          placeholder="you@example.com"
          required
          disabled={loading}
        />
        <label htmlFor="password">Password</label>
        <input
          id="password"
          name="password"
          type="password"
          value={form.password}
          onChange={handleChange}
          placeholder="Choose a secure password"
          required
          disabled={loading}
        />
        <button type="submit" className="primary" disabled={loading}>
          {loading ? 'Creating account...' : 'Register'}
        </button>
      </form>
      {message && <p className={`message ${message.type}`}>{message.text}</p>}
      <p className="muted">
        Already have an account? <Link to="/login">Login</Link>
      </p>
    </div>
  );
};

export default Register;
