import { useState, useEffect } from 'react';
import { Container, Card, Form, Button, Alert, Image, Row, Col } from 'react-bootstrap';
import { useNavigate, useParams } from 'react-router-dom';
import api from '../api/axios';

export default function PersonaForm() {
  const { id } = useParams();
  const isEdit = !!id;
  const navigate = useNavigate();
  const [form, setForm] = useState({ nombre_apellido: '', documento: '', dependencia_id: '' });
  const [dependencias, setDependencias] = useState([]);
  const [foto, setFoto] = useState(null);
  const [preview, setPreview] = useState(null);
  const [currentFoto, setCurrentFoto] = useState(null);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    api.get('/dependencias/').then(r => setDependencias(r.data));
    if (isEdit) {
      api.get(`/personas/${id}`).then(r => {
        const p = r.data;
        setForm({ nombre_apellido: p.nombre_apellido, documento: p.documento, dependencia_id: p.dependencia_id });
        if (p.foto_path) setCurrentFoto(`${process.env.REACT_APP_API_URL || 'http://localhost:8000'}/personas/${id}/foto`);
      });
    }
  }, [id]);

  const handleFotoChange = (e) => {
    const file = e.target.files[0];
    if (!file) return;
    if (!['image/jpeg', 'image/png'].includes(file.type)) { setError('Solo JPG o PNG'); return; }
    if (file.size > 5 * 1024 * 1024) { setError('Maximo 5MB'); return; }
    setFoto(file);
    setPreview(URL.createObjectURL(file));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true); setError('');
    try {
      let personaId = id;
      if (isEdit) {
        await api.put(`/personas/${id}`, form);
      } else {
        const res = await api.post('/personas/', form);
        personaId = res.data.id;
      }
      if (foto) {
        const fd = new FormData();
        fd.append('foto', foto);
        await api.post(`/personas/${personaId}/foto`, fd);
      }
      navigate(`/personas/${personaId}`);
    } catch (err) {
      setError(typeof err.response?.data?.detail === "string" ? err.response.data.detail : "Error al guardar");
    } finally { setLoading(false); }
  };

  return (
    <Container className="mt-4">
      <Card className="shadow-sm">
        <Card.Header><h4>{isEdit ? 'Editar Persona' : 'Nueva Persona'}</h4></Card.Header>
        <Card.Body>
          {error && <Alert variant="danger">{error}</Alert>}
          <Form onSubmit={handleSubmit}>
            <Row>
              <Col md={8}>
                <Form.Group className="mb-3">
                  <Form.Label>Nombre y Apellido *</Form.Label>
                  <Form.Control value={form.nombre_apellido} onChange={e => setForm({...form, nombre_apellido: e.target.value})} required />
                </Form.Group>
                <Form.Group className="mb-3">
                  <Form.Label>Documento *</Form.Label>
                  <Form.Control value={form.documento} onChange={e => setForm({...form, documento: e.target.value})} required />
                </Form.Group>
                <Form.Group className="mb-3">
                  <Form.Label>Dependencia *</Form.Label>
                  <Form.Select value={form.dependencia_id} onChange={e => setForm({...form, dependencia_id: e.target.value})} required>
                    <option value="">Seleccionar dependencia...</option>
                    {dependencias.map(d => <option key={d.id} value={d.id}>{d.nombre}</option>)}
                  </Form.Select>
                </Form.Group>
              </Col>
              <Col md={4}>
                <Form.Group className="mb-3">
                  <Form.Label>Foto (JPG/PNG, max 5MB)</Form.Label>
                  <Form.Control type="file" accept="image/jpeg,image/png" onChange={handleFotoChange} />
                </Form.Group>
                {(preview || currentFoto) && (
                  <div className="text-center">
                    <Image src={preview || currentFoto} thumbnail style={{ maxHeight: 200 }} />
                    {preview && <div className="text-success small mt-1">Nueva foto seleccionada</div>}
                  </div>
                )}
              </Col>
            </Row>
            <div className="d-flex gap-2">
              <Button type="submit" variant="primary" disabled={loading}>
                {loading ? 'Guardando...' : 'Guardar'}
              </Button>
              <Button variant="secondary" onClick={() => navigate(-1)}>Cancelar</Button>
            </div>
          </Form>
        </Card.Body>
      </Card>
    </Container>
  );
}
