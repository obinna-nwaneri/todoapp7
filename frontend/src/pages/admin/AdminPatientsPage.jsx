import { useEffect, useState } from "react";

import apiClient from "../../api/client.js";

const emptyForm = {
  email: "",
  password: "",
  name: "",
  age: 0,
  gender: "",
  contact_info: "",
};

const AdminPatientsPage = () => {
  const [patients, setPatients] = useState([]);
  const [count, setCount] = useState(0);
  const [page, setPage] = useState(1);
  const [search, setSearch] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [form, setForm] = useState({ ...emptyForm });
  const [editingId, setEditingId] = useState(null);

  const fetchPatients = async () => {
    setLoading(true);
    setError(null);
    try {
      const { data } = await apiClient.get("/admin/patients/", {
        params: { page, search },
      });
      setPatients(data.results || data);
      setCount(data.count || data.length || 0);
    } catch (err) {
      setError(err.response?.data || { detail: "Unable to load patients" });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchPatients();
  }, [page, search]);

  const resetForm = () => {
    setForm({ ...emptyForm });
    setEditingId(null);
  };

  const handleChange = (event) => {
    const { name, value } = event.target;
    setForm((prev) => ({ ...prev, [name]: value }));
  };

  const handleEdit = (patient) => {
    setEditingId(patient.id);
    setForm({
      email: patient.email,
      password: "",
      name: patient.name,
      age: patient.age,
      gender: patient.gender,
      contact_info: JSON.stringify(patient.contact_info || {}),
    });
  };

  const handleDelete = async (id) => {
    if (!confirm("Delete this patient?")) return;
    try {
      await apiClient.delete(`/admin/patients/${id}/`);
      fetchPatients();
    } catch (err) {
      setError(err.response?.data || { detail: "Unable to delete patient" });
    }
  };

  const handleSubmit = async (event) => {
    event.preventDefault();
    setError(null);
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
        email: form.email,
        password: form.password || undefined,
        name: form.name,
        age: Number(form.age),
        gender: form.gender,
        contact_info: contactInfo,
      };
      if (editingId) {
        await apiClient.put(`/admin/patients/${editingId}/`, payload);
      } else {
        await apiClient.post("/admin/patients/", payload);
      }
      resetForm();
      fetchPatients();
    } catch (err) {
      setError(err.response?.data || { detail: "Unable to save patient" });
    }
  };

  const totalPages = count ? Math.ceil(count / 10) : 1;

  return (
    <div>
      <h2>Manage Patients</h2>
      <div className="card">
        <form onSubmit={handleSubmit}>
          <h3>{editingId ? "Edit Patient" : "Create Patient"}</h3>
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
            Age
            <input type="number" name="age" value={form.age} min="0" onChange={handleChange} required />
          </label>
          <label>
            Gender
            <input type="text" name="gender" value={form.gender} onChange={handleChange} required />
          </label>
          <label>
            Contact Info (JSON)
            <textarea name="contact_info" value={form.contact_info} onChange={handleChange} />
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
            placeholder="Search patients"
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
                  <th>Age</th>
                  <th>Gender</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {patients.map((patient) => (
                  <tr key={patient.id}>
                    <td>{patient.name}</td>
                    <td>{patient.email}</td>
                    <td>{patient.age}</td>
                    <td>{patient.gender}</td>
                    <td>
                      <button type="button" className="secondary" onClick={() => handleEdit(patient)}>
                        Edit
                      </button>
                      <button type="button" onClick={() => handleDelete(patient.id)}>
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

export default AdminPatientsPage;
