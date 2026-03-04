import { Navbar, Nav, Container, NavDropdown, Badge } from 'react-bootstrap';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
export default function AppNavbar() {
  const { user, logout, isAdmin } = useAuth();
  const navigate = useNavigate();
  const handleLogout = () => { logout(); navigate('/login'); };
  return (
    <Navbar bg="dark" variant="dark" expand="lg">
      <Container>
        <Navbar.Brand as={Link} to="/">Registro de Personas</Navbar.Brand>
        <Navbar.Toggle />
        <Navbar.Collapse>
          <Nav className="me-auto">
            <Nav.Link as={Link} to="/personas">Personas</Nav.Link>
            {isAdmin && <Nav.Link as={Link} to="/dependencias">Dependencias</Nav.Link>}
            {isAdmin && <Nav.Link as={Link} to="/usuarios">Usuarios</Nav.Link>}
          </Nav>
          <Nav>
            <NavDropdown title={<span>{user?.username} <Badge bg="secondary">{user?.role}</Badge></span>} align="end">
              <NavDropdown.Item onClick={handleLogout}>Cerrar sesion</NavDropdown.Item>
            </NavDropdown>
          </Nav>
        </Navbar.Collapse>
      </Container>
    </Navbar>
  );
}
