from datetime import datetime
from typing import Optional, Any
from pydantic import BaseModel, ConfigDict, Field

class CaseBase(BaseModel):
    title: str
    court: str
    jurisdiction: str
    year: int
    regulation: str
    summary: str
    key_ruling: Optional[str] = None
    relevance_score: int = 0

class CaseCreate(CaseBase):
    full_text: str

class CaseResponse(CaseBase):
    id: str
    full_text: str = ""
    created_at: datetime
    model_config = ConfigDict(from_attributes=True)

class SearchQueryRequest(BaseModel):
    query: str
    jurisdiction: Optional[str] = None
    year: Optional[int] = None
    regulation: Optional[str] = None

class SearchResultResponse(BaseModel):
    cases: list[CaseResponse]
    ai_summary: Optional[str] = None
    total: int

class SavedCaseBase(BaseModel):
    case_id: str
    notes: Optional[str] = None

class SavedCaseResponse(SavedCaseBase):
    user_id: str
    saved_at: datetime
    model_config = ConfigDict(from_attributes=True)

class ResearchQueryResponse(BaseModel):
    id: str
    query_text: str
    filters: Optional[dict[str, Any]] = None
    timestamp: datetime
    model_config = ConfigDict(from_attributes=True)
