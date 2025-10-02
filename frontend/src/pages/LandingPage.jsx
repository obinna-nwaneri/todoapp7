import { Link } from "react-router-dom";
import { useAuth } from "../context/AuthContext.jsx";

const LandingPage = () => {
  const { user } = useAuth();

  return (
    <div className="container py-5">
      <div className="row align-items-center">
        <div className="col-lg-6">
          <h1 className="display-5 fw-bold">Manage your healthcare appointments with ease.</h1>
          <p className="lead mt-3">
            DocConnect helps patients schedule appointments, share symptoms and stay updated on their visit status while
            giving administrators full control over clinic operations.
          </p>
          {!user && (
            <div className="mt-4 d-flex gap-3">
              <Link className="btn btn-primary btn-lg" to="/register">
                Get Started
              </Link>
              <Link className="btn btn-outline-primary btn-lg" to="/login">
                Login
              </Link>
            </div>
          )}
          {user && (
            <div className="alert alert-info mt-4" role="alert">
              You are logged in as <strong>{user.email}</strong>.
            </div>
          )}
        </div>
        <div className="col-lg-6 text-center">
          <img
            src="https://images.unsplash.com/photo-1582719478250-c89cae4dc85b?auto=format&fit=crop&w=800&q=80"
            alt="Doctors"
            className="img-fluid rounded shadow"
          />
        </div>
      </div>
    </div>
  );
};

export default LandingPage;
