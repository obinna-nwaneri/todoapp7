import React, { useEffect, useState } from 'react';
import { Alert, Button, Form, Spinner, Table } from 'react-bootstrap';
import api from '../services/api';

const initialForm = { name: '', specialization: '', email: '', phone: '' };

export default function DoctorsPage() {
  const [doctors, setDoctors] = useState([]);
  const [form, setForm] = useState(initialForm);
  const [editingId, setEditingId] = useState(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');

  const loadDoctors = async () => {
    try {
      const response = await api.get('/doctors');
      setDoctors(response.data);
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to load doctors');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadDoctors();
  }, []);

  const handleChange = (event) => {
    setForm((prev) => ({ ...prev, [event.target.name]: event.target.value }));
  };

  const handleSubmit = async (event) => {
    event.preventDefault();
    setSaving(true);
    setError('');
    try {
      if (editingId) {
        await api.put(`/doctors/${editingId}`, form);
      } else {
        await api.post('/doctors', form);
      }
      setForm(initialForm);
      setEditingId(null);
      await loadDoctors();
    } catch (err) {
      setError(err.response?.data?.message || 'Unable to save doctor');
    } finally {
      setSaving(false);
    }
  };

  const handleEdit = (doctor) => {
    setEditingId(doctor.id);
    setForm({
      name: doctor.name,
      specialization: doctor.specialization,
      email: doctor.email,
      phone: doctor.phone,
    });
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Delete this doctor?')) return;
    try {
      await api.delete(`/doctors/${id}`);
      await loadDoctors();
    } catch (err) {
      setError(err.response?.data?.message || 'Unable to delete doctor');
    }
  };

  if (loading) {
    return (
      <div className="text-center">
        <Spinner animation="border" />
      </div>
    );
  }

  return (
    <div>
      <div className="d-flex justify-content-between align-items-center mb-3">
        <h2>Doctors</h2>
      </div>
      {error && <Alert variant="danger">{error}</Alert>}
      <div className="row">
        <div className="col-md-6">
          <Table striped bordered hover>
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
                  <td className="text-end">
                    <Button
                      variant="outline-secondary"
                      size="sm"
                      className="me-2"
                      onClick={() => handleEdit(doctor)}
                    >
                      Edit
                    </Button>
                    <Button
                      variant="outline-danger"
                      size="sm"
                      onClick={() => handleDelete(doctor.id)}
                    >
                      Delete
                    </Button>
                  </td>
                </tr>
              ))}
            </tbody>
          </Table>
        </div>
        <div className="col-md-6">
          <h4>{editingId ? 'Edit Doctor' : 'Add Doctor'}</h4>
          <Form onSubmit={handleSubmit}>
            <Form.Group className="mb-3" controlId="doctorName">
              <Form.Label>Name</Form.Label>
              <Form.Control
                name="name"
                value={form.name}
                onChange={handleChange}
                required
              />
            </Form.Group>
            <Form.Group className="mb-3" controlId="doctorSpecialization">
              <Form.Label>Specialization</Form.Label>
              <Form.Control
                name="specialization"
                value={form.specialization}
                onChange={handleChange}
                required
              />
            </Form.Group>
            <Form.Group className="mb-3" controlId="doctorEmail">
              <Form.Label>Email</Form.Label>
              <Form.Control
                type="email"
                name="email"
                value={form.email}
                onChange={handleChange}
                required
              />
            </Form.Group>
            <Form.Group className="mb-3" controlId="doctorPhone">
              <Form.Label>Phone</Form.Label>
              <Form.Control
                name="phone"
                value={form.phone}
                onChange={handleChange}
                required
              />
            </Form.Group>
            <div className="d-flex gap-2">
              <Button type="submit" disabled={saving}>
                {saving ? 'Saving…' : 'Save'}
              </Button>
              {editingId && (
                <Button
                  variant="secondary"
                  type="button"
                  onClick={() => {
                    setEditingId(null);
                    setForm(initialForm);
                  }}
                >
                  Cancel
                </Button>
              )}
            </div>
          </Form>
        </div>
      </div>
    </div>
  );
}
