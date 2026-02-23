import uuid
from datetime import datetime, timezone

from sqlalchemy import Column, String, Float, DateTime, ForeignKey
from sqlalchemy.dialects.postgresql import JSONB

from models.database import Base


class AnalysisResult(Base):
    __tablename__ = "analysis_results"

    id = Column(String, primary_key=True, default=lambda: str(uuid.uuid4()))
    document_id = Column(String, index=True, nullable=False)
    workflow_id = Column(String, index=True, nullable=True)  # Optional track back to workflow
    analysis_type = Column(String, nullable=False)  # e.g., "gdpr", "ccpa"
    prompt_version_id = Column(String, ForeignKey("prompt_versions.id"), nullable=True)
    
    # Store the structured LLM output natively
    rules_triggered = Column(String, nullable=False)
    confidence_score = Column(Float, nullable=False)
    source_text = Column(String, nullable=False)
    latency_seconds = Column(Float, nullable=False)
    
    analyzed_by = Column(String, index=True, nullable=False)  # User ID
    created_at = Column(DateTime, default=lambda: datetime.now(timezone.utc))
