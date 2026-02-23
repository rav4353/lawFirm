from datetime import datetime

from pydantic import BaseModel, ConfigDict


class AnalysisRequest(BaseModel):
    document_id: str
    analysis_type: str  # e.g. "gdpr", "ccpa"
    workflow_id: str | None = None


class ReasoningPath(BaseModel):
    source_text: str
    rules_triggered: str
    confidence_score: float
    latency_seconds: float


class AnalysisResultResponse(BaseModel):
    id: str
    document_id: str
    workflow_id: str | None
    analysis_type: str
    prompt_version_id: str | None
    
    # Reasoning path fields flattened for easy frontend consumption
    source_text: str
    rules_triggered: str
    confidence_score: float
    latency_seconds: float
    
    analyzed_by: str
    created_at: datetime

    model_config = ConfigDict(from_attributes=True)
