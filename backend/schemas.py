from datetime import datetime
from typing import Any, Literal

from pydantic import BaseModel, ConfigDict, EmailStr, Field

PresentationCategory = Literal["tech", "business", "education"]


class AccessRequestCreate(BaseModel):
    email: EmailStr
    password: str = Field(min_length=6)
    display_name: str = Field(min_length=1, max_length=80)


class AccessRequestOut(BaseModel):
    mensaje: str = "Solicitud enviada. El maestro revisará tu cuenta y te avisará por correo."


class UserOut(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    id: int
    email: str
    display_name: str
    is_admin: bool


class PendingUserOut(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    id: int
    email: str
    display_name: str
    created_at: datetime


class LoginRequest(BaseModel):
    email: EmailStr
    password: str


class TokenResponse(BaseModel):
    access_token: str
    token_type: str = "bearer"
    user: UserOut


class PresentationCreate(BaseModel):
    title: str = Field(min_length=1, max_length=120)
    category: PresentationCategory = "tech"
    slides: list[dict[str, Any]] = Field(default_factory=list)


class PresentationUpdate(BaseModel):
    title: str | None = Field(default=None, min_length=1, max_length=120)
    category: PresentationCategory | None = None
    slides: list[dict[str, Any]] | None = None


class PresentationSummary(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    id: int
    title: str
    category: str
    owner_id: int
    owner_name: str
    updated_at: datetime


class PresentationOut(PresentationSummary):
    slides: list[dict[str, Any]]
    created_at: datetime
