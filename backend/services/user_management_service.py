"""
User Management Service — IT Admin only operations.
"""

import logging

from fastapi import HTTPException, status
from sqlalchemy.orm import Session

from repositories import user_repository
from schemas.auth import AdminUserCreate, AdminUserUpdate
from services.auth_service import hash_password

logger = logging.getLogger(__name__)


def list_users(db: Session) -> dict:
    """List all users in the system."""
    users = user_repository.get_all_users(db)
    return {"users": users, "total": len(users)}


def admin_create_user(db: Session, data: AdminUserCreate, created_by: str):
    """
    Admin creates a new user with an assigned role.
    Users cannot choose their own role during registration.
    """
    existing = user_repository.get_user_by_email(db, data.email)
    if existing:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Email already registered.",
        )

    hashed = hash_password(data.password)
    user = user_repository.create_user_admin(
        db,
        name=data.name,
        email=data.email,
        hashed_password=hashed,
        role=data.role.value,
    )

    logger.info(
        "Admin %s created user %s (%s) with role %s",
        created_by, user.id, user.email, user.role,
    )
    return user


def admin_update_user(db: Session, user_id: str, data: AdminUserUpdate, updated_by: str):
    """
    Admin updates a user's name, role, or resets their password.
    """
    user = user_repository.get_user_by_id(db, user_id)
    if not user:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="User not found.",
        )

    updates = {}
    if data.name is not None:
        updates["name"] = data.name
    if data.role is not None:
        updates["role"] = data.role.value
    if data.password is not None:
        updates["hashed_password"] = hash_password(data.password)

    if not updates:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="No fields to update.",
        )

    user = user_repository.update_user(db, user, **updates)

    logger.info(
        "Admin %s updated user %s — fields: %s",
        updated_by, user_id, list(updates.keys()),
    )
    return user


def admin_deactivate_user(db: Session, user_id: str, deactivated_by: str):
    """Deactivate a user account. IT Admin cannot deactivate themselves."""
    if user_id == deactivated_by:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Cannot deactivate your own account.",
        )

    user = user_repository.get_user_by_id(db, user_id)
    if not user:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="User not found.",
        )
    if not user.is_active:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="User is already deactivated.",
        )

    user = user_repository.deactivate_user(db, user)

    logger.info("Admin %s deactivated user %s (%s)", deactivated_by, user_id, user.email)
    return user
