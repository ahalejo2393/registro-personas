import logging
from datetime import datetime, timedelta, timezone
from fastapi import APIRouter, Depends, HTTPException, status, Request
from sqlalchemy.orm import Session
from slowapi import Limiter
from slowapi.util import get_remote_address

from app.db.database import get_db
from app.core.security import (verify_password, create_access_token,
                                generate_reset_token, hash_token)
from app.core.deps import get_current_user
from app.core.config import settings
from app.models.models import User, PasswordResetToken
from app.schemas.schemas import (LoginRequest, TokenResponse, ForgotPasswordRequest,
                                  ResetPasswordRequest, MessageResponse, UserResponse)
from app.services.email_service import send_reset_password_email

router = APIRouter()
limiter = Limiter(key_func=get_remote_address)
logger = logging.getLogger(__name__)

@router.post("/login", response_model=TokenResponse)
@limiter.limit("5/minute")
def login(request: Request, body: LoginRequest, db: Session = Depends(get_db)):
    user = db.query(User).filter(User.username == body.username).first()
    if not user or not verify_password(body.password, user.hashed_password):
        logger.warning(f"Login fallido para username: {body.username} desde {request.client.host}")
        raise HTTPException(status_code=status.HTTP_401_UNAUTHORIZED, detail="Credenciales inválidas")
    if not user.is_active:
        raise HTTPException(status_code=status.HTTP_401_UNAUTHORIZED, detail="Usuario inactivo")
    token = create_access_token({"sub": str(user.id), "role": user.role})
    logger.info(f"Login exitoso: {user.username}")
    return TokenResponse(access_token=token, role=user.role, username=user.username)

@router.get("/me", response_model=UserResponse)
def me(current_user: User = Depends(get_current_user)):
    return current_user

@router.post("/forgot-password", response_model=MessageResponse)
@limiter.limit("3/minute")
def forgot_password(request: Request, body: ForgotPasswordRequest, db: Session = Depends(get_db)):
    GENERIC_MSG = "Si el correo está registrado, recibirás un enlace para restablecer tu contraseña."
    user = db.query(User).filter(User.email == body.email).first()
    if not user or not user.is_active:
        logger.info(f"Reset solicitado para email no existente: {body.email}")
        return MessageResponse(message=GENERIC_MSG)

    plain_token, token_hash = generate_reset_token()
    expires = datetime.now(timezone.utc) + timedelta(minutes=settings.PASSWORD_RESET_EXPIRE_MINUTES)

    reset = PasswordResetToken(user_id=user.id, token_hash=token_hash, expires_at=expires)
    db.add(reset)
    db.commit()

    send_reset_password_email(user.email, plain_token)
    logger.info(f"Reset de contraseña solicitado para user_id={user.id}")
    return MessageResponse(message=GENERIC_MSG)

@router.post("/reset-password", response_model=MessageResponse)
def reset_password(body: ResetPasswordRequest, db: Session = Depends(get_db)):
    from app.core.security import get_password_hash
    token_hash = hash_token(body.token)
    now = datetime.now(timezone.utc)

    reset = db.query(PasswordResetToken).filter(
        PasswordResetToken.token_hash == token_hash,
        PasswordResetToken.used == False,
        PasswordResetToken.expires_at > now
    ).first()

    if not reset:
        raise HTTPException(status_code=400, detail="Token inválido o expirado")

    reset.used = True
    reset.user.hashed_password = get_password_hash(body.new_password)
    db.commit()
    logger.info(f"Contraseña restablecida exitosamente para user_id={reset.user_id}")
    return MessageResponse(message="Contraseña restablecida exitosamente")
