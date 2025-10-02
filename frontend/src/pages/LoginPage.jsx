import { useState } from "react";
import { useNavigate } from "react-router-dom";

import { useAuth } from "../context/AuthContext.jsx";

const roleRedirect = (role) => {
  switch (role) {
    case "ADMIN":
      return "/admin-panel/dashboard";
    case "DOCTOR":
      return "/doctor-panel/dashboard";
    case "PATIENT":
      return "/patient-panel/dashboard";
    default:
      return "/login";
  }
};

const LoginPage = () => {
  const navigate = useNavigate();
  const { login } = useAuth();
  const [form, setForm] = useState({ email: "", password: "" });
  const [error, setError] = useState(null);

  const handleChange = (event) => {
    const { name, value } = event.target;
    setForm((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (event) => {
    event.preventDefault();
    setError(null);
    try {
      const loggedInUser = await login(form);
      navigate(roleRedirect(loggedInUser.role));
    } catch (err) {
      setError(err.response?.data?.detail || "Invalid credentials");
    }
  };

  return (
    <div className="card">
      <h2>Login</h2>
      {error && <p className="alert">{error}</p>}
      <form onSubmit={handleSubmit}>
        <label>
          Email
          <input type="email" name="email" value={form.email} onChange={handleChange} required />
        </label>
        <label>
          Password
          <input type="password" name="password" value={form.password} onChange={handleChange} required />
        </label>
        <button type="submit">Login</button>
      </form>
    </div>
  );
};

export default LoginPage;
