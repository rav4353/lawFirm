import uuid
from datetime import datetime, timezone

from sqlalchemy import Column, String, Float, Integer, DateTime, Text, ForeignKey

from models.database import Base


class AnalysisResult(Base):
    __tablename__ = "analysis_results"

    id = Column(String, primary_key=True, default=lambda: str(uuid.uuid4()))
    document_id = Column(String, index=True, nullable=False)
    workflow_id = Column(String, index=True, nullable=True)  # Optional track back to workflow
    analysis_type = Column(String, nullable=False)  # e.g., "gdpr", "ccpa"
    prompt_version_id = Column(String, ForeignKey("prompt_versions.id"), nullable=True)

    # Store the structured LLM output natively
    rules_triggered = Column(String, nullable=True)
    confidence_score = Column(Float, nullable=True)
    source_text = Column(String, nullable=True)
    latency_seconds = Column(Float, nullable=True)

    # Compliance-specific fields
    gdpr_status = Column(String, nullable=True)          # "PASS" or "FAIL"
    ccpa_status = Column(String, nullable=True)          # "PASS" or "FAIL"
    score = Column(Integer, nullable=True)               # 0-100
    detected_sections = Column(Text, nullable=True)      # JSON string list
    missing_sections = Column(Text, nullable=True)       # JSON string list
    ai_suggestions = Column(Text, nullable=True)         # JSON string list

    analyzed_by = Column(String, index=True, nullable=False)  # User ID
    created_at = Column(DateTime, default=lambda: datetime.now(timezone.utc))
