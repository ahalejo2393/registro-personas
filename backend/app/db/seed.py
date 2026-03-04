from sqlalchemy.orm import Session
from app.models.models import User, RoleEnum
from app.core.security import get_password_hash
from app.core.config import settings
import logging

logger = logging.getLogger(__name__)

def seed_admin(db: Session):
    existing = db.query(User).filter(User.role == RoleEnum.ADMIN).first()
    if not existing:
        admin = User(
            username=settings.ADMIN_USERNAME,
            email=settings.ADMIN_EMAIL,
            hashed_password=get_password_hash(settings.ADMIN_PASSWORD),
            role=RoleEnum.ADMIN
        )
        db.add(admin)
        db.commit()
        logger.info(f"Admin creado: {settings.ADMIN_USERNAME}")
