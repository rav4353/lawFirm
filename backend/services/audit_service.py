from __future__ import annotations

from typing import Any

from sqlalchemy.orm import Session

from models.user import User
from repositories import audit_repository


def log_action(
    db: Session,
    *,
    user: User,
    resource: str,
    action: str,
    resource_id: str | None = None,
    opa_input: dict[str, Any] | None = None,
    opa_decision: dict[str, Any] | None = None,
    metadata: dict[str, Any] | None = None,
):
    # Append-only: never update logs.
    return audit_repository.create_audit_log(
        db,
        user_id=user.id,
        role=user.role,
        resource=resource,
        action=action,
        resource_id=resource_id,
        opa_input=opa_input,
        opa_decision=opa_decision,
        metadata=metadata,
    )
