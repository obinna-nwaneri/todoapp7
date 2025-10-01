import { Navbar, Nav, Container, Button } from 'react-bootstrap'
import { Link, NavLink, useNavigate } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'

const AppNavbar = () => {
  const { isAuthenticated, isAdmin, logout, user } = useAuth()
  const navigate = useNavigate()

  const handleLogout = () => {
    logout()
    navigate('/login')
  }

  return (
    <Navbar bg="dark" data-bs-theme="dark" expand="lg" className="mb-4">
      <Container>
        <Navbar.Brand as={Link} to={isAuthenticated ? '/dashboard' : '/login'}>
          Enterprise To-Do
        </Navbar.Brand>
        <Navbar.Toggle aria-controls="main-navbar" />
        <Navbar.Collapse id="main-navbar">
          <Nav className="me-auto">
            {isAuthenticated && (
              <Nav.Link as={NavLink} to="/dashboard">
                Dashboard
              </Nav.Link>
            )}
            {isAuthenticated && isAdmin && (
              <Nav.Link as={NavLink} to="/admin">
                Admin
              </Nav.Link>
            )}
          </Nav>
          <Nav>
            {isAuthenticated ? (
              <div className="d-flex align-items-center gap-2">
                <span className="text-light small">{user?.email}</span>
                <Button variant="outline-light" size="sm" onClick={handleLogout}>
                  Logout
                </Button>
              </div>
            ) : (
              <>
                <Nav.Link as={NavLink} to="/login">
                  Login
                </Nav.Link>
                <Nav.Link as={NavLink} to="/register">
                  Register
                </Nav.Link>
              </>
            )}
          </Nav>
        </Navbar.Collapse>
      </Container>
    </Navbar>
  )
}

export default AppNavbar
