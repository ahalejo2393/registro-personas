import { useState } from 'react';
import { Container, Card, Form, Button, Alert } from 'react-bootstrap';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import api from '../api/axios';

export default function Login() {
  const [form, setForm] = useState({ username: '', password: '' });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const { login } = useAuth();
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true); setError('');
    try {
      const res = await api.post('/auth/login', form);
      login(res.data.access_token, { username: res.data.username, role: res.data.role });
      navigate('/personas');
    } catch (err) {
      setError(err.response?.data?.detail || 'Error al iniciar sesion');
    } finally { setLoading(false); }
  };

  return (
    <Container className="d-flex justify-content-center align-items-center" style={{ minHeight: '100vh' }}>
      <Card style={{ width: 400 }} className="shadow">
        <Card.Body className="p-4">
          <h3 className="text-center mb-4">Registro de Personas</h3>
          {error && <Alert variant="danger">{error}</Alert>}
          <Form onSubmit={handleSubmit}>
            <Form.Group className="mb-3">
              <Form.Label>Usuario</Form.Label>
              <Form.Control value={form.username} onChange={e => setForm({...form, username: e.target.value})} required />
            </Form.Group>
            <Form.Group className="mb-3">
              <Form.Label>Contrasena</Form.Label>
              <Form.Control type="password" value={form.password} onChange={e => setForm({...form, password: e.target.value})} required />
            </Form.Group>
            <Button type="submit" className="w-100" disabled={loading}>
              {loading ? 'Ingresando...' : 'Ingresar'}
            </Button>
          </Form>
          <div className="text-center mt-3">
            <Link to="/forgot-password">Olvide mi contrasena</Link>
          </div>
        </Card.Body>
      </Card>
    </Container>
  );
}
