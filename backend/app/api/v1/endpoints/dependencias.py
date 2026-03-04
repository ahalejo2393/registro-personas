from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from typing import List
from app.db.database import get_db
from app.core.deps import require_admin, get_current_user
from app.models.models import Dependencia
from app.schemas.schemas import DependenciaCreate, DependenciaUpdate, DependenciaResponse

router = APIRouter()

@router.get("/", response_model=List[DependenciaResponse])
def list_dependencias(db: Session = Depends(get_db), _=Depends(get_current_user)):
    return db.query(Dependencia).filter(Dependencia.activa == True).all()

@router.post("/", response_model=DependenciaResponse, status_code=201)
def create_dependencia(body: DependenciaCreate, db: Session = Depends(get_db), _=Depends(require_admin)):
    if db.query(Dependencia).filter(Dependencia.nombre == body.nombre).first():
        raise HTTPException(status_code=400, detail="La dependencia ya existe")
    dep = Dependencia(**body.model_dump())
    db.add(dep)
    db.commit()
    db.refresh(dep)
    return dep

@router.put("/{dep_id}", response_model=DependenciaResponse)
def update_dependencia(dep_id: int, body: DependenciaUpdate, db: Session = Depends(get_db), _=Depends(require_admin)):
    dep = db.query(Dependencia).filter(Dependencia.id == dep_id).first()
    if not dep:
        raise HTTPException(status_code=404, detail="Dependencia no encontrada")
    for k, v in body.model_dump(exclude_none=True).items():
        setattr(dep, k, v)
    db.commit()
    db.refresh(dep)
    return dep

@router.delete("/{dep_id}", status_code=204)
def delete_dependencia(dep_id: int, db: Session = Depends(get_db), _=Depends(require_admin)):
    dep = db.query(Dependencia).filter(Dependencia.id == dep_id).first()
    if not dep:
        raise HTTPException(status_code=404, detail="Dependencia no encontrada")
    dep.activa = False
    db.commit()
