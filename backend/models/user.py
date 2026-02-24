import uuid
from datetime import datetime, timezone

from sqlalchemy import Column, String, Boolean, DateTime, Enum as SAEnum

from models.database import Base


class User(Base):
    __tablename__ = "users"

    id = Column(String, primary_key=True, default=lambda: str(uuid.uuid4()))
    name = Column(String, nullable=True)
    email = Column(String, unique=True, index=True, nullable=False)
    hashed_password = Column(String, nullable=False)
    role = Column(
        SAEnum("paralegal", "associate", "partner", "it_admin", name="user_role"),
        nullable=False,
        default="paralegal",
    )
    is_active = Column(Boolean, default=True)
    created_at = Column(DateTime, default=lambda: datetime.now(timezone.utc))
