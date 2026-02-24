import uuid
from datetime import datetime, timezone

from sqlalchemy import Column, String, DateTime
from sqlalchemy.types import JSON

from models.database import Base


class AuditLog(Base):
    __tablename__ = "audit_logs"

    id = Column(String, primary_key=True, default=lambda: str(uuid.uuid4()))

    user_id = Column(String, index=True, nullable=False)
    role = Column(String, nullable=False)

    action = Column(String, nullable=False)
    resource = Column(String, nullable=False)
    resource_id = Column(String, nullable=True, index=True)

    timestamp = Column(DateTime, default=lambda: datetime.now(timezone.utc), index=True)

    opa_input = Column(JSON, nullable=True)
    opa_decision = Column(JSON, nullable=True)
    additional_data = Column(JSON, nullable=True)
    ip_address = Column(String, nullable=True)
