import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import api from '../services/api';

const roles = [
  { value: 'user', label: 'User' },
  { value: 'admin', label: 'Admin' },
];

export default function RegisterPage() {
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    username: '',
    email: '',
    role: 'user',
    password: '',
    password2: '',
  });
  const [error, setError] = useState(null);

  const handleChange = (event) => {
    const { name, value } = event.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (event) => {
    event.preventDefault();
    setError(null);

    try {
      await api.post('auth/register/', formData);
      navigate('/login');
    } catch (err) {
      const message = err.response?.data?.password?.[0] || 'Unable to register.';
      setError(message);
    }
  };

  return (
    <div className="auth-page">
      <h1>Create an Account</h1>
      <form onSubmit={handleSubmit} className="auth-form">
        <label>
          Username
          <input name="username" value={formData.username} onChange={handleChange} required />
        </label>
        <label>
          Email
          <input type="email" name="email" value={formData.email} onChange={handleChange} />
        </label>
        <label>
          Role
          <select name="role" value={formData.role} onChange={handleChange}>
            {roles.map((role) => (
              <option key={role.value} value={role.value}>
                {role.label}
              </option>
            ))}
          </select>
        </label>
        <label>
          Password
          <input type="password" name="password" value={formData.password} onChange={handleChange} required />
        </label>
        <label>
          Confirm Password
          <input type="password" name="password2" value={formData.password2} onChange={handleChange} required />
        </label>
        {error && <p className="error">{error}</p>}
        <button type="submit">Register</button>
      </form>
      <p>
        Already have an account? <Link to="/login">Login</Link>
      </p>
    </div>
  );
}
