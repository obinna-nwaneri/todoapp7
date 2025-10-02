import { useState } from "react";
import { useNavigate, Navigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext.jsx";

const RegisterPage = () => {
  const { register, user } = useAuth();
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    first_name: "",
    last_name: "",
    email: "",
    password: ""
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  if (user) {
    return <Navigate to={user.is_staff ? "/admin" : "/appointments"} replace />;
  }

  const handleChange = (event) => {
    const { name, value } = event.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (event) => {
    event.preventDefault();
    setLoading(true);
    setError(null);
    try {
      const account = await register(formData);
      navigate(account?.is_staff ? "/admin" : "/appointments", { replace: true });
    } catch (err) {
      setError(err.message || "Registration failed.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="container py-5" style={{ maxWidth: "500px" }}>
      <h2 className="mb-4 text-center">Create an account</h2>
      <div className="card shadow-sm">
        <div className="card-body">
          {error && <div className="alert alert-danger">{error}</div>}
          <form onSubmit={handleSubmit}>
            <div className="row">
              <div className="col-md-6 mb-3">
                <label className="form-label">First Name</label>
                <input
                  type="text"
                  className="form-control"
                  name="first_name"
                  value={formData.first_name}
                  onChange={handleChange}
                  required
                />
              </div>
              <div className="col-md-6 mb-3">
                <label className="form-label">Last Name</label>
                <input
                  type="text"
                  className="form-control"
                  name="last_name"
                  value={formData.last_name}
                  onChange={handleChange}
                  required
                />
              </div>
            </div>
            <div className="mb-3">
              <label className="form-label">Email</label>
              <input
                type="email"
                className="form-control"
                name="email"
                value={formData.email}
                onChange={handleChange}
                required
              />
            </div>
            <div className="mb-3">
              <label className="form-label">Password</label>
              <input
                type="password"
                className="form-control"
                name="password"
                value={formData.password}
                onChange={handleChange}
                required
                minLength={8}
              />
            </div>
            <button className="btn btn-success w-100" type="submit" disabled={loading}>
              {loading ? "Creating account..." : "Register"}
            </button>
          </form>
        </div>
      </div>
    </div>
  );
};

export default RegisterPage;
