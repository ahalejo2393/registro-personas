from pydantic import BaseModel, EmailStr, field_validator, ConfigDict
from typing import Optional
from datetime import datetime
from app.models.models import RoleEnum
import re

# ── AUTH ──────────────────────────────────────────────────────────────────────
class LoginRequest(BaseModel):
    username: str
    password: str

class TokenResponse(BaseModel):
    access_token: str
    token_type: str = "bearer"
    role: str
    username: str

class ForgotPasswordRequest(BaseModel):
    email: EmailStr

class ResetPasswordRequest(BaseModel):
    token: str
    new_password: str

    @field_validator("new_password")
    @classmethod
    def password_strength(cls, v):
        if len(v) < 8:
            raise ValueError("La contraseña debe tener al menos 8 caracteres")
        if not re.search(r"[A-Z]", v):
            raise ValueError("Debe contener al menos una mayúscula")
        if not re.search(r"\d", v):
            raise ValueError("Debe contener al menos un número")
        return v

# ── USERS ─────────────────────────────────────────────────────────────────────
class UserCreate(BaseModel):
    username: str
    email: EmailStr
    password: str
    role: RoleEnum = RoleEnum.OPERADOR

class UserUpdate(BaseModel):
    email: Optional[EmailStr] = None
    role: Optional[RoleEnum] = None
    is_active: Optional[bool] = None

class UserResponse(BaseModel):
    model_config = ConfigDict(from_attributes=True)
    id: int
    username: str
    email: str
    role: RoleEnum
    is_active: bool
    created_at: datetime

# ── DEPENDENCIAS ──────────────────────────────────────────────────────────────
class DependenciaCreate(BaseModel):
    nombre: str
    descripcion: Optional[str] = None

class DependenciaUpdate(BaseModel):
    nombre: Optional[str] = None
    descripcion: Optional[str] = None
    activa: Optional[bool] = None

class DependenciaResponse(BaseModel):
    model_config = ConfigDict(from_attributes=True)
    id: int
    nombre: str
    descripcion: Optional[str]
    activa: bool

# ── PERSONAS ──────────────────────────────────────────────────────────────────
class PersonaCreate(BaseModel):
    nombre_apellido: str
    documento: str
    dependencia_id: int

    @field_validator("documento")
    @classmethod
    def validate_documento(cls, v):
        v = v.strip()
        if not re.match(r"^[A-Za-z0-9\-\.]{5,20}$", v):
            raise ValueError("Documento inválido (5-20 caracteres alfanuméricos)")
        return v

class PersonaUpdate(BaseModel):
    nombre_apellido: Optional[str] = None
    documento: Optional[str] = None
    dependencia_id: Optional[int] = None

class PersonaResponse(BaseModel):
    model_config = ConfigDict(from_attributes=True)
    id: int
    nombre_apellido: str
    documento: str
    dependencia_id: int
    dependencia: DependenciaResponse
    foto_path: Optional[str]
    creado_por: int
    modificado_por: Optional[int]
    fecha_creacion: datetime
    fecha_modificacion: Optional[datetime]

class PersonaListResponse(BaseModel):
    model_config = ConfigDict(from_attributes=True)
    id: int
    nombre_apellido: str
    documento: str
    dependencia: DependenciaResponse
    foto_path: Optional[str]
    fecha_creacion: datetime

class MessageResponse(BaseModel):
    message: str
