import { useState } from "react";

import apiClient from "../api/client.js";

const initialState = {
  email: "",
  password: "",
  name: "",
  specialization: "",
  years_of_experience: 0,
  availability_schedule: "",
};

const RegisterDoctorPage = () => {
  const [form, setForm] = useState(initialState);
  const [message, setMessage] = useState(null);
  const [error, setError] = useState(null);

  const handleChange = (event) => {
    const { name, value } = event.target;
    setForm((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (event) => {
    event.preventDefault();
    setError(null);
    setMessage(null);
    try {
      let availability = {};
      if (form.availability_schedule) {
        try {
          availability = JSON.parse(form.availability_schedule);
        } catch (jsonError) {
          setError({ detail: "Availability schedule must be valid JSON." });
          return;
        }
      }
      const payload = {
        ...form,
        years_of_experience: Number(form.years_of_experience),
        availability_schedule: availability,
      };
      await apiClient.post("/auth/register/doctor", payload);
      setMessage("Doctor registered successfully. You can now log in.");
      setForm(initialState);
    } catch (err) {
      setError(err.response?.data || { detail: "Unable to register doctor" });
    }
  };

  return (
    <div className="card">
      <h2>Doctor Registration</h2>
      {message && <p className="success">{message}</p>}
      {error && <pre className="alert">{JSON.stringify(error, null, 2)}</pre>}
      <form onSubmit={handleSubmit}>
        <label>
          Email
          <input type="email" name="email" value={form.email} onChange={handleChange} required />
        </label>
        <label>
          Password
          <input type="password" name="password" value={form.password} onChange={handleChange} required />
        </label>
        <label>
          Name
          <input type="text" name="name" value={form.name} onChange={handleChange} required />
        </label>
        <label>
          Specialization
          <input
            type="text"
            name="specialization"
            value={form.specialization}
            onChange={handleChange}
            required
          />
        </label>
        <label>
          Years of Experience
          <input
            type="number"
            name="years_of_experience"
            value={form.years_of_experience}
            min="0"
            onChange={handleChange}
            required
          />
        </label>
        <label>
          Availability Schedule (JSON)
          <textarea
            name="availability_schedule"
            value={form.availability_schedule}
            placeholder='{"monday": ["09:00", "12:00"]}'
            onChange={handleChange}
          />
        </label>
        <button type="submit">Register Doctor</button>
      </form>
    </div>
  );
};

export default RegisterDoctorPage;
