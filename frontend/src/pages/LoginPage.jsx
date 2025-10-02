import { useState } from "react";
import { useNavigate } from "react-router-dom";
import api from "../api/client";
import { useAuth } from "../context/AuthContext";

const LoginPage = () => {
  const navigate = useNavigate();
  const { login, setUser } = useAuth();
  const [form, setForm] = useState({ email: "", password: "" });
  const [error, setError] = useState(null);
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError(null);
    setLoading(true);
    try {
      await login(form.email, form.password);
      const { data } = await api.get("/auth/me");
      setUser(data);
      if (data.role === "ADMIN") {
        navigate("/admin-panel/dashboard");
      } else if (data.role === "DOCTOR") {
        navigate("/doctor-panel/dashboard");
      } else {
        navigate("/patient-panel/dashboard");
      }
    } catch (err) {
      setError(err.response?.data?.detail || "Login failed");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex min-h-screen items-center justify-center bg-slate-100">
      <form onSubmit={handleSubmit} className="w-full max-w-sm rounded bg-white p-6 shadow">
        <h2 className="mb-4 text-2xl font-semibold">Sign in</h2>
        {error && <p className="mb-3 text-sm text-red-600">{error}</p>}
        <label className="mb-2 block text-sm font-medium text-gray-700">Email</label>
        <input
          type="email"
          required
          value={form.email}
          onChange={(e) => setForm((prev) => ({ ...prev, email: e.target.value }))}
          className="mb-3 w-full rounded border px-3 py-2"
        />
        <label className="mb-2 block text-sm font-medium text-gray-700">Password</label>
        <input
          type="password"
          required
          value={form.password}
          onChange={(e) => setForm((prev) => ({ ...prev, password: e.target.value }))}
          className="mb-6 w-full rounded border px-3 py-2"
        />
        <button
          type="submit"
          disabled={loading}
          className="w-full rounded bg-blue-700 px-4 py-2 text-white hover:bg-blue-600 disabled:opacity-60"
        >
          {loading ? "Signing in..." : "Sign in"}
        </button>
        <p className="mt-4 text-center text-sm text-gray-500">
          New here? <a href="/register-patient" className="text-blue-700">Register as Patient</a> or {" "}
          <a href="/register-doctor" className="text-blue-700">Doctor</a>
        </p>
      </form>
    </div>
  );
};

export default LoginPage;
