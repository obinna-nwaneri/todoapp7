import { useEffect, useState } from "react";

import api from "../api";

const initialForm = { name: "", specialization: "", email: "", phone: "" };

export default function DoctorsPage() {
  const [doctors, setDoctors] = useState([]);
  const [form, setForm] = useState(initialForm);
  const [editingId, setEditingId] = useState(null);
  const [message, setMessage] = useState(null);

  const loadDoctors = async () => {
    try {
      const response = await api.get("/doctors");
      setDoctors(response.data);
    } catch (err) {
      console.error(err);
      setMessage("Unable to load doctors.");
    }
  };

  useEffect(() => {
    loadDoctors();
  }, []);

  const handleChange = (event) => {
    const { name, value } = event.target;
    setForm((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (event) => {
    event.preventDefault();
    setMessage(null);
    try {
      if (editingId) {
        await api.put(`/doctors/${editingId}/`, form);
        setMessage("Doctor updated successfully");
      } else {
        await api.post("/doctors/", form);
        setMessage("Doctor added successfully");
      }
      setForm(initialForm);
      setEditingId(null);
      loadDoctors();
    } catch (err) {
      console.error(err);
      setMessage("Unable to save doctor. Ensure you have admin access.");
    }
  };

  const handleEdit = (doctor) => {
    setMessage(null);
    setEditingId(doctor.id);
    setForm({
      name: doctor.name,
      specialization: doctor.specialization,
      email: doctor.email,
      phone: doctor.phone,
    });
  };

  return (
    <div className="container">
      <div className="d-flex justify-content-between align-items-center mb-3">
        <h1>Doctors</h1>
      </div>
      {message && <div className="alert alert-info">{message}</div>}
      <div className="row g-4">
        <div className="col-md-7">
          <div className="card shadow">
            <div className="card-body">
              <h5 className="card-title">Doctor List</h5>
              <div className="table-responsive">
                <table className="table table-striped">
                  <thead>
                    <tr>
                      <th>Name</th>
                      <th>Specialization</th>
                      <th>Email</th>
                      <th>Phone</th>
                      <th></th>
                    </tr>
                  </thead>
                  <tbody>
                    {doctors.map((doctor) => (
                      <tr key={doctor.id}>
                        <td>{doctor.name}</td>
                        <td>{doctor.specialization}</td>
                        <td>{doctor.email}</td>
                        <td>{doctor.phone}</td>
                        <td className="table-actions">
                          <button
                            className="btn btn-sm btn-outline-primary"
                            onClick={() => handleEdit(doctor)}
                          >
                            Edit
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        </div>
        <div className="col-md-5">
          <div className="card shadow">
            <div className="card-body">
              <h5 className="card-title">
                {editingId ? "Edit Doctor" : "Add Doctor"}
              </h5>
              <form onSubmit={handleSubmit}>
                <div className="mb-3">
                  <label className="form-label">Name</label>
                  <input
                    className="form-control"
                    name="name"
                    value={form.name}
                    onChange={handleChange}
                    required
                  />
                </div>
                <div className="mb-3">
                  <label className="form-label">Specialization</label>
                  <input
                    className="form-control"
                    name="specialization"
                    value={form.specialization}
                    onChange={handleChange}
                    required
                  />
                </div>
                <div className="mb-3">
                  <label className="form-label">Email</label>
                  <input
                    className="form-control"
                    type="email"
                    name="email"
                    value={form.email}
                    onChange={handleChange}
                    required
                  />
                </div>
                <div className="mb-3">
                  <label className="form-label">Phone</label>
                  <input
                    className="form-control"
                    name="phone"
                    value={form.phone}
                    onChange={handleChange}
                    required
                  />
                </div>
                <div className="d-flex gap-2">
                  <button className="btn btn-primary" type="submit">
                    {editingId ? "Update" : "Add"}
                  </button>
                  {editingId && (
                    <button
                      type="button"
                      className="btn btn-secondary"
                      onClick={() => {
                        setEditingId(null);
                        setForm(initialForm);
                      }}
                    >
                      Cancel
                    </button>
                  )}
                </div>
              </form>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
