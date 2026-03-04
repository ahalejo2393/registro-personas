import { useState, useEffect } from 'react';
import { Container, Table, Button, Form, Row, Col, Badge, Modal, Alert } from 'react-bootstrap';
import { Link } from 'react-router-dom';
import api from '../api/axios';
import { useAuth } from '../context/AuthContext';

export default function PersonasList() {
  const [personas, setPersonas] = useState([]);
  const [dependencias, setDependencias] = useState([]);
  const [filters, setFilters] = useState({ nombre: '', documento: '', dependencia_id: '' });
  const [fechaDesde, setFechaDesde] = useState('');
  const [fechaHasta, setFechaHasta] = useState('');
  const [deleteId, setDeleteId] = useState(null);
  const [error, setError] = useState('');
  const { isAdmin } = useAuth();

  const fetchPersonas = async () => {
    try {
      const params = Object.fromEntries(Object.entries(filters).filter(([,v]) => v));
      const res = await api.get('/personas/', { params });
      setPersonas(res.data);
    } catch { setError('Error al cargar personas'); }
  };

  useEffect(() => {
    api.get('/dependencias/').then(r => setDependencias(r.data));
  }, []);

  useEffect(() => { fetchPersonas(); }, [filters]);

  const handleDelete = async () => {
    try {
      await api.delete('/personas/' + deleteId);
      setDeleteId(null);
      fetchPersonas();
    } catch (err) { setError(err.response?.data?.detail || 'Error al eliminar'); }
  };

  const personasFiltradas = () => {
    return personas.filter(p => {
      const fecha = new Date(p.fecha_creacion);
      if (fechaDesde && fecha < new Date(fechaDesde)) return false;
      if (fechaHasta) {
        const hasta = new Date(fechaHasta);
        hasta.setHours(23, 59, 59);
        if (fecha > hasta) return false;
      }
      return true;
    });
  };

  const exportarCSV = () => {
    const datos = personasFiltradas();
    if (datos.length === 0) { setError('No hay datos para exportar'); return; }

    const headers = ['ID', 'Nombre y Apellido', 'Documento', 'Dependencia', 'Fecha de Alta'];
    const filas = datos.map(p => [
      p.id,
      p.nombre_apellido,
      p.documento,
      p.dependencia?.nombre || '',
      new Date(p.fecha_creacion).toLocaleDateString('es-AR')
    ]);

    const csv = [headers, ...filas]
      .map(fila => fila.map(v => '"' + String(v).replace(/"/g, '""') + '"').join(','))
      .join('\n');

    const blob = new Blob(['\uFEFF' + csv], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    const hoy = new Date().toISOString().split('T')[0];
    link.download = 'personas_' + hoy + '.csv';
    link.click();
    URL.revokeObjectURL(url);
  };

  const limpiarFiltros = () => {
    setFilters({ nombre: '', documento: '', dependencia_id: '' });
    setFechaDesde('');
    setFechaHasta('');
  };

  const lista = personasFiltradas();

  return (
    <Container className="mt-4">
      <div className="d-flex justify-content-between align-items-center mb-3">
        <h2>Personas</h2>
        <div className="d-flex gap-2">
          <Button variant="success" onClick={exportarCSV}>Exportar CSV</Button>
          <Button as={Link} to="/personas/nuevo" variant="primary">+ Nueva persona</Button>
        </div>
      </div>
      {error && <Alert variant="danger" dismissible onClose={() => setError('')}>{error}</Alert>}

      <Row className="mb-2 g-2">
        <Col md={4}>
          <Form.Control placeholder="Buscar por nombre..." value={filters.nombre}
            onChange={e => setFilters({...filters, nombre: e.target.value})} />
        </Col>
        <Col md={3}>
          <Form.Control placeholder="Documento..." value={filters.documento}
            onChange={e => setFilters({...filters, documento: e.target.value})} />
        </Col>
        <Col md={3}>
          <Form.Select value={filters.dependencia_id} onChange={e => setFilters({...filters, dependencia_id: e.target.value})}>
            <option value="">Todas las dependencias</option>
            {dependencias.map(d => <option key={d.id} value={d.id}>{d.nombre}</option>)}
          </Form.Select>
        </Col>
        <Col md={2}>
          <Button variant="outline-secondary" className="w-100" onClick={limpiarFiltros}>Limpiar</Button>
        </Col>
      </Row>

      <Row className="mb-3 g-2 align-items-center">
        <Col md={1} className="text-muted small">Fecha alta:</Col>
        <Col md={3}>
          <Form.Control type="date" value={fechaDesde} onChange={e => setFechaDesde(e.target.value)}
            placeholder="Desde" title="Desde" />
        </Col>
        <Col md={3}>
          <Form.Control type="date" value={fechaHasta} onChange={e => setFechaHasta(e.target.value)}
            placeholder="Hasta" title="Hasta" />
        </Col>
        <Col md={2} className="text-muted small">
          {lista.length} resultado{lista.length !== 1 ? 's' : ''}
        </Col>
      </Row>

      <Table striped bordered hover responsive>
        <thead className="table-dark">
          <tr><th>ID</th><th>Nombre y Apellido</th><th>Documento</th><th>Dependencia</th><th>Fecha Alta</th><th>Acciones</th></tr>
        </thead>
        <tbody>
          {lista.length === 0 ? (
            <tr><td colSpan={6} className="text-center text-muted">No se encontraron personas</td></tr>
          ) : lista.map(p => (
            <tr key={p.id}>
              <td>{p.id}</td>
              <td>{p.nombre_apellido}</td>
              <td><Badge bg="secondary">{p.documento}</Badge></td>
              <td>{p.dependencia?.nombre}</td>
              <td>{new Date(p.fecha_creacion).toLocaleDateString('es-AR')}</td>
              <td>
                <Button size="sm" variant="info" as={Link} to={'/personas/' + p.id} className="me-1">Ver</Button>
                <Button size="sm" variant="warning" as={Link} to={'/personas/' + p.id + '/editar'} className="me-1">Editar</Button>
                {isAdmin && <Button size="sm" variant="danger" onClick={() => setDeleteId(p.id)}>Eliminar</Button>}
              </td>
            </tr>
          ))}
        </tbody>
      </Table>

      <Modal show={!!deleteId} onHide={() => setDeleteId(null)} centered>
        <Modal.Header closeButton><Modal.Title>Confirmar eliminacion</Modal.Title></Modal.Header>
        <Modal.Body>Desea eliminar esta persona? Esta accion no se puede deshacer.</Modal.Body>
        <Modal.Footer>
          <Button variant="secondary" onClick={() => setDeleteId(null)}>Cancelar</Button>
          <Button variant="danger" onClick={handleDelete}>Eliminar</Button>
        </Modal.Footer>
      </Modal>
    </Container>
  );
}
