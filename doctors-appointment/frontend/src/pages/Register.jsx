import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";

import { useAuth } from "../auth/AuthContext.jsx";

const Register = () => {
  const [form, setForm] = useState({ username: "", password: "", email: "", first_name: "", last_name: "" });
  const [error, setError] = useState(null);
  const navigate = useNavigate();
  const { register } = useAuth();

  const handleChange = (event) => {
    const { name, value } = event.target;
    setForm((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (event) => {
    event.preventDefault();
    try {
      setError(null);
      await register(form);
      navigate("/");
    } catch (err) {
      setError("Registration failed. Try a different username.");
    }
  };

  return (
    <div className="card form-card">
      <h2>Create an account</h2>
      <form onSubmit={handleSubmit}>
        <label htmlFor="username">Username</label>
        <input id="username" name="username" value={form.username} onChange={handleChange} required />
        <label htmlFor="password">Password</label>
        <input id="password" name="password" type="password" value={form.password} onChange={handleChange} required />
        <label htmlFor="email">Email</label>
        <input id="email" name="email" type="email" value={form.email} onChange={handleChange} />
        <label htmlFor="first_name">First name</label>
        <input id="first_name" name="first_name" value={form.first_name} onChange={handleChange} />
        <label htmlFor="last_name">Last name</label>
        <input id="last_name" name="last_name" value={form.last_name} onChange={handleChange} />
        {error && <p style={{ color: "#b91c1c" }}>{error}</p>}
        <button type="submit" className="primary">
          Register
        </button>
      </form>
      <p>
        Already have an account? <Link to="/login">Login</Link>
      </p>
    </div>
  );
};

export default Register;
