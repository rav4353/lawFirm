"""
User Management API Routes — IT Admin only.
All endpoints are guarded by OPA permission checks.
"""

from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session

from api.dependencies.auth import require_permission
from models.database import get_db
from models.user import User
from schemas.auth import (
    AdminUserCreate,
    AdminUserUpdate,
    UserResponse,
    UserListResponse,
)
from services import user_management_service, audit_service

router = APIRouter(prefix="/users", tags=["User Management"])


@router.get("", response_model=UserListResponse)
async def list_users(
    current_user: User = Depends(require_permission("users", "list")),
    db: Session = Depends(get_db),
):
    """List all users. IT Admin and Partner only."""
    users = user_management_service.list_users(db)
    
    audit_service.log_action(
        db,
        user=current_user,
        resource="users",
        action="list",
        opa_input={"role": current_user.role, "resource": "users", "action": "list"},
        opa_decision={"allow": True},
    )
    return users


@router.post("", response_model=UserResponse, status_code=201)
async def create_user(
    data: AdminUserCreate,
    current_user: User = Depends(require_permission("users", "create")),
    db: Session = Depends(get_db),
):
    """Create a new user with an assigned role. IT Admin only."""
    user = user_management_service.admin_create_user(db, data, current_user.id)

    audit_service.log_action(
        db,
        user=current_user,
        resource="users",
        action="create",
        resource_id=user.id,
        opa_input={"role": current_user.role, "resource": "users", "action": "create"},
        opa_decision={"allow": True},
        metadata={"created_email": user.email, "assigned_role": user.role},
    )
    return user


@router.patch("/{user_id}", response_model=UserResponse)
async def update_user(
    user_id: str,
    data: AdminUserUpdate,
    current_user: User = Depends(require_permission("users", "edit")),
    db: Session = Depends(get_db),
):
    """Update a user's name, role, or reset their password. IT Admin only."""
    user = user_management_service.admin_update_user(db, user_id, data, current_user.id)

    changes = {}
    if data.name is not None:
        changes["name"] = data.name
    if data.role is not None:
        changes["role_changed"] = data.role.value
    if data.password is not None:
        changes["password_reset"] = True

    audit_service.log_action(
        db,
        user=current_user,
        resource="users",
        action="edit",
        resource_id=user_id,
        opa_input={"role": current_user.role, "resource": "users", "action": "edit"},
        opa_decision={"allow": True},
        metadata=changes,
    )
    return user


@router.patch("/{user_id}/deactivate", response_model=UserResponse)
async def deactivate_user(
    user_id: str,
    current_user: User = Depends(require_permission("users", "deactivate")),
    db: Session = Depends(get_db),
):
    """Deactivate a user account. IT Admin only."""
    user = user_management_service.admin_deactivate_user(db, user_id, current_user.id)

    audit_service.log_action(
        db,
        user=current_user,
        resource="users",
        action="deactivate",
        resource_id=user_id,
        opa_input={"role": current_user.role, "resource": "users", "action": "deactivate"},
        opa_decision={"allow": True},
    )
    return user


@router.patch("/{user_id}/activate", response_model=UserResponse)
async def activate_user(
    user_id: str,
    current_user: User = Depends(require_permission("users", "edit")),
    db: Session = Depends(get_db),
):
    """Reactivate a user account. IT Admin only."""
    user = user_management_service.admin_activate_user(db, user_id, current_user.id)

    audit_service.log_action(
        db,
        user=current_user,
        resource="users",
        action="edit",
        resource_id=user_id,
        opa_input={"role": current_user.role, "resource": "users", "action": "edit"},
        opa_decision={"allow": True},
        metadata={"action": "activated_user"},
    )
    return user
