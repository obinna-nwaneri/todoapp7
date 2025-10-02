import { useEffect, useState } from "react";
import api from "../../api/client";

export default function AdminDoctorsPage() {
  const [doctors, setDoctors] = useState(null);
  const [query, setQuery] = useState("");
  const [page, setPage] = useState(1);
  const [form, setForm] = useState({
    email: "",
    password: "",
    name: "",
    specialization: "",
    years_experience: 0,
    bio: "",
    contact_info: "",
  });
  const [message, setMessage] = useState(null);

  const loadDoctors = async (pageNumber = 1, search = query) => {
    const { data } = await api.get("/admin/doctors/", {
      params: { page: pageNumber, search },
    });
    setDoctors(data);
    setPage(pageNumber);
  };

  useEffect(() => {
    loadDoctors(1, query);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const handleSearch = (e) => {
    e.preventDefault();
    loadDoctors(1, query);
  };

  const handleCreate = async (e) => {
    e.preventDefault();
    await api.post("/admin/doctors/", form);
    setMessage("Doctor added");
    setForm({ email: "", password: "", name: "", specialization: "", years_experience: 0, bio: "", contact_info: "" });
    loadDoctors(page, query);
  };

  const toggleActive = async (userId, current) => {
    await api.post(`/auth/admin/user/${userId}/toggle`, { is_active: !current });
    loadDoctors(page, query);
  };

  if (!doctors) {
    return <div className="center">Loading...</div>;
  }

  return (
    <div>
      <h2>Doctors</h2>
      {message ? <div className="success">{message}</div> : null}
      <form onSubmit={handleCreate}>
        <div className="card" style={{ padding: "1rem", display: "grid", gap: "0.5rem" }}>
          <strong>Add Doctor</strong>
          <input placeholder="Email" name="email" value={form.email} onChange={(e) => setForm({ ...form, email: e.target.value })} required />
          <input placeholder="Password" name="password" type="password" value={form.password} onChange={(e) => setForm({ ...form, password: e.target.value })} required />
          <input placeholder="Name" name="name" value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} required />
          <input placeholder="Specialization" name="specialization" value={form.specialization} onChange={(e) => setForm({ ...form, specialization: e.target.value })} required />
          <input placeholder="Years experience" name="years_experience" type="number" value={form.years_experience} onChange={(e) => setForm({ ...form, years_experience: e.target.value })} />
          <textarea placeholder="Bio" name="bio" value={form.bio} onChange={(e) => setForm({ ...form, bio: e.target.value })} />
          <textarea placeholder="Contact Info" name="contact_info" value={form.contact_info} onChange={(e) => setForm({ ...form, contact_info: e.target.value })} />
          <button className="btn-primary" type="submit">
            Create Doctor
          </button>
        </div>
      </form>

      <form onSubmit={handleSearch} style={{ margin: "1rem 0" }}>
        <input value={query} onChange={(e) => setQuery(e.target.value)} placeholder="Search doctors" />
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
              <th>Specialization</th>
              <th>Experience</th>
              <th>Status</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {doctors.results.map((doctor) => (
              <tr key={doctor.id}>
                <td>{doctor.name}</td>
                <td>{doctor.email}</td>
                <td>{doctor.specialization}</td>
                <td>{doctor.years_experience}</td>
                <td>{doctor.is_active ? "Active" : "Inactive"}</td>
                <td>
                  <div className="actions">
                    <button
                      className="btn-secondary"
                      type="button"
                      onClick={() => toggleActive(doctor.user_id, doctor.is_active)}
                    >
                      {doctor.is_active ? "Deactivate" : "Activate"}
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
            disabled={!doctors.previous}
            onClick={() => loadDoctors(page - 1, query)}
            type="button"
          >
            Previous
          </button>
          <button
            className="btn-secondary"
            disabled={!doctors.next}
            onClick={() => loadDoctors(page + 1, query)}
            type="button"
          >
            Next
          </button>
        </div>
      </div>
    </div>
  );
}
