import uuid
from datetime import datetime, timezone

from sqlalchemy import Column, String, Text, DateTime, Boolean

from models.database import Base


class PromptVersion(Base):
    __tablename__ = "prompt_versions"

    id = Column(String, primary_key=True, default=lambda: str(uuid.uuid4()))
    analysis_type = Column(String, nullable=False, index=True)  # e.g., "gdpr", "ccpa"
    version = Column(String, nullable=False)  # e.g., "v1.0.0"
    system_prompt = Column(Text, nullable=False)
    is_active = Column(Boolean, default=False, nullable=False)
    created_at = Column(DateTime, default=lambda: datetime.now(timezone.utc))

    @property
    def full_name(self):
        return f"{self.analysis_type}-{self.version}"
