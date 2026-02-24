from sqlalchemy.orm import Session

from models.audit import AuditLog


def create_audit_log(db: Session, **kwargs) -> AuditLog:
    log = AuditLog(**kwargs)
    db.add(log)
    db.commit()
    db.refresh(log)
    return log


def list_audit_logs(
    db: Session,
    *,
    user_id: str | None = None,
    resource: str | None = None,
    action: str | None = None,
    resource_id: str | None = None,
    limit: int = 50,
    offset: int = 0,
) -> list[AuditLog]:
    q = db.query(AuditLog)
    if user_id:
        q = q.filter(AuditLog.user_id == user_id)
    if resource:
        q = q.filter(AuditLog.resource == resource)
    if action:
        q = q.filter(AuditLog.action == action)
    if resource_id:
        q = q.filter(AuditLog.resource_id == resource_id)

    return (
        q.order_by(AuditLog.timestamp.desc())
        .offset(offset)
        .limit(limit)
        .all()
    )
