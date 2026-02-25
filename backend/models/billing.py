import uuid
from datetime import datetime, timezone

from sqlalchemy import Column, String, Float, DateTime, ForeignKey

from models.database import Base


class Billing(Base):
    __tablename__ = "billing"

    id = Column(String, primary_key=True, default=lambda: str(uuid.uuid4()))
    client_id = Column(String, ForeignKey("clients.id"), nullable=False, index=True)
    amount = Column(Float, nullable=False)
    service_type = Column(String, nullable=False) # e.g. Document Analysis, Compliance Audit, Legal Research
    created_at = Column(DateTime, default=lambda: datetime.now(timezone.utc), index=True)
