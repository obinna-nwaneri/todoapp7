import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import api from "../api/client";

const RegisterDoctorPage = () => {
  const navigate = useNavigate();
  const [form, setForm] = useState({
    email: "",
    password: "",
    name: "",
    specialization: "",
    years_experience: 0,
    bio: "",
    contact_info: "",
  });
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(null);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError(null);
    try {
      await api.post("/auth/register/doctor", form);
      setSuccess("Doctor registered. You can now sign in.");
      setTimeout(() => navigate("/login"), 1500);
    } catch (err) {
      setError(err.response?.data?.email?.[0] || "Registration failed");
    }
  };

  const updateField = (key, value) => setForm((prev) => ({ ...prev, [key]: value }));

  return (
    <div className="flex min-h-screen items-center justify-center bg-slate-100">
      <form onSubmit={handleSubmit} className="w-full max-w-xl rounded bg-white p-6 shadow">
        <h2 className="mb-4 text-2xl font-semibold">Doctor Registration</h2>
        {error && <p className="mb-3 text-sm text-red-600">{error}</p>}
        {success && <p className="mb-3 text-sm text-green-600">{success}</p>}
        <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
          <label className="text-sm font-medium text-gray-700">
            Email
            <input
              type="email"
              className="mt-1 w-full rounded border px-3 py-2"
              value={form.email}
              onChange={(e) => updateField("email", e.target.value)}
              required
            />
          </label>
          <label className="text-sm font-medium text-gray-700">
            Password
            <input
              type="password"
              className="mt-1 w-full rounded border px-3 py-2"
              value={form.password}
              onChange={(e) => updateField("password", e.target.value)}
              required
            />
          </label>
          <label className="text-sm font-medium text-gray-700">
            Name
            <input
              className="mt-1 w-full rounded border px-3 py-2"
              value={form.name}
              onChange={(e) => updateField("name", e.target.value)}
              required
            />
          </label>
          <label className="text-sm font-medium text-gray-700">
            Specialization
            <input
              className="mt-1 w-full rounded border px-3 py-2"
              value={form.specialization}
              onChange={(e) => updateField("specialization", e.target.value)}
              required
            />
          </label>
          <label className="text-sm font-medium text-gray-700">
            Years Experience
            <input
              type="number"
              min="0"
              className="mt-1 w-full rounded border px-3 py-2"
              value={form.years_experience}
              onChange={(e) => updateField("years_experience", Number(e.target.value))}
              required
            />
          </label>
          <label className="text-sm font-medium text-gray-700">
            Contact Info
            <input
              className="mt-1 w-full rounded border px-3 py-2"
              value={form.contact_info}
              onChange={(e) => updateField("contact_info", e.target.value)}
              required
            />
          </label>
        </div>
        <label className="mt-4 block text-sm font-medium text-gray-700">
          Bio
          <textarea
            className="mt-1 w-full rounded border px-3 py-2"
            rows="3"
            value={form.bio}
            onChange={(e) => updateField("bio", e.target.value)}
          />
        </label>
        <button type="submit" className="mt-4 w-full rounded bg-blue-700 px-4 py-2 text-white hover:bg-blue-600">
          Register
        </button>
        <p className="mt-4 text-center text-sm text-gray-500">
          Already have an account? <Link to="/login" className="text-blue-700">Sign in</Link>
        </p>
      </form>
    </div>
  );
};

export default RegisterDoctorPage;
