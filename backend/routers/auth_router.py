from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session

from auth import create_access_token, get_current_user, hash_password, verify_password
from database import get_db
from models import STATUS_APPROVED, STATUS_PENDING, User
from notifications import send_admin_notification
from schemas import (
    AccessRequestCreate,
    AccessRequestOut,
    LoginRequest,
    TokenResponse,
    UserOut,
)

router = APIRouter()


@router.post("/solicitar-acceso", response_model=AccessRequestOut, status_code=status.HTTP_201_CREATED)
def solicitar_acceso(payload: AccessRequestCreate, db: Session = Depends(get_db)):
    existing = db.query(User).filter(User.email == payload.email).first()
    if existing is not None:
        raise HTTPException(status.HTTP_409_CONFLICT, "Ese correo ya tiene una cuenta o solicitud")

    user = User(
        email=payload.email,
        display_name=payload.display_name,
        hashed_password=hash_password(payload.password),
        status=STATUS_PENDING,
        is_admin=False,
    )
    db.add(user)
    db.commit()
    db.refresh(user)

    send_admin_notification(user)

    return AccessRequestOut()


@router.post("/login", response_model=TokenResponse)
def login(payload: LoginRequest, db: Session = Depends(get_db)):
    invalid = HTTPException(status.HTTP_401_UNAUTHORIZED, "Correo o contraseña incorrectos")
    user = db.query(User).filter(User.email == payload.email).first()
    if user is None or not verify_password(payload.password, user.hashed_password):
        raise invalid

    if user.status != STATUS_APPROVED:
        raise HTTPException(
            status.HTTP_403_FORBIDDEN,
            "Tu cuenta está pendiente de aprobación del maestro.",
        )

    token = create_access_token(user.id, user.email)
    return TokenResponse(access_token=token, user=UserOut.model_validate(user))


@router.get("/me", response_model=UserOut)
def me(current_user: User = Depends(get_current_user)):
    return current_user
