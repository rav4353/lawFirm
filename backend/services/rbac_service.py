"""RBAC Service — business logic for role permission management."""

import logging
from collections import defaultdict

from fastapi import HTTPException, status
from sqlalchemy.orm import Session

from repositories import rbac_repository
from schemas.rbac import BulkPermissionUpdate

logger = logging.getLogger(__name__)

MODULE_DISPLAY_NAMES = {
    "documents": "Documents",
    "ai_analysis": "AI Analysis",
    "workflows": "Workflows",
    "users": "Users",
    "system": "System",
}


def list_roles(db: Session) -> dict:
    roles = rbac_repository.get_all_roles(db)
    return {"roles": roles, "total": len(roles)}


def list_permissions_grouped(db: Session) -> dict:
    perms = rbac_repository.get_all_permissions(db)
    grouped = defaultdict(list)
    for p in perms:
        grouped[p.module].append({
            "id": p.id,
            "name": p.name,
            "display_name": p.display_name,
            "module": p.module,
            "allowed": False,
        })

    modules = [
        {
            "module": mod,
            "module_display": MODULE_DISPLAY_NAMES.get(mod, mod.title()),
            "permissions": items,
        }
        for mod, items in grouped.items()
    ]
    return {"modules": modules, "total": len(perms)}


def get_role_permissions(db: Session, role_id: str) -> dict:
    role = rbac_repository.get_role_by_id(db, role_id)
    if not role:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Role not found.",
        )
    perms = rbac_repository.get_permissions_for_role(db, role_id)
    return {
        "role": role,
        "permissions": perms,
    }


def update_role_permissions(
    db: Session,
    role_id: str,
    data: BulkPermissionUpdate,
    updated_by: str,
) -> dict:
    role = rbac_repository.get_role_by_id(db, role_id)
    if not role:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Role not found.",
        )

    updates = [
        {"permission_id": p.permission_id, "allowed": p.allowed}
        for p in data.permissions
    ]
    count = rbac_repository.bulk_update_permissions(db, role_id, updates)

    logger.info(
        "Admin %s updated %d permissions for role %s (%s)",
        updated_by, count, role.name, role_id,
    )

    # Return fresh data
    return get_role_permissions(db, role_id)
