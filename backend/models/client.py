import uuid
from datetime import datetime, timezone

from sqlalchemy import Column, String, DateTime

from models.database import Base


class Client(Base):
    __tablename__ = "clients"

    id = Column(String, primary_key=True, default=lambda: str(uuid.uuid4()))
    name = Column(String, nullable=False)
    industry = Column(String, nullable=True)
    country = Column(String, nullable=True)
    created_at = Column(DateTime, default=lambda: datetime.now(timezone.utc))
