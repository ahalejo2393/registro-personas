import os
from pathlib import Path
from typing import List, Optional
from fastapi import APIRouter, Depends, HTTPException, UploadFile, File, Query
from fastapi.responses import FileResponse
from sqlalchemy.orm import Session
from app.db.database import get_db
from app.core.deps import get_current_user, require_operador
from app.core.config import settings
from app.models.models import Persona, Dependencia, RoleEnum
from app.schemas.schemas import PersonaCreate, PersonaUpdate, PersonaResponse, PersonaListResponse
from app.utils.file_utils import validate_and_save_image, delete_image

router = APIRouter()

@router.get("/", response_model=List[PersonaListResponse])
def list_personas(
    nombre: Optional[str] = Query(None),
    documento: Optional[str] = Query(None),
    dependencia_id: Optional[int] = Query(None),
    skip: int = 0, limit: int = 50,
    db: Session = Depends(get_db),
    _=Depends(get_current_user)
):
    q = db.query(Persona)
    if nombre:
        q = q.filter(Persona.nombre_apellido.ilike(f"%{nombre}%"))
    if documento:
        q = q.filter(Persona.documento.ilike(f"%{documento}%"))
    if dependencia_id:
        q = q.filter(Persona.dependencia_id == dependencia_id)
    return q.offset(skip).limit(limit).all()

@router.post("/", response_model=PersonaResponse, status_code=201)
def create_persona(body: PersonaCreate, db: Session = Depends(get_db), current=Depends(require_operador)):
    if db.query(Persona).filter(Persona.documento == body.documento).first():
        raise HTTPException(status_code=400, detail="El documento ya esta registrado")
    if not db.query(Dependencia).filter(Dependencia.id == body.dependencia_id, Dependencia.activa == True).first():
        raise HTTPException(status_code=400, detail="Dependencia no encontrada")
    persona = Persona(**body.model_dump(), creado_por=current.id)
    db.add(persona)
    db.commit()
    db.refresh(persona)
    return persona

@router.get("/{persona_id}", response_model=PersonaResponse)
def get_persona(persona_id: int, db: Session = Depends(get_db), _=Depends(get_current_user)):
    persona = db.query(Persona).filter(Persona.id == persona_id).first()
    if not persona:
        raise HTTPException(status_code=404, detail="Persona no encontrada")
    return persona

@router.put("/{persona_id}", response_model=PersonaResponse)
def update_persona(persona_id: int, body: PersonaUpdate, db: Session = Depends(get_db), current=Depends(require_operador)):
    persona = db.query(Persona).filter(Persona.id == persona_id).first()
    if not persona:
        raise HTTPException(status_code=404, detail="Persona no encontrada")
    if body.documento and body.documento != persona.documento:
        if db.query(Persona).filter(Persona.documento == body.documento).first():
            raise HTTPException(status_code=400, detail="El documento ya esta registrado")
    for k, v in body.model_dump(exclude_none=True).items():
        setattr(persona, k, v)
    persona.modificado_por = current.id
    db.commit()
    db.refresh(persona)
    return persona

@router.delete("/{persona_id}", status_code=204)
def delete_persona(persona_id: int, db: Session = Depends(get_db), current=Depends(require_operador)):
    if current.role != RoleEnum.ADMIN:
        raise HTTPException(status_code=403, detail="Solo ADMIN puede eliminar personas")
    persona = db.query(Persona).filter(Persona.id == persona_id).first()
    if not persona:
        raise HTTPException(status_code=404, detail="Persona no encontrada")
    if persona.foto_path:
        delete_image(persona.foto_path)
    db.delete(persona)
    db.commit()

@router.post("/{persona_id}/foto")
def upload_foto(persona_id: int, foto: UploadFile = File(...), db: Session = Depends(get_db), current=Depends(require_operador)):
    persona = db.query(Persona).filter(Persona.id == persona_id).first()
    if not persona:
        raise HTTPException(status_code=404, detail="Persona no encontrada")
    if persona.foto_path:
        delete_image(persona.foto_path)
    filename = validate_and_save_image(foto)
    persona.foto_path = filename
    persona.modificado_por = current.id
    db.commit()
    return {"message": "Foto actualizada", "foto_path": filename}

@router.get("/{persona_id}/foto")
def get_foto(persona_id: int, db: Session = Depends(get_db), _=Depends(get_current_user)):
    persona = db.query(Persona).filter(Persona.id == persona_id).first()
    if not persona or not persona.foto_path:
        raise HTTPException(status_code=404, detail="Foto no encontrada")
    safe_name = Path(persona.foto_path).name
    file_path = Path(settings.UPLOAD_DIR) / safe_name
    if not file_path.exists():
        raise HTTPException(status_code=404, detail="Archivo no encontrado")
    return FileResponse(str(file_path))
