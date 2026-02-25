from pydantic import BaseModel
from typing import List, Optional
from datetime import datetime

class CasePerformanceSummary(BaseModel):
    total_cases: int
    active_cases: int
    closed_cases: int
    delayed_cases: int
    avg_resolution_time_days: float
    success_rate_pct: float

class StatusDistribution(BaseModel):
    status: str
    count: int

class TimelineStage(BaseModel):
    stage: str
    avg_duration_days: float

class LawyerPerformanceRow(BaseModel):
    lawyer_name: str
    active_cases: int
    closed_cases: int
    avg_resolution_days: float

class RiskCase(BaseModel):
    case_id: str
    title: str
    risk_level: str
    reason: Optional[str]

class CasePerformanceTableItem(BaseModel):
    case_id: str
    client_name: str
    type: str
    lawyer_name: str
    status: str
    risk: str
    duration_days: int

class AIInsight(BaseModel):
    content: str
    recommendation: str

class CasePerformanceOverview(BaseModel):
    summary: CasePerformanceSummary
    status_distribution: List[StatusDistribution]
    timeline_analysis: List[TimelineStage]
    lawyer_performance: List[LawyerPerformanceRow]
    risk_analysis: List[RiskCase]
    cases: List[CasePerformanceTableItem]
    ai_insights: List[AIInsight]
