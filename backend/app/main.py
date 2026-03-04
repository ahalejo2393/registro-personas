from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from slowapi import Limiter, _rate_limit_exceeded_handler
from slowapi.util import get_remote_address
from slowapi.errors import RateLimitExceeded
from app.api.v1.endpoints import auth, users, dependencias, personas
from app.db.database import engine
from app.models import models
from app.db.seed import seed_admin

models.Base.metadata.create_all(bind=engine)

limiter = Limiter(key_func=get_remote_address)

app = FastAPI(title="Registro de Personas", version="1.0.0")
app.state.limiter = limiter
app.add_exception_handler(RateLimitExceeded, _rate_limit_exceeded_handler)

app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:3000"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(auth.router, prefix="/auth", tags=["auth"])
app.include_router(users.router, prefix="/users", tags=["users"])
app.include_router(dependencias.router, prefix="/dependencias", tags=["dependencias"])
app.include_router(personas.router, prefix="/personas", tags=["personas"])

@app.on_event("startup")
def startup():
    from app.db.database import SessionLocal
    db = SessionLocal()
    try:
        seed_admin(db)
    finally:
        db.close()

@app.get("/health")
def health():
    return {"status": "ok"}
