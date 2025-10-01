import React, { useEffect, useState } from 'react';
import { Alert, Col, Row, Spinner, Table } from 'react-bootstrap';
import api from '../services/api';

export default function DashboardPage() {
  const [stats, setStats] = useState(null);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchStats = async () => {
      try {
        const response = await api.get('/admin/stats');
        setStats(response.data);
      } catch (err) {
        setError(err.response?.data?.message || 'Failed to load dashboard data');
      } finally {
        setLoading(false);
      }
    };

    fetchStats();
  }, []);

  if (loading) {
    return (
      <div className="text-center">
        <Spinner animation="border" />
      </div>
    );
  }

  if (error) {
    return <Alert variant="danger">{error}</Alert>;
  }

  return (
    <div>
      <h2 className="mb-4">Dashboard Overview</h2>
      <Row className="g-3 mb-4">
        <Col md={4}>
          <div className="p-4 bg-primary text-white rounded shadow-sm">
            <h5>Total Doctors</h5>
            <p className="display-6">{stats?.totals.doctors}</p>
          </div>
        </Col>
        <Col md={4}>
          <div className="p-4 bg-success text-white rounded shadow-sm">
            <h5>Total Patients</h5>
            <p className="display-6">{stats?.totals.patients}</p>
          </div>
        </Col>
        <Col md={4}>
          <div className="p-4 bg-warning text-white rounded shadow-sm">
            <h5>Total Appointments</h5>
            <p className="display-6">{stats?.totals.appointments}</p>
          </div>
        </Col>
      </Row>

      <Row className="g-3">
        <Col md={6}>
          <div className="border rounded p-3 h-100">
            <h5>Appointments Per Doctor</h5>
            <Table striped bordered size="sm" className="mt-3">
              <thead>
                <tr>
                  <th>Doctor</th>
                  <th>Total</th>
                </tr>
              </thead>
              <tbody>
                {stats?.appointmentsPerDoctor?.map((row) => (
                  <tr key={row.doctor}>
                    <td>{row.doctor}</td>
                    <td>{row.total}</td>
                  </tr>
                ))}
              </tbody>
            </Table>
          </div>
        </Col>
        <Col md={6}>
          <div className="border rounded p-3 h-100">
            <h5>Upcoming Appointments</h5>
            <Table striped bordered size="sm" className="mt-3">
              <thead>
                <tr>
                  <th>Doctor</th>
                  <th>Patient</th>
                  <th>Date</th>
                  <th>Time</th>
                  <th>Status</th>
                </tr>
              </thead>
              <tbody>
                {stats?.upcomingAppointments?.map((appointment) => (
                  <tr key={appointment.id}>
                    <td>{appointment.doctor.name}</td>
                    <td>{appointment.patient.name}</td>
                    <td>{appointment.date}</td>
                    <td>{appointment.time}</td>
                    <td>{appointment.status}</td>
                  </tr>
                ))}
              </tbody>
            </Table>
          </div>
        </Col>
      </Row>
    </div>
  );
}
