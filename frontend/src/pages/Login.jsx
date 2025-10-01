import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import api from '../services/api';
import { useAuth } from '../context/AuthContext';

const Login = () => {
  const navigate = useNavigate();
  const { login } = useAuth();
  const [form, setForm] = useState({ email: '', password: '' });
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
      const { data } = await api.post('/api/auth/login', form);
      login(data.user, data.token);
      setMessage({ type: 'success', text: 'Login successful! Redirecting...' });
      setTimeout(() => navigate('/'), 600);
    } catch (error) {
      const text = error.response?.data?.message || 'Unable to login. Please try again.';
      setMessage({ type: 'error', text });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="auth-container">
      <h1>Welcome Back</h1>
      <p className="muted">Sign in to manage your enterprise todos.</p>
      <form onSubmit={handleSubmit} className="auth-form">
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
          placeholder="Enter your password"
          required
          disabled={loading}
        />
        <button type="submit" className="primary" disabled={loading}>
          {loading ? 'Signing in...' : 'Login'}
        </button>
      </form>
      {message && <p className={`message ${message.type}`}>{message.text}</p>}
      <p className="muted">
        New here? <Link to="/register">Create an account</Link>
      </p>
    </div>
  );
};

export default Login;
