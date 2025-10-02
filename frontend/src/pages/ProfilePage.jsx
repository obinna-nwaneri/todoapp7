import { useEffect, useState } from "react";
import { apiRequest, endpoints } from "../api.js";
import { useAuth } from "../context/AuthContext.jsx";

const ProfilePage = () => {
  const { tokens, user, refreshUser } = useAuth();
  const [profile, setProfile] = useState({ first_name: "", last_name: "", email: "" });
  const [profileMessage, setProfileMessage] = useState(null);
  const [passwords, setPasswords] = useState({ old_password: "", new_password: "" });
  const [passwordMessage, setPasswordMessage] = useState(null);
  const [error, setError] = useState(null);

  useEffect(() => {
    if (user) {
      setProfile({ first_name: user.first_name || "", last_name: user.last_name || "", email: user.email });
    }
  }, [user]);

  const handleProfileChange = (event) => {
    const { name, value } = event.target;
    setProfile((prev) => ({ ...prev, [name]: value }));
  };

  const submitProfile = async (event) => {
    event.preventDefault();
    setError(null);
    setProfileMessage(null);
    try {
      await apiRequest(endpoints.me, {
        method: "PATCH",
        token: tokens.access,
        body: { first_name: profile.first_name, last_name: profile.last_name }
      });
      await refreshUser();
      setProfileMessage("Profile updated successfully.");
    } catch (err) {
      setError(err.message);
    }
  };

  const handlePasswordChange = (event) => {
    const { name, value } = event.target;
    setPasswords((prev) => ({ ...prev, [name]: value }));
  };

  const submitPassword = async (event) => {
    event.preventDefault();
    setPasswordMessage(null);
    setError(null);
    try {
      await apiRequest(endpoints.changePassword, {
        method: "POST",
        token: tokens.access,
        body: passwords
      });
      setPasswordMessage("Password changed successfully.");
      setPasswords({ old_password: "", new_password: "" });
    } catch (err) {
      setError(err.message);
    }
  };

  return (
    <div className="container py-4" style={{ maxWidth: "700px" }}>
      <h2 className="mb-4">Profile</h2>
      {error && <div className="alert alert-danger">{error}</div>}
      <div className="card shadow-sm mb-4">
        <div className="card-header bg-light">
          <h5 className="mb-0">Personal details</h5>
        </div>
        <div className="card-body">
          {profileMessage && <div className="alert alert-success">{profileMessage}</div>}
          <form onSubmit={submitProfile}>
            <div className="row">
              <div className="col-md-6 mb-3">
                <label className="form-label">First Name</label>
                <input
                  type="text"
                  className="form-control"
                  name="first_name"
                  value={profile.first_name}
                  onChange={handleProfileChange}
                  required
                />
              </div>
              <div className="col-md-6 mb-3">
                <label className="form-label">Last Name</label>
                <input
                  type="text"
                  className="form-control"
                  name="last_name"
                  value={profile.last_name}
                  onChange={handleProfileChange}
                  required
                />
              </div>
            </div>
            <div className="mb-3">
              <label className="form-label">Email</label>
              <input type="email" className="form-control" value={profile.email} disabled />
            </div>
            <button className="btn btn-primary" type="submit">
              Save changes
            </button>
          </form>
        </div>
      </div>
      <div className="card shadow-sm">
        <div className="card-header bg-light">
          <h5 className="mb-0">Change password</h5>
        </div>
        <div className="card-body">
          {passwordMessage && <div className="alert alert-success">{passwordMessage}</div>}
          <form onSubmit={submitPassword}>
            <div className="mb-3">
              <label className="form-label">Current Password</label>
              <input
                type="password"
                className="form-control"
                name="old_password"
                value={passwords.old_password}
                onChange={handlePasswordChange}
                required
              />
            </div>
            <div className="mb-3">
              <label className="form-label">New Password</label>
              <input
                type="password"
                className="form-control"
                name="new_password"
                value={passwords.new_password}
                onChange={handlePasswordChange}
                required
                minLength={8}
              />
            </div>
            <button className="btn btn-secondary" type="submit">
              Update Password
            </button>
          </form>
        </div>
      </div>
    </div>
  );
};

export default ProfilePage;
