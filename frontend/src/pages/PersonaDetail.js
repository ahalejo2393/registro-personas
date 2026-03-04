import { useState, useEffect } from 'react';
import { Container, Card, Row, Col, Badge, Button, Image, Alert } from 'react-bootstrap';
import { useParams, Link } from 'react-router-dom';
import api from '../api/axios';

export default function PersonaDetail() {
  const { id } = useParams();
  const [persona, setPersona] = useState(null);
  const [error, setError] = useState('');
  const apiBase = process.env.REACT_APP_API_URL || 'http://localhost:8000';

  useEffect(() => {
    api.get(`/personas/${id}`).then(r => setPersona(r.data)).catch(() => setError('Persona no encontrada'));
  }, [id]);

  if (error) return <Container className="mt-4"><Alert variant="danger">{error}</Alert></Container>;
  if (!persona) return <Container className="mt-4"><p>Cargando...</p></Container>;

  return (
    <Container className="mt-4">
      <Card className="shadow-sm">
        <Card.Header className="d-flex justify-content-between align-items-center">
          <h4 className="mb-0">Detalle de Persona</h4>
          <div>
            <Button as={Link} to={`/personas/${id}/editar`} variant="warning" size="sm" className="me-2">Editar</Button>
            <Button as={Link} to="/personas" variant="secondary" size="sm">Volver</Button>
          </div>
        </Card.Header>
        <Card.Body>
          <Row>
            <Col md={4} className="text-center mb-3">
              {persona.foto_path ? (
                <Image src={`${apiBase}/personas/${id}/foto`} rounded style={{ maxWidth: '100%', maxHeight: 300 }} />
              ) : (
                <div className="bg-light d-flex align-items-center justify-content-center" style={{ height: 200, borderRadius: 8 }}>
                  <span className="text-muted">Sin foto</span>
                </div>
              )}
            </Col>
            <Col md={8}>
              <table className="table table-borderless">
                <tbody>
                  <tr><th>Nombre y Apellido</th><td>{persona.nombre_apellido}</td></tr>
                  <tr><th>Documento</th><td><Badge bg="secondary">{persona.documento}</Badge></td></tr>
                  <tr><th>Dependencia</th><td>{persona.dependencia?.nombre}</td></tr>
                  <tr><th>Fecha de alta</th><td>{new Date(persona.fecha_creacion).toLocaleString('es-AR')}</td></tr>
                  {persona.fecha_modificacion && (
                    <tr><th>Ultima modificacion</th><td>{new Date(persona.fecha_modificacion).toLocaleString('es-AR')}</td></tr>
                  )}
                </tbody>
              </table>
            </Col>
          </Row>
        </Card.Body>
      </Card>
    </Container>
  );
}
