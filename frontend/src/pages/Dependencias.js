import { useState, useEffect } from 'react';
import { Container, Table, Button, Modal, Form, Alert, Badge } from 'react-bootstrap';
import api from '../api/axios';

export default function Dependencias() {
  const [deps, setDeps] = useState([]);
  const [show, setShow] = useState(false);
  const [editing, setEditing] = useState(null);
  const [form, setForm] = useState({ nombre: '', descripcion: '' });
  const [error, setError] = useState('');

  const fetch = async () => {
    try { const r = await api.get('/dependencias/'); setDeps(r.data); }
    catch { setError('Error al cargar'); }
  };

  useEffect(() => { fetch(); }, []);

  const openNew = () => { setEditing(null); setForm({ nombre: '', descripcion: '' }); setShow(true); };
  const openEdit = (d) => { setEditing(d); setForm({ nombre: d.nombre, descripcion: d.descripcion || '' }); setShow(true); };

  const handleSave = async () => {
    try {
      if (editing) await api.put(`/dependencias/${editing.id}`, form);
      else await api.post('/dependencias/', form);
      setShow(false); fetch();
    } catch (err) { setError(err.response?.data?.detail || 'Error al guardar'); }
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Desactivar esta dependencia?')) return;
    try { await api.delete(`/dependencias/${id}`); fetch(); }
    catch (err) { setError(err.response?.data?.detail || 'Error'); }
  };

  return (
    <Container className="mt-4">
      <div className="d-flex justify-content-between align-items-center mb-3">
        <h2>Dependencias</h2>
        <Button onClick={openNew}>+ Nueva</Button>
      </div>
      {error && <Alert variant="danger" dismissible onClose={() => setError('')}>{error}</Alert>}
      <Table striped bordered hover>
        <thead className="table-dark">
          <tr><th>ID</th><th>Nombre</th><th>Descripcion</th><th>Estado</th><th>Acciones</th></tr>
        </thead>
        <tbody>
          {deps.map(d => (
            <tr key={d.id}>
              <td>{d.id}</td>
              <td>{d.nombre}</td>
              <td>{d.descripcion || '-'}</td>
              <td><Badge bg={d.activa ? 'success' : 'secondary'}>{d.activa ? 'Activa' : 'Inactiva'}</Badge></td>
              <td>
                <Button size="sm" variant="warning" className="me-1" onClick={() => openEdit(d)}>Editar</Button>
                <Button size="sm" variant="danger" onClick={() => handleDelete(d.id)}>Desactivar</Button>
              </td>
            </tr>
          ))}
        </tbody>
      </Table>
      <Modal show={show} onHide={() => setShow(false)} centered>
        <Modal.Header closeButton><Modal.Title>{editing ? 'Editar' : 'Nueva'} Dependencia</Modal.Title></Modal.Header>
        <Modal.Body>
          <Form.Group className="mb-3">
            <Form.Label>Nombre *</Form.Label>
            <Form.Control value={form.nombre} onChange={e => setForm({...form, nombre: e.target.value})} required />
          </Form.Group>
          <Form.Group>
            <Form.Label>Descripcion</Form.Label>
            <Form.Control as="textarea" rows={2} value={form.descripcion} onChange={e => setForm({...form, descripcion: e.target.value})} />
          </Form.Group>
        </Modal.Body>
        <Modal.Footer>
          <Button variant="secondary" onClick={() => setShow(false)}>Cancelar</Button>
          <Button onClick={handleSave}>Guardar</Button>
        </Modal.Footer>
      </Modal>
    </Container>
  );
}
