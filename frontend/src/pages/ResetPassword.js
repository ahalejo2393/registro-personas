import { useState } from 'react';
import { Container, Card, Form, Button, Alert } from 'react-bootstrap';
import { useSearchParams, Link } from 'react-router-dom';
import api from '../api/axios';

export default function ResetPassword() {
  const [params] = useSearchParams();
  const token = params.get('token');
  const [form, setForm] = useState({ new_password: '', confirm: '' });
  const [msg, setMsg] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (form.new_password !== form.confirm) { setError('Las contrasenas no coinciden'); return; }
    setLoading(true); setError('');
    try {
      const res = await api.post('/auth/reset-password', { token, new_password: form.new_password });
      setMsg(res.data.message);
    } catch (err) {
      setError(err.response?.data?.detail || 'Token invalido o expirado');
    } finally { setLoading(false); }
  };

  if (!token) return (
    <Container className="d-flex justify-content-center align-items-center" style={{ minHeight: '100vh' }}>
      <Alert variant="danger">Token no encontrado. <Link to="/forgot-password">Solicitar nuevo enlace</Link></Alert>
    </Container>
  );

  return (
    <Container className="d-flex justify-content-center align-items-center" style={{ minHeight: '100vh' }}>
      <Card style={{ width: 400 }} className="shadow">
        <Card.Body className="p-4">
          <h4 className="text-center mb-4">Nueva contrasena</h4>
          {msg && <Alert variant="success">{msg} <Link to="/login">Ir al login</Link></Alert>}
          {error && <Alert variant="danger">{error}</Alert>}
          {!msg && (
            <Form onSubmit={handleSubmit}>
              <Form.Group className="mb-3">
                <Form.Label>Nueva contrasena</Form.Label>
                <Form.Control type="password" value={form.new_password} onChange={e => setForm({...form, new_password: e.target.value})} required />
                <Form.Text className="text-muted">Min. 8 caracteres, una mayuscula y un numero</Form.Text>
              </Form.Group>
              <Form.Group className="mb-3">
                <Form.Label>Confirmar contrasena</Form.Label>
                <Form.Control type="password" value={form.confirm} onChange={e => setForm({...form, confirm: e.target.value})} required />
              </Form.Group>
              <Button type="submit" className="w-100" disabled={loading}>
                {loading ? 'Guardando...' : 'Cambiar contrasena'}
              </Button>
            </Form>
          )}
        </Card.Body>
      </Card>
    </Container>
  );
}
