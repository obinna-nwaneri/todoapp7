import { useState } from "react";
import { useLocation, useNavigate, Link } from "react-router-dom";

import { useAuth } from "../auth/AuthContext.jsx";

const Login = () => {
  const [form, setForm] = useState({ username: "", password: "" });
  const [error, setError] = useState(null);
  const navigate = useNavigate();
  const location = useLocation();
  const { login } = useAuth();

  const handleChange = (event) => {
    const { name, value } = event.target;
    setForm((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (event) => {
    event.preventDefault();
    try {
      setError(null);
      await login(form.username, form.password);
      const redirectTo = location.state?.from?.pathname || "/";
      navigate(redirectTo);
    } catch (err) {
      setError("Invalid credentials. Please try again.");
    }
  };

  return (
    <div className="card form-card">
      <h2>Sign In</h2>
      <form onSubmit={handleSubmit}>
        <label htmlFor="username">Username</label>
        <input id="username" name="username" value={form.username} onChange={handleChange} required />
        <label htmlFor="password">Password</label>
        <input id="password" name="password" type="password" value={form.password} onChange={handleChange} required />
        {error && <p style={{ color: "#b91c1c" }}>{error}</p>}
        <button type="submit" className="primary">
          Login
        </button>
      </form>
      <p>
        Don&apos;t have an account? <Link to="/register">Register</Link>
      </p>
    </div>
  );
};

export default Login;
