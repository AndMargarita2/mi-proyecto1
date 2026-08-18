from datetime import datetime, timezone

from sqlalchemy import JSON, Boolean, Column, DateTime, ForeignKey, Integer, String
from sqlalchemy.orm import relationship

from database import Base


def utcnow() -> datetime:
    return datetime.now(timezone.utc)


# Estados posibles de User.status: cuentas nuevas quedan "pending" hasta que el
# maestro (admin) las aprueba desde /admin; solo entonces pueden loguearse.
STATUS_PENDING = "pending"
STATUS_APPROVED = "approved"

# Categorías disponibles para Presentation.category (deben coincidir con las
# opciones del filtro de categoría en el catálogo del frontend).
CATEGORY_TECH = "tech"
CATEGORY_BUSINESS = "business"
CATEGORY_EDUCATION = "education"
PRESENTATION_CATEGORIES = (CATEGORY_TECH, CATEGORY_BUSINESS, CATEGORY_EDUCATION)
DEFAULT_CATEGORY = CATEGORY_TECH


class User(Base):
    __tablename__ = "users"

    id = Column(Integer, primary_key=True, index=True)
    email = Column(String, unique=True, index=True, nullable=False)
    display_name = Column(String, nullable=False)
    hashed_password = Column(String, nullable=False)
    status = Column(String, default=STATUS_PENDING, nullable=False)
    is_admin = Column(Boolean, default=False, nullable=False)
    created_at = Column(DateTime, default=utcnow, nullable=False)

    presentations = relationship(
        "Presentation", back_populates="owner", cascade="all, delete-orphan"
    )


class Presentation(Base):
    __tablename__ = "presentations"

    id = Column(Integer, primary_key=True, index=True)
    owner_id = Column(Integer, ForeignKey("users.id"), nullable=False)
    title = Column(String, nullable=False, default="Sin título")
    category = Column(String, nullable=False, default=DEFAULT_CATEGORY)
    slides = Column(JSON, nullable=False, default=list)
    created_at = Column(DateTime, default=utcnow, nullable=False)
    updated_at = Column(DateTime, default=utcnow, onupdate=utcnow, nullable=False)

    owner = relationship("User", back_populates="presentations")

    @property
    def owner_name(self) -> str:
        return self.owner.display_name
