import { useState, useEffect } from 'react';
import { Container, Table, Button, Modal, Form, Alert, Badge } from 'react-bootstrap';
import api from '../api/axios';

const ROLES = ['ADMIN', 'OPERADOR', 'CONSULTA'];

export default function Usuarios() {
  const [users, setUsers] = useState([]);
  const [show, setShow] = useState(false);
  const [editing, setEditing] = useState(null);
  const [form, setForm] = useState({ username: '', email: '', password: '', role: 'OPERADOR' });
  const [error, setError] = useState('');

  const fetchUsers = async () => {
    try { const r = await api.get('/users/'); setUsers(r.data); }
    catch { setError('Error al cargar usuarios'); }
  };

  useEffect(() => { fetchUsers(); }, []);

  const openNew = () => { setEditing(null); setForm({ username: '', email: '', password: '', role: 'OPERADOR' }); setShow(true); };
  const openEdit = (u) => { setEditing(u); setForm({ email: u.email, role: u.role, is_active: u.is_active }); setShow(true); };

  const handleSave = async () => {
    try {
      if (editing) await api.put('/users/' + editing.id, { email: form.email, role: form.role, is_active: form.is_active });
      else await api.post('/users/', form);
      setShow(false); fetchUsers();
    } catch (err) { setError(err.response?.data?.detail || 'Error al guardar'); }
  };

  const roleColor = { ADMIN: 'danger', OPERADOR: 'primary', CONSULTA: 'secondary' };

  return (
    <Container className="mt-4">
      <div className="d-flex justify-content-between align-items-center mb-3">
        <h2>Usuarios</h2>
        <Button onClick={openNew}>+ Nuevo usuario</Button>
      </div>
      {error && <Alert variant="danger" dismissible onClose={() => setError('')}>{error}</Alert>}
      <Table striped bordered hover>
        <thead className="table-dark">
          <tr><th>ID</th><th>Usuario</th><th>Email</th><th>Rol</th><th>Estado</th><th>Acciones</th></tr>
        </thead>
        <tbody>
          {users.map(u => (
            <tr key={u.id}>
              <td>{u.id}</td>
              <td>{u.username}</td>
              <td>{u.email}</td>
              <td><Badge bg={roleColor[u.role] || 'secondary'}>{u.role}</Badge></td>
              <td><Badge bg={u.is_active ? 'success' : 'secondary'}>{u.is_active ? 'Activo' : 'Inactivo'}</Badge></td>
              <td><Button size="sm" variant="warning" onClick={() => openEdit(u)}>Editar</Button></td>
            </tr>
          ))}
        </tbody>
      </Table>
      <Modal show={show} onHide={() => setShow(false)} centered>
        <Modal.Header closeButton><Modal.Title>{editing ? 'Editar' : 'Nuevo'} Usuario</Modal.Title></Modal.Header>
        <Modal.Body>
          {!editing && (
            <Form.Group className="mb-3">
              <Form.Label>Username</Form.Label>
              <Form.Control value={form.username} onChange={e => setForm({...form, username: e.target.value})} />
            </Form.Group>
          )}
          <Form.Group className="mb-3">
            <Form.Label>Email</Form.Label>
            <Form.Control type="email" value={form.email} onChange={e => setForm({...form, email: e.target.value})} />
          </Form.Group>
          {!editing && (
            <Form.Group className="mb-3">
              <Form.Label>Contrasena</Form.Label>
              <Form.Control type="password" value={form.password} onChange={e => setForm({...form, password: e.target.value})} />
            </Form.Group>
          )}
          <Form.Group className="mb-3">
            <Form.Label>Rol</Form.Label>
            <Form.Select value={form.role} onChange={e => setForm({...form, role: e.target.value})}>
              {ROLES.map(r => <option key={r} value={r}>{r}</option>)}
            </Form.Select>
          </Form.Group>
          {editing && (
            <Form.Group>
              <Form.Check type="switch" label="Usuario activo" checked={form.is_active || false}
                onChange={e => setForm({...form, is_active: e.target.checked})} />
            </Form.Group>
          )}
        </Modal.Body>
        <Modal.Footer>
          <Button variant="secondary" onClick={() => setShow(false)}>Cancelar</Button>
          <Button onClick={handleSave}>Guardar</Button>
        </Modal.Footer>
      </Modal>
    </Container>
  );
}
