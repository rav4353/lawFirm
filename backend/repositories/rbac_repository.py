"""RBAC Repository — database operations for roles and permissions."""

from sqlalchemy.orm import Session
from models.rbac import Role, Permission, RolePermission


def get_all_roles(db: Session) -> list[Role]:
    return db.query(Role).all()


def get_role_by_id(db: Session, role_id: str) -> Role | None:
    return db.query(Role).filter(Role.id == role_id).first()


def get_role_by_name(db: Session, name: str) -> Role | None:
    return db.query(Role).filter(Role.name == name).first()


def get_all_permissions(db: Session) -> list[Permission]:
    return db.query(Permission).order_by(Permission.module, Permission.name).all()


def get_permissions_for_role(db: Session, role_id: str) -> list[dict]:
    """Return all permissions with their allowed status for a role."""
    results = (
        db.query(Permission, RolePermission.allowed)
        .outerjoin(
            RolePermission,
            (RolePermission.permission_id == Permission.id)
            & (RolePermission.role_id == role_id),
        )
        .order_by(Permission.module, Permission.name)
        .all()
    )
    return [
        {
            "id": perm.id,
            "name": perm.name,
            "display_name": perm.display_name,
            "module": perm.module,
            "allowed": bool(allowed) if allowed is not None else False,
        }
        for perm, allowed in results
    ]


def update_role_permission(
    db: Session, role_id: str, permission_id: str, allowed: bool
) -> RolePermission:
    """Toggle a single permission for a role."""
    rp = (
        db.query(RolePermission)
        .filter(
            RolePermission.role_id == role_id,
            RolePermission.permission_id == permission_id,
        )
        .first()
    )
    if rp:
        rp.allowed = allowed
    else:
        rp = RolePermission(
            role_id=role_id, permission_id=permission_id, allowed=allowed
        )
        db.add(rp)
    db.commit()
    db.refresh(rp)
    return rp


def bulk_update_permissions(
    db: Session, role_id: str, permission_updates: list[dict]
) -> int:
    """Bulk update permission toggles. Returns count of updated records."""
    count = 0
    for update in permission_updates:
        rp = (
            db.query(RolePermission)
            .filter(
                RolePermission.role_id == role_id,
                RolePermission.permission_id == update["permission_id"],
            )
            .first()
        )
        if rp:
            rp.allowed = update["allowed"]
        else:
            rp = RolePermission(
                role_id=role_id,
                permission_id=update["permission_id"],
                allowed=update["allowed"],
            )
            db.add(rp)
        count += 1
    db.commit()
    return count
