import { useEffect, useState } from "react";

import api from "../api";

const initialForm = { name: "", email: "", phone: "" };

export default function PatientsPage() {
  const [patients, setPatients] = useState([]);
  const [form, setForm] = useState(initialForm);
  const [editingId, setEditingId] = useState(null);
  const [message, setMessage] = useState(null);

  const loadPatients = async () => {
    try {
      const response = await api.get("/patients");
      setPatients(response.data);
    } catch (err) {
      console.error(err);
      setMessage("Unable to load patients.");
    }
  };

  useEffect(() => {
    loadPatients();
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
        await api.put(`/patients/${editingId}/`, form);
        setMessage("Patient updated successfully");
      } else {
        await api.post("/patients/", form);
        setMessage("Patient added successfully");
      }
      setForm(initialForm);
      setEditingId(null);
      loadPatients();
    } catch (err) {
      console.error(err);
      setMessage("Unable to save patient. Admin access may be required.");
    }
  };

  const handleEdit = (patient) => {
    setMessage(null);
    setEditingId(patient.id);
    setForm({ name: patient.name, email: patient.email, phone: patient.phone });
  };

  return (
    <div className="container">
      <div className="d-flex justify-content-between align-items-center mb-3">
        <h1>Patients</h1>
      </div>
      {message && <div className="alert alert-info">{message}</div>}
      <div className="row g-4">
        <div className="col-md-7">
          <div className="card shadow">
            <div className="card-body">
              <h5 className="card-title">Patient List</h5>
              <div className="table-responsive">
                <table className="table table-striped">
                  <thead>
                    <tr>
                      <th>Name</th>
                      <th>Email</th>
                      <th>Phone</th>
                      <th></th>
                    </tr>
                  </thead>
                  <tbody>
                    {patients.map((patient) => (
                      <tr key={patient.id}>
                        <td>{patient.name}</td>
                        <td>{patient.email}</td>
                        <td>{patient.phone}</td>
                        <td className="table-actions">
                          <button
                            className="btn btn-sm btn-outline-primary"
                            onClick={() => handleEdit(patient)}
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
                {editingId ? "Edit Patient" : "Add Patient"}
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
