import { useState } from "react";

import apiClient from "../api/client.js";

const initialState = {
  email: "",
  password: "",
  name: "",
  age: 0,
  gender: "",
  contact_info: "",
};

const RegisterPatientPage = () => {
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
      let contactInfo = {};
      if (form.contact_info) {
        try {
          contactInfo = JSON.parse(form.contact_info);
        } catch (jsonError) {
          setError({ detail: "Contact info must be valid JSON." });
          return;
        }
      }
      const payload = {
        ...form,
        age: Number(form.age),
        contact_info: contactInfo,
      };
      await apiClient.post("/auth/register/patient", payload);
      setMessage("Patient registered successfully. You can now log in.");
      setForm(initialState);
    } catch (err) {
      setError(err.response?.data || { detail: "Unable to register patient" });
    }
  };

  return (
    <div className="card">
      <h2>Patient Registration</h2>
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
          Age
          <input type="number" name="age" value={form.age} min="0" onChange={handleChange} required />
        </label>
        <label>
          Gender
          <input type="text" name="gender" value={form.gender} onChange={handleChange} required />
        </label>
        <label>
          Contact Info (JSON)
          <textarea
            name="contact_info"
            value={form.contact_info}
            placeholder='{"phone": "555-1234"}'
            onChange={handleChange}
          />
        </label>
        <button type="submit">Register Patient</button>
      </form>
    </div>
  );
};

export default RegisterPatientPage;
