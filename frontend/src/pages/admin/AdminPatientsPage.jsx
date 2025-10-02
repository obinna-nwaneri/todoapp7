import { useEffect, useState } from "react";
import api from "../../api/client";

export default function AdminPatientsPage() {
  const [patients, setPatients] = useState(null);
  const [query, setQuery] = useState("");
  const [page, setPage] = useState(1);
  const [form, setForm] = useState({ email: "", password: "", name: "", age: 0, gender: "", contact_info: "" });

  const loadPatients = async (pageNumber = 1, search = query) => {
    const { data } = await api.get("/admin/patients/", {
      params: { page: pageNumber, search },
    });
    setPatients(data);
    setPage(pageNumber);
  };

  useEffect(() => {
    loadPatients();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const handleCreate = async (e) => {
    e.preventDefault();
    await api.post("/admin/patients/", form);
    setForm({ email: "", password: "", name: "", age: 0, gender: "", contact_info: "" });
    loadPatients(page, query);
  };

  const toggleActive = async (userId, current) => {
    await api.post(`/auth/admin/user/${userId}/toggle`, { is_active: !current });
    loadPatients(page, query);
  };

  const handleSearch = (e) => {
    e.preventDefault();
    loadPatients(1, query);
  };

  if (!patients) {
    return <div className="center">Loading...</div>;
  }

  return (
    <div>
      <h2>Patients</h2>
      <form onSubmit={handleCreate}>
        <div className="card" style={{ padding: "1rem", display: "grid", gap: "0.5rem" }}>
          <strong>Add Patient</strong>
          <input placeholder="Email" value={form.email} onChange={(e) => setForm({ ...form, email: e.target.value })} required />
          <input placeholder="Password" type="password" value={form.password} onChange={(e) => setForm({ ...form, password: e.target.value })} required />
          <input placeholder="Name" value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} required />
          <input placeholder="Age" type="number" value={form.age} onChange={(e) => setForm({ ...form, age: e.target.value })} />
          <select value={form.gender} onChange={(e) => setForm({ ...form, gender: e.target.value })}>
            <option value="">Gender</option>
            <option value="MALE">Male</option>
            <option value="FEMALE">Female</option>
            <option value="OTHER">Other</option>
          </select>
          <textarea placeholder="Contact" value={form.contact_info} onChange={(e) => setForm({ ...form, contact_info: e.target.value })} />
          <button className="btn-primary" type="submit">
            Create Patient
          </button>
        </div>
      </form>

      <form onSubmit={handleSearch} style={{ margin: "1rem 0" }}>
        <input value={query} onChange={(e) => setQuery(e.target.value)} placeholder="Search patients" />
        <button className="btn-secondary" type="submit">
          Search
        </button>
      </form>

      <div className="table-wrapper">
        <table>
          <thead>
            <tr>
              <th>Name</th>
              <th>Email</th>
              <th>Age</th>
              <th>Gender</th>
              <th>Status</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {patients.results.map((patient) => (
              <tr key={patient.id}>
                <td>{patient.name}</td>
                <td>{patient.email}</td>
                <td>{patient.age}</td>
                <td>{patient.gender}</td>
                <td>{patient.is_active ? "Active" : "Inactive"}</td>
                <td>
                  <div className="actions">
                    <button
                      className="btn-secondary"
                      type="button"
                      onClick={() => toggleActive(patient.user_id, patient.is_active)}
                    >
                      {patient.is_active ? "Deactivate" : "Activate"}
                    </button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
        <div className="actions" style={{ marginTop: "1rem" }}>
          <button
            className="btn-secondary"
            disabled={!patients.previous}
            onClick={() => loadPatients(page - 1, query)}
            type="button"
          >
            Previous
          </button>
          <button
            className="btn-secondary"
            disabled={!patients.next}
            onClick={() => loadPatients(page + 1, query)}
            type="button"
          >
            Next
          </button>
        </div>
      </div>
    </div>
  );
}
