from datetime import datetime
from enum import Enum
from typing import Optional

from pydantic import BaseModel, ConfigDict, Field, field_serializer


class UserRole(str, Enum):
    paralegal = "paralegal"
    associate = "associate"
    partner = "partner"
    it_admin = "it_admin"


class UserCreate(BaseModel):
    """Self-registration schema. First user becomes it_admin, others paralegal."""
    name: str = Field(..., description="Full name")
    email: str = Field(..., description="User email address")
    password: str = Field(..., min_length=8, description="Password (min 8 chars)")


class AdminUserCreate(BaseModel):
    """Admin-only schema for creating users with assigned roles."""
    name: str = Field(..., description="Full name")
    email: str = Field(..., description="User email address")
    password: str = Field(..., min_length=8, description="Temporary password")
    role: UserRole = Field(..., description="Assigned role")


class AdminUserUpdate(BaseModel):
    """Admin-only schema for updating a user."""
    name: str | None = None
    role: UserRole | None = None
    password: str | None = Field(default=None, min_length=8, description="New password (reset)")


class UserResponse(BaseModel):
    id: str
    name: str | None = None
    email: str
    role: UserRole
    is_active: bool
    created_at: datetime

    @field_serializer("created_at")
    def serialize_dt(self, dt: datetime):
        return dt.isoformat().replace("+00:00", "Z") if dt.tzinfo else dt.isoformat() + "Z"

    model_config = ConfigDict(from_attributes=True)


class UserListResponse(BaseModel):
    users: list[UserResponse]
    total: int


class Token(BaseModel):
    access_token: str
    token_type: str = "bearer"


class TokenData(BaseModel):
    sub: str
    role: str


class ForgotPasswordRequest(BaseModel):
    email: str


class ResetPassword(BaseModel):
    email: str
    otp_code: str
    new_password: str = Field(..., min_length=8)
