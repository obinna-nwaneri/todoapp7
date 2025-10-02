import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import api from "../api/client";

export default function RegisterPatientPage() {
  const navigate = useNavigate();
  const [form, setForm] = useState({
    email: "",
    password: "",
    name: "",
    age: 0,
    gender: "",
    contact_info: "",
  });
  const [message, setMessage] = useState(null);
  const [error, setError] = useState(null);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setForm((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError(null);
    try {
      await api.post("/auth/register/patient", form);
      setMessage("Registration successful. Please login.");
      setTimeout(() => navigate("/login"), 1200);
    } catch (err) {
      setError("Unable to register. Check the entered details.");
    }
  };

  return (
    <div className="auth-wrapper">
      <div className="card" style={{ maxWidth: 520, margin: "2rem auto" }}>
        <h2>Patient Registration</h2>
        {message ? <div className="success">{message}</div> : null}
        {error ? <div className="error">{error}</div> : null}
        <form onSubmit={handleSubmit}>
          <label>Email</label>
          <input name="email" type="email" value={form.email} onChange={handleChange} required />
          <label>Password</label>
          <input name="password" type="password" value={form.password} onChange={handleChange} required />
          <label>Name</label>
          <input name="name" value={form.name} onChange={handleChange} required />
          <label>Age</label>
          <input name="age" type="number" min="0" value={form.age} onChange={handleChange} />
          <label>Gender</label>
          <select name="gender" value={form.gender} onChange={handleChange}>
            <option value="">Select</option>
            <option value="MALE">Male</option>
            <option value="FEMALE">Female</option>
            <option value="OTHER">Other</option>
          </select>
          <label>Contact Info</label>
          <textarea name="contact_info" value={form.contact_info} onChange={handleChange} rows={2} />
          <button className="btn-primary" type="submit">
            Register
          </button>
        </form>
        <Link to="/login">Back to login</Link>
      </div>
    </div>
  );
}
