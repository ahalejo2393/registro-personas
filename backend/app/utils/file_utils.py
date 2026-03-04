import os
import uuid
from pathlib import Path
from fastapi import UploadFile, HTTPException
from PIL import Image
from app.core.config import settings

ALLOWED_TYPES = {"image/jpeg", "image/png"}
ALLOWED_EXTENSIONS = {".jpg", ".jpeg", ".png"}

def validate_and_save_image(file: UploadFile) -> str:
    if file.content_type not in ALLOWED_TYPES:
        raise HTTPException(status_code=400, detail="Solo se permiten archivos JPG o PNG")

    content = file.file.read()
    file.file.seek(0)

    max_bytes = settings.MAX_FILE_SIZE_MB * 1024 * 1024
    if len(content) > max_bytes:
        raise HTTPException(status_code=400, detail=f"El archivo supera el límite de {settings.MAX_FILE_SIZE_MB}MB")

    try:
        from io import BytesIO
        img = Image.open(BytesIO(content))
        img.verify()
    except Exception:
        raise HTTPException(status_code=400, detail="Archivo de imagen inválido o corrupto")

    upload_dir = Path(settings.UPLOAD_DIR)
    upload_dir.mkdir(parents=True, exist_ok=True)

    ext = ".jpg" if file.content_type == "image/jpeg" else ".png"
    filename = f"{uuid.uuid4()}{ext}"
    file_path = upload_dir / filename

    with open(file_path, "wb") as f:
        f.write(content)

    return str(filename)

def delete_image(filename: str):
    if not filename:
        return
    safe_name = Path(filename).name
    file_path = Path(settings.UPLOAD_DIR) / safe_name
    if file_path.exists():
        file_path.unlink()
