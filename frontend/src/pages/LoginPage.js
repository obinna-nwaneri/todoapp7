import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import api from '../services/api';
import { useAuth } from '../context/AuthContext';

export default function LoginPage() {
  const navigate = useNavigate();
  const { login } = useAuth();
  const [formData, setFormData] = useState({ username: '', password: '' });
  const [error, setError] = useState(null);

  const handleChange = (event) => {
    const { name, value } = event.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (event) => {
    event.preventDefault();
    setError(null);

    try {
      const response = await api.post('auth/login/', formData);
      const { access } = response.data;
      const profileResponse = await api.get('auth/me/', {
        headers: { Authorization: `Bearer ${access}` },
      });
      login(access, profileResponse.data);
      navigate('/');
    } catch (err) {
      setError('Invalid username or password.');
    }
  };

  return (
    <div className="auth-page">
      <h1>Enterprise Todo Login</h1>
      <form onSubmit={handleSubmit} className="auth-form">
        <label>
          Username
          <input name="username" value={formData.username} onChange={handleChange} required />
        </label>
        <label>
          Password
          <input type="password" name="password" value={formData.password} onChange={handleChange} required />
        </label>
        {error && <p className="error">{error}</p>}
        <button type="submit">Login</button>
      </form>
      <p>
        Need an account? <Link to="/register">Register here</Link>
      </p>
    </div>
  );
}
