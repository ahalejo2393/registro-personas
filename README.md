# Registro de Personas

Sistema web completo para administrar un registro de personas con control de acceso por roles.

**Stack:** React 18 + Bootstrap 5 | FastAPI | PostgreSQL | SQLAlchemy | JWT

---

## Estructura del proyecto

```
registro-personas/
backend/
  app/
    api/v1/endpoints/  -> auth.py, users.py, dependencias.py, personas.py
    core/              -> config.py, security.py, deps.py
    db/                -> database.py, seed.py
    models/            -> models.py (User, Persona, Dependencia, PasswordResetToken)
    schemas/           -> schemas.py (Pydantic v2)
    services/          -> email_service.py
    utils/             -> file_utils.py
    main.py
  alembic/
  requirements.txt
  .env.example
frontend/
  src/
    api/axios.js
    context/AuthContext.js
    components/common/ -> Navbar.js, ProtectedRoute.js
    pages/             -> Login, ForgotPassword, ResetPassword,
                          PersonasList, PersonaForm, PersonaDetail,
                          Dependencias, Usuarios
    App.js
  package.json
```

---

## Instalacion Backend

```bash
cd backend
createdb registro_db
cp .env.example .env
# Editar .env con tus valores
pip install -r requirements.txt
alembic upgrade head
uvicorn app.main:app --reload --port 8000
```

El usuario ADMIN se crea automaticamente al arrancar el servidor.
Swagger/docs disponible en http://localhost:8000/docs

## Instalacion Frontend

```bash
cd frontend
cp .env.example .env
npm install
npm start
```

App en http://localhost:3000

---

## Variables de entorno (.env)

DATABASE_URL=postgresql://user:pass@localhost:5432/registro_db
SECRET_KEY=clave-secreta-cambiar-en-produccion
ADMIN_USERNAME=admin
ADMIN_EMAIL=admin@example.com
ADMIN_PASSWORD=Admin123!
SMTP_HOST=smtp.gmail.com
SMTP_PORT=587
SMTP_USER= (dejar vacio para modo consola)
SMTP_PASS=
FROM_EMAIL=noreply@example.com
FRONTEND_URL=http://localhost:3000
CONSOLE_EMAIL_MODE=true  (imprime link reset en consola en dev)
PASSWORD_RESET_EXPIRE_MINUTES=30
MAX_FILE_SIZE_MB=5

---

## Endpoints

POST   /auth/login              (publico, rate limit 5/min)
GET    /auth/me                 (autenticado)
POST   /auth/forgot-password    (publico, rate limit 3/min)
POST   /auth/reset-password     (publico)
GET    /users/                  (ADMIN)
POST   /users/                  (ADMIN)
PUT    /users/{id}              (ADMIN)
DELETE /users/{id}              (ADMIN)
GET    /dependencias/           (autenticado)
POST   /dependencias/           (ADMIN)
PUT    /dependencias/{id}       (ADMIN)
DELETE /dependencias/{id}       (ADMIN - desactiva)
GET    /personas/               (autenticado, filtros: nombre/documento/dependencia_id)
POST   /personas/               (OPERADOR+)
GET    /personas/{id}           (autenticado)
PUT    /personas/{id}           (OPERADOR+)
DELETE /personas/{id}           (ADMIN)
POST   /personas/{id}/foto      (OPERADOR+)
GET    /personas/{id}/foto      (autenticado)

---

## Seguridad implementada

- Contrasenas con bcrypt
- JWT con expiracion configurable
- Token reset: SHA-256 hash, un solo uso, expira en N minutos
- Rate limiting en login y forgot-password
- CORS configurado para React
- Validacion Pydantic en todos los inputs
- Fotos con nombre UUID (evita path traversal)
- Respuesta generica en forgot-password (no revela emails)
- Logs de eventos sensibles (login, reset)

---

## Produccion

1. Generar SECRET_KEY segura: openssl rand -hex 32
2. Configurar SMTP real y CONSOLE_EMAIL_MODE=false
3. Limitar CORS a dominio del frontend
4. Usar nginx + HTTPS
5. Configurar backups de DB y directorio uploads/