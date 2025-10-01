import { useState } from "react";
import { Link, Navigate, useLocation, useNavigate } from "react-router-dom";

import { useAuth } from "../context/AuthContext.jsx";

const Login = () => {
  const { authTokens, login } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const [formData, setFormData] = useState({ username: "", password: "" });
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  if (authTokens) {
    return <Navigate to="/dashboard" replace />;
  }

  const handleChange = (event) => {
    const { name, value } = event.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (event) => {
    event.preventDefault();
    setError("");
    setLoading(true);

    try {
      const user = await login(formData);
      const redirectPath = user.is_staff ? "/admin-panel/dashboard" : "/dashboard";
      const fromState = location.state?.from?.pathname;
      navigate(fromState || redirectPath, { replace: true });
    } catch (err) {
      setError(err.response?.data?.detail || "Unable to sign in. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="row justify-content-center">
      <div className="col-lg-5">
        <div className="card shadow-sm border-0">
          <div className="card-body p-4">
            <h1 className="h3 mb-3 text-center">Welcome Back</h1>
            <p className="text-muted text-center mb-4">Sign in to manage your tasks.</p>
            {error && <div className="alert alert-danger">{error}</div>}
            <form onSubmit={handleSubmit} className="needs-validation" noValidate>
              <div className="mb-3">
                <label className="form-label" htmlFor="username">
                  Username
                </label>
                <input
                  id="username"
                  className="form-control"
                  name="username"
                  value={formData.username}
                  onChange={handleChange}
                  required
                  autoComplete="username"
                />
              </div>
              <div className="mb-4">
                <label className="form-label" htmlFor="password">
                  Password
                </label>
                <input
                  id="password"
                  type="password"
                  className="form-control"
                  name="password"
                  value={formData.password}
                  onChange={handleChange}
                  required
                  autoComplete="current-password"
                />
              </div>
              <button type="submit" className="btn btn-primary w-100" disabled={loading}>
                {loading ? "Signing in..." : "Sign In"}
              </button>
            </form>
            <p className="mt-4 text-center text-muted">
              Need an account? <Link to="/register">Create one now</Link>
            </p>
            <div className="alert alert-info mt-3" role="alert">
              <strong>Sample users</strong>
              <ul className="mb-0 mt-2">
                <li>Admin: admin / Admin@123</li>
                <li>User: johndoe / User@123</li>
              </ul>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Login;
