import React from 'react';
import { Container, Nav, Navbar } from 'react-bootstrap';
import { Link, Outlet, useLocation } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth';

export default function AdminLayout() {
  const location = useLocation();
  const { user, logout } = useAuth();

  const isActive = (path) => location.pathname === path;

  return (
    <div className="bg-light min-vh-100">
      <Navbar bg="dark" variant="dark" expand="lg" className="mb-3">
        <Container fluid>
          <Navbar.Brand as={Link} to="/dashboard">
            Doctor Admin
          </Navbar.Brand>
          <div className="d-flex align-items-center text-white">
            <span className="me-3">{user?.email}</span>
            <button className="btn btn-outline-light btn-sm" onClick={logout}>
              Logout
            </button>
          </div>
        </Container>
      </Navbar>
      <Container fluid>
        <div className="row">
          <div className="col-md-2 mb-3">
            <Nav className="flex-column bg-white p-3 rounded shadow-sm">
              <Nav.Link as={Link} to="/dashboard" active={isActive('/dashboard')}>
                Dashboard
              </Nav.Link>
              <Nav.Link as={Link} to="/doctors" active={isActive('/doctors')}>
                Doctors
              </Nav.Link>
              <Nav.Link as={Link} to="/patients" active={isActive('/patients')}>
                Patients
              </Nav.Link>
              <Nav.Link as={Link} to="/appointments" active={isActive('/appointments')}>
                Appointments
              </Nav.Link>
            </Nav>
          </div>
          <div className="col-md-10">
            <div className="bg-white p-4 rounded shadow-sm mb-4">
              <Outlet />
            </div>
          </div>
        </div>
      </Container>
    </div>
  );
}
