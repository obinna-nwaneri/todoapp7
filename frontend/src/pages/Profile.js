import React, { useEffect, useState } from "react";
import { useAuth } from "../AuthContext";
import { apiRequest } from "../api";

const Profile = () => {
  const { tokens, user, setUser } = useAuth();
  const [formData, setFormData] = useState({ first_name: "", last_name: "", email: "" });
  const [passwordForm, setPasswordForm] = useState({ old_password: "", new_password: "" });
  const [message, setMessage] = useState(null);
  const [error, setError] = useState(null);

  useEffect(() => {
    const loadProfile = async () => {
      try {
        const data = await apiRequest("patient/profile/", { tokens });
        setFormData(data);
      } catch (err) {
        setError(err.message);
      }
    };
    loadProfile();
  }, [tokens]);

  const handleChange = (event) => {
    const { name, value } = event.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handlePasswordChange = (event) => {
    const { name, value } = event.target;
    setPasswordForm((prev) => ({ ...prev, [name]: value }));
  };

  const handleProfileSubmit = async (event) => {
    event.preventDefault();
    setError(null);
    try {
      const updated = await apiRequest("patient/profile/", { method: "PUT", tokens, body: formData });
      setMessage("Profile updated successfully.");
      const merged = { ...user, ...updated };
      setUser(merged);
      localStorage.setItem("authUser", JSON.stringify(merged));
    } catch (err) {
      setError(err.message);
    }
  };

  const handlePasswordSubmit = async (event) => {
    event.preventDefault();
    setError(null);
    try {
      await apiRequest("patient/change-password/", { method: "PUT", tokens, body: passwordForm });
      setMessage("Password changed successfully.");
      setPasswordForm({ old_password: "", new_password: "" });
    } catch (err) {
      setError(err.message);
    }
  };

  return (
    <div className="row justify-content-center">
      <div className="col-lg-6">
        <div className="card shadow-sm mb-4">
          <div className="card-body">
            <h3 className="card-title mb-3">Profile Details</h3>
            {message && <div className="alert alert-success">{message}</div>}
            {error && <div className="alert alert-danger">{error}</div>}
            <form onSubmit={handleProfileSubmit}>
              <div className="mb-3">
                <label className="form-label" htmlFor="email">
                  Email
                </label>
                <input
                  className="form-control"
                  id="email"
                  name="email"
                  type="email"
                  value={formData.email}
                  disabled
                />
              </div>
              <div className="mb-3">
                <label className="form-label" htmlFor="first_name">
                  First name
                </label>
                <input
                  className="form-control"
                  id="first_name"
                  name="first_name"
                  value={formData.first_name}
                  onChange={handleChange}
                />
              </div>
              <div className="mb-3">
                <label className="form-label" htmlFor="last_name">
                  Last name
                </label>
                <input
                  className="form-control"
                  id="last_name"
                  name="last_name"
                  value={formData.last_name}
                  onChange={handleChange}
                />
              </div>
              <button className="btn btn-primary" type="submit">
                Save changes
              </button>
            </form>
          </div>
        </div>
        <div className="card shadow-sm">
          <div className="card-body">
            <h3 className="card-title mb-3">Change Password</h3>
            <form onSubmit={handlePasswordSubmit}>
              <div className="mb-3">
                <label className="form-label" htmlFor="old_password">
                  Current password
                </label>
                <input
                  className="form-control"
                  id="old_password"
                  name="old_password"
                  type="password"
                  value={passwordForm.old_password}
                  onChange={handlePasswordChange}
                  required
                />
              </div>
              <div className="mb-3">
                <label className="form-label" htmlFor="new_password">
                  New password
                </label>
                <input
                  className="form-control"
                  id="new_password"
                  name="new_password"
                  type="password"
                  value={passwordForm.new_password}
                  onChange={handlePasswordChange}
                  required
                />
              </div>
              <button className="btn btn-outline-primary" type="submit">
                Update password
              </button>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Profile;
