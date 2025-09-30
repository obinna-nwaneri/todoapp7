import React, { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";

import useAuth from "../hooks/useAuth";

const RegisterPage = () => {
  const navigate = useNavigate();
  const { register, isAuthenticated, error, clearError, loading } = useAuth();
  const [form, setForm] = useState({ username: "", email: "", password: "" });

  useEffect(() => {
    if (isAuthenticated) {
      navigate("/dashboard", { replace: true });
    }
  }, [isAuthenticated, navigate]);

  useEffect(() => {
    clearError();
  }, [form.username, form.email, form.password, clearError]);

  const handleChange = (event) => {
    const { name, value } = event.target;
    setForm((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (event) => {
    event.preventDefault();
    const result = await register(form);
    if (result.success) {
      navigate("/dashboard", { replace: true });
    }
  };

  return (
    <div className="auth-page">
      <h1>Register</h1>
      {error && <div className="alert">{error}</div>}
      <form onSubmit={handleSubmit}>
        <div className="form-group">
          <label htmlFor="username">Username</label>
          <input
            id="username"
            name="username"
            value={form.username}
            onChange={handleChange}
            required
          />
        </div>
        <div className="form-group">
          <label htmlFor="email">Email</label>
          <input
            id="email"
            name="email"
            type="email"
            value={form.email}
            onChange={handleChange}
          />
        </div>
        <div className="form-group">
          <label htmlFor="password">Password</label>
          <input
            id="password"
            type="password"
            name="password"
            value={form.password}
            onChange={handleChange}
            required
          />
        </div>
        <div className="form-actions">
          <button className="button" type="submit" disabled={loading}>
            {loading ? "Creating account..." : "Register"}
          </button>
          <Link to="/login">Have an account? Login</Link>
        </div>
      </form>
    </div>
  );
};

export default RegisterPage;
