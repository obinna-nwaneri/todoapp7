import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "../hooks/useAuth";

export default function LoginPage() {
  const { login, refresh } = useAuth();
  const navigate = useNavigate();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState(null);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError(null);
    try {
      await login(email, password);
      await refresh();
      navigate("/");
    } catch (err) {
      setError("Invalid credentials");
    }
  };

  return (
    <div className="auth-wrapper">
      <div className="card" style={{ maxWidth: 420, margin: "4rem auto" }}>
        <h2>Sign in</h2>
        {error ? <div className="error">{error}</div> : null}
        <form onSubmit={handleSubmit}>
          <label>Email</label>
          <input value={email} onChange={(e) => setEmail(e.target.value)} type="email" required />
          <label>Password</label>
          <input value={password} onChange={(e) => setPassword(e.target.value)} type="password" required />
          <button className="btn-primary" type="submit">
            Login
          </button>
        </form>
        <div style={{ display: "flex", flexDirection: "column", gap: "0.5rem" }}>
          <Link to="/register-doctor">Register as Doctor</Link>
          <Link to="/register-patient">Register as Patient</Link>
        </div>
      </div>
    </div>
  );
}
