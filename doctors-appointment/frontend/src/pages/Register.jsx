import React, { useState } from "react";
import { Link, useNavigate } from "react-router-dom";

import { useAuth } from "../auth/AuthContext.jsx";

const Register = () => {
  const navigate = useNavigate();
  const { register } = useAuth();
  const [form, setForm] = useState({
    username: "",
    password: "",
    first_name: "",
    last_name: "",
    email: "",
    phone: "",
    dob: ""
  });
  const [error, setError] = useState(null);
  const [loading, setLoading] = useState(false);

  const handleChange = (event) => {
    const { name, value } = event.target;
    setForm((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (event) => {
    event.preventDefault();
    setError(null);
    setLoading(true);
    try {
      await register(form);
      navigate("/", { replace: true });
    } catch (err) {
      setError(err.response?.data?.detail || "Registration failed");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="container" style={{ maxWidth: "520px" }}>
      <h2>Create Account</h2>
      <form onSubmit={handleSubmit} className="card">
        <div className="form-group">
          <label htmlFor="username">Username</label>
          <input id="username" name="username" value={form.username} onChange={handleChange} required />
        </div>
        <div className="form-group">
          <label htmlFor="password">Password</label>
          <input id="password" type="password" name="password" value={form.password} onChange={handleChange} required />
        </div>
        <div className="form-group">
          <label htmlFor="first_name">First Name</label>
          <input id="first_name" name="first_name" value={form.first_name} onChange={handleChange} />
        </div>
        <div className="form-group">
          <label htmlFor="last_name">Last Name</label>
          <input id="last_name" name="last_name" value={form.last_name} onChange={handleChange} />
        </div>
        <div className="form-group">
          <label htmlFor="email">Email</label>
          <input id="email" type="email" name="email" value={form.email} onChange={handleChange} />
        </div>
        <div className="form-group">
          <label htmlFor="phone">Phone</label>
          <input id="phone" name="phone" value={form.phone} onChange={handleChange} required />
        </div>
        <div className="form-group">
          <label htmlFor="dob">Date of Birth</label>
          <input id="dob" type="date" name="dob" value={form.dob} onChange={handleChange} required />
        </div>
        {error && <p style={{ color: "#dc2626" }}>{error}</p>}
        <button className="button" type="submit" disabled={loading}>
          {loading ? "Registering..." : "Register"}
        </button>
      </form>
      <p>
        Already have an account? <Link to="/login">Login</Link>
      </p>
    </div>
  );
};

export default Register;
