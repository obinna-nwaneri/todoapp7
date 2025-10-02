import { useState } from "react";
import { useNavigate, Navigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext.jsx";

const LoginPage = () => {
  const { login, user } = useAuth();
  const [email, setEmail] = useState("user@example.com");
  const [password, setPassword] = useState("user123");
  const [error, setError] = useState(null);
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  if (user) {
    return <Navigate to={user.is_staff ? "/admin" : "/appointments"} replace />;
  }

  const handleSubmit = async (event) => {
    event.preventDefault();
    setLoading(true);
    setError(null);
    try {
      const account = await login(email, password);
      navigate(account?.is_staff ? "/admin" : "/appointments", { replace: true });
    } catch (err) {
      setError(err.message || "Login failed. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="container py-5" style={{ maxWidth: "450px" }}>
      <h2 className="mb-4 text-center">Login</h2>
      <div className="card shadow-sm">
        <div className="card-body">
          {error && <div className="alert alert-danger">{error}</div>}
          <form onSubmit={handleSubmit}>
            <div className="mb-3">
              <label className="form-label">Email</label>
              <input
                type="email"
                className="form-control"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
              />
            </div>
            <div className="mb-3">
              <label className="form-label">Password</label>
              <input
                type="password"
                className="form-control"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
              />
            </div>
            <button className="btn btn-primary w-100" type="submit" disabled={loading}>
              {loading ? "Signing in..." : "Login"}
            </button>
          </form>
        </div>
      </div>
    </div>
  );
};

export default LoginPage;
