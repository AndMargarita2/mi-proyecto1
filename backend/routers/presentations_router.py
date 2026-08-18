from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session, joinedload

from auth import get_current_user, get_optional_user
from database import get_db
from models import Presentation, User
from schemas import PresentationCreate, PresentationOut, PresentationSummary, PresentationUpdate

router = APIRouter()


def _get_or_404(db: Session, presentation_id: int) -> Presentation:
    presentation = (
        db.query(Presentation)
        .options(joinedload(Presentation.owner))
        .filter(Presentation.id == presentation_id)
        .first()
    )
    if presentation is None:
        raise HTTPException(status.HTTP_404_NOT_FOUND, "Presentación no encontrada")
    return presentation


def _get_owned_or_403(db: Session, presentation_id: int, current_user: User) -> Presentation:
    presentation = _get_or_404(db, presentation_id)
    if presentation.owner_id != current_user.id:
        raise HTTPException(status.HTTP_403_FORBIDDEN, "No eres el propietario de esta presentación")
    return presentation


@router.get("", response_model=list[PresentationSummary])
def list_presentations(
    db: Session = Depends(get_db),
    _current_user: User | None = Depends(get_optional_user),
):
    return (
        db.query(Presentation)
        .options(joinedload(Presentation.owner))
        .order_by(Presentation.updated_at.desc())
        .all()
    )


@router.get("/{presentation_id}", response_model=PresentationOut)
def get_presentation(
    presentation_id: int,
    db: Session = Depends(get_db),
    _current_user: User | None = Depends(get_optional_user),
):
    return _get_or_404(db, presentation_id)


@router.post("", response_model=PresentationOut, status_code=status.HTTP_201_CREATED)
def create_presentation(
    payload: PresentationCreate,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    presentation = Presentation(
        owner_id=current_user.id,
        title=payload.title,
        category=payload.category,
        slides=payload.slides,
    )
    db.add(presentation)
    db.commit()
    db.refresh(presentation)
    return _get_or_404(db, presentation.id)


@router.put("/{presentation_id}", response_model=PresentationOut)
def update_presentation(
    presentation_id: int,
    payload: PresentationUpdate,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    presentation = _get_owned_or_403(db, presentation_id, current_user)
    if payload.title is not None:
        presentation.title = payload.title
    if payload.category is not None:
        presentation.category = payload.category
    if payload.slides is not None:
        presentation.slides = payload.slides
    db.commit()
    db.refresh(presentation)
    return _get_or_404(db, presentation.id)


@router.delete("/{presentation_id}", status_code=status.HTTP_204_NO_CONTENT)
def delete_presentation(
    presentation_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    presentation = _get_owned_or_403(db, presentation_id, current_user)
    db.delete(presentation)
    db.commit()
