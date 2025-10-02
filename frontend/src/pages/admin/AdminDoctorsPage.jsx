import { useEffect, useState } from "react";

import apiClient from "../../api/client.js";

const emptyForm = {
  email: "",
  password: "",
  name: "",
  specialization: "",
  years_of_experience: 0,
  availability_schedule: "",
};

const AdminDoctorsPage = () => {
  const [doctors, setDoctors] = useState([]);
  const [count, setCount] = useState(0);
  const [page, setPage] = useState(1);
  const [search, setSearch] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [form, setForm] = useState({ ...emptyForm });
  const [editingId, setEditingId] = useState(null);

  const fetchDoctors = async () => {
    setLoading(true);
    setError(null);
    try {
      const { data } = await apiClient.get("/admin/doctors/", {
        params: { page, search },
      });
      setDoctors(data.results || data);
      setCount(data.count || data.length || 0);
    } catch (err) {
      setError(err.response?.data || { detail: "Unable to load doctors" });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchDoctors();
  }, [page, search]);

  const resetForm = () => {
    setForm({ ...emptyForm });
    setEditingId(null);
  };

  const handleChange = (event) => {
    const { name, value } = event.target;
    setForm((prev) => ({ ...prev, [name]: value }));
  };

  const handleEdit = (doctor) => {
    setEditingId(doctor.id);
    setForm({
      email: doctor.email,
      password: "",
      name: doctor.name,
      specialization: doctor.specialization,
      years_of_experience: doctor.years_of_experience,
      availability_schedule: JSON.stringify(doctor.availability_schedule || {}),
    });
  };

  const handleDelete = async (id) => {
    if (!confirm("Delete this doctor?")) return;
    try {
      await apiClient.delete(`/admin/doctors/${id}/`);
      fetchDoctors();
    } catch (err) {
      setError(err.response?.data || { detail: "Unable to delete doctor" });
    }
  };

  const handleSubmit = async (event) => {
    event.preventDefault();
    setError(null);
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
        email: form.email,
        password: form.password || undefined,
        name: form.name,
        specialization: form.specialization,
        years_of_experience: Number(form.years_of_experience),
        availability_schedule: availability,
      };
      if (editingId) {
        await apiClient.put(`/admin/doctors/${editingId}/`, payload);
      } else {
        await apiClient.post("/admin/doctors/", payload);
      }
      resetForm();
      fetchDoctors();
    } catch (err) {
      setError(err.response?.data || { detail: "Unable to save doctor" });
    }
  };

  const totalPages = count ? Math.ceil(count / 10) : 1;

  return (
    <div>
      <h2>Manage Doctors</h2>
      <div className="card">
        <form onSubmit={handleSubmit}>
          <h3>{editingId ? "Edit Doctor" : "Create Doctor"}</h3>
          <label>
            Email
            <input type="email" name="email" value={form.email} onChange={handleChange} required />
          </label>
          <label>
            Password {editingId && "(leave blank to keep)"}
            <input type="password" name="password" value={form.password} onChange={handleChange} />
          </label>
          <label>
            Name
            <input type="text" name="name" value={form.name} onChange={handleChange} required />
          </label>
          <label>
            Specialization
            <input type="text" name="specialization" value={form.specialization} onChange={handleChange} required />
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
              onChange={handleChange}
            />
          </label>
          <div style={{ display: "flex", gap: "0.5rem" }}>
            <button type="submit">{editingId ? "Update" : "Create"}</button>
            {editingId && (
              <button type="button" className="secondary" onClick={resetForm}>
                Cancel
              </button>
            )}
          </div>
        </form>
      </div>

      <div className="card" style={{ marginTop: "1.5rem" }}>
        <div style={{ display: "flex", gap: "1rem", marginBottom: "1rem" }}>
          <input
            type="search"
            placeholder="Search doctors"
            value={search}
            onChange={(event) => {
              setPage(1);
              setSearch(event.target.value);
            }}
          />
        </div>
        {error && <pre className="alert">{JSON.stringify(error, null, 2)}</pre>}
        {loading ? (
          <p>Loading...</p>
        ) : (
          <div className="table-wrapper">
            <table>
              <thead>
                <tr>
                  <th>Name</th>
                  <th>Email</th>
                  <th>Specialization</th>
                  <th>Experience</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {doctors.map((doctor) => (
                  <tr key={doctor.id}>
                    <td>{doctor.name}</td>
                    <td>{doctor.email}</td>
                    <td>{doctor.specialization}</td>
                    <td>{doctor.years_of_experience} yrs</td>
                    <td>
                      <button type="button" className="secondary" onClick={() => handleEdit(doctor)}>
                        Edit
                      </button>
                      <button type="button" onClick={() => handleDelete(doctor.id)}>
                        Delete
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
        <div style={{ marginTop: "1rem", display: "flex", gap: "0.5rem", alignItems: "center" }}>
          <button type="button" disabled={page <= 1} onClick={() => setPage((prev) => prev - 1)}>
            Previous
          </button>
          <span>
            Page {page} of {totalPages}
          </span>
          <button type="button" disabled={page >= totalPages} onClick={() => setPage((prev) => prev + 1)}>
            Next
          </button>
        </div>
      </div>
    </div>
  );
};

export default AdminDoctorsPage;
