from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session

from auth import require_admin
from database import get_db
from models import STATUS_APPROVED, STATUS_PENDING, User
from schemas import PendingUserOut

router = APIRouter(dependencies=[Depends(require_admin)])


def _get_pending_or_404(db: Session, user_id: int) -> User:
    user = db.query(User).filter(User.id == user_id, User.status == STATUS_PENDING).first()
    if user is None:
        raise HTTPException(status.HTTP_404_NOT_FOUND, "Solicitud no encontrada")
    return user


@router.get("/solicitudes", response_model=list[PendingUserOut])
def list_solicitudes(db: Session = Depends(get_db)):
    return (
        db.query(User)
        .filter(User.status == STATUS_PENDING)
        .order_by(User.created_at.asc())
        .all()
    )


@router.post("/solicitudes/{user_id}/aprobar", response_model=PendingUserOut)
def aprobar_solicitud(user_id: int, db: Session = Depends(get_db)):
    user = _get_pending_or_404(db, user_id)
    user.status = STATUS_APPROVED
    db.commit()
    db.refresh(user)
    return user


@router.post("/solicitudes/{user_id}/rechazar", status_code=status.HTTP_204_NO_CONTENT)
def rechazar_solicitud(user_id: int, db: Session = Depends(get_db)):
    user = _get_pending_or_404(db, user_id)
    db.delete(user)
    db.commit()
