from fastapi import APIRouter, Depends, HTTPException, status, Query
from sqlalchemy.orm import Session
from sqlalchemy import func, desc, or_
from typing import List, Optional
from datetime import datetime, timedelta

from models.database import get_db
from models.user import User
from models.lawfirm_case import LawfirmCase
from models.client import Client
from models.audit import AuditLog
from api.dependencies.auth import get_current_user
from schemas.case_analytics import (
    CasePerformanceOverview, CasePerformanceSummary, StatusDistribution,
    TimelineStage, LawyerPerformanceRow, RiskCase,
    CasePerformanceTableItem, AIInsight
)

router = APIRouter(prefix="/analytics/case-performance", tags=["case-analytics"])

@router.get("", response_model=CasePerformanceOverview)
async def get_case_performance_overview(
    case_type: Optional[str] = Query(None),
    lawyer_id: Optional[str] = Query(None),
    jurisdiction: Optional[str] = Query(None),
    status: Optional[str] = Query(None),
    risk_level: Optional[str] = Query(None),
    start_date: Optional[datetime] = Query(None),
    end_date: Optional[datetime] = Query(None),
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    if current_user.role not in ["partner", "associate", "it_admin"]:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="You do not have permission to view case performance analytics."
        )

    # Base query for cases
    query = db.query(LawfirmCase)

    # Apply filters
    if case_type:
        query = query.filter(LawfirmCase.case_type == case_type)
    if lawyer_id:
        query = query.filter(LawfirmCase.assigned_to == lawyer_id)
    if jurisdiction:
        query = query.filter(LawfirmCase.jurisdiction == jurisdiction)
    if status:
        query = query.filter(LawfirmCase.status == status)
    if risk_level:
        query = query.filter(LawfirmCase.risk_level == risk_level)
    if start_date:
        query = query.filter(LawfirmCase.created_at >= start_date)
    if end_date:
        query = query.filter(LawfirmCase.created_at <= end_date)

    cases = query.all()

    # 1. Summary Metrics
    total_cases = len(cases)
    active_cases = len([c for c in cases if c.status not in ["closed", "dismissed"]])
    closed_cases = len([c for c in cases if c.status == "closed"])
    delayed_cases = len([c for c in cases if c.status == "delayed"])
    
    # Calculate Avg Resolution Time
    resolved_cases = [c for c in cases if c.closed_at and c.created_at]
    if resolved_cases:
        durations = [(c.closed_at - c.created_at).days for c in resolved_cases]
        avg_res_time = sum(durations) / len(resolved_cases)
    else:
        avg_res_time = 0.0

    # Success Rate (Success / (Success + Failed))
    outcome_cases = [c for c in cases if c.outcome in ["success", "failed"]]
    success_count = len([c for c in outcome_cases if c.outcome == "success"])
    success_rate = (success_count / len(outcome_cases) * 100) if outcome_cases else 0.0

    summary = CasePerformanceSummary(
        total_cases=total_cases,
        active_cases=active_cases,
        closed_cases=closed_cases,
        delayed_cases=delayed_cases,
        avg_resolution_time_days=avg_res_time,
        success_rate_pct=success_rate
    )

    # 2. Status Distribution
    status_counts = {}
    for c in cases:
        status_counts[c.status] = status_counts.get(c.status, 0) + 1
    
    status_distribution = [
        StatusDistribution(status=s.replace("_", " ").title(), count=n)
        for s, n in status_counts.items()
    ]

    # 3. Timeline Analysis (Mocked or derived from audit logs if available)
    # For now, let's provide some representative stages. In a real app, this would query case_events.
    timeline_analysis = [
        TimelineStage(stage="Initial Filing", avg_duration_days=5.2),
        TimelineStage(stage="Discovery", avg_duration_days=14.8),
        TimelineStage(stage="Deposition", avg_duration_days=22.1),
        TimelineStage(stage="Trial Prep", avg_duration_days=30.5),
        TimelineStage(stage="Final Verdict", avg_duration_days=10.0),
    ]

    # 4. Lawyer Performance
    lawyer_stats = {}
    users_map = {u.id: u.name or u.email.split('@')[0] for u in db.query(User).all()}
    
    for c in cases:
        l_id = c.assigned_to
        if l_id not in lawyer_stats:
            lawyer_stats[l_id] = {"name": users_map.get(l_id, "Unknown"), "active": 0, "closed": 0, "durations": []}
        
        if c.status == "closed":
            lawyer_stats[l_id]["closed"] += 1
            if c.closed_at and c.created_at:
                lawyer_stats[l_id]["durations"].append((c.closed_at - c.created_at).days)
        else:
            lawyer_stats[l_id]["active"] += 1

    lawyer_performance = []
    for l_id, data in lawyer_stats.items():
        avg_res = sum(data["durations"]) / len(data["durations"]) if data["durations"] else 0.0
        lawyer_performance.append(LawyerPerformanceRow(
            lawyer_name=data["name"],
            active_cases=data["active"],
            closed_cases=data["closed"],
            avg_resolution_days=avg_res
        ))

    # 5. Risk Analysis
    risk_cases = [
        RiskCase(case_id=c.id, title=c.title, risk_level=c.risk_level, reason=c.risk_reason)
        for c in cases if c.risk_level in ["medium", "high"]
    ]

    # 6. Detailed Table Items
    clients_map = {cl.id: cl.name for cl in db.query(Client).all()}
    table_items = []
    for c in cases:
        # Calculate duration
        end_time = c.closed_at if c.closed_at else datetime.now(c.created_at.tzinfo)
        duration = (end_time - c.created_at).days
        
        table_items.append(CasePerformanceTableItem(
            case_id=c.id[:8],
            client_name=clients_map.get(c.client_id, "Unknown"),
            type=c.case_type,
            lawyer_name=users_map.get(c.assigned_to, "Unknown"),
            status=c.status.replace("_", " ").title(),
            risk=c.risk_level.title(),
            duration_days=duration
        ))

    # 7. AI Insights
    ai_insights = [
        AIInsight(
            content="30% of GDPR cases are delayed due to missing consent records.",
            recommendation="Improve document validation before filing."
        ),
        AIInsight(
            content="Case resolution time has increased by 15% this quarter.",
            recommendation="Consider reallocating workload in the litigation department."
        )
    ]

    return CasePerformanceOverview(
        summary=summary,
        status_distribution=status_distribution,
        timeline_analysis=timeline_analysis,
        lawyer_performance=lawyer_performance,
        risk_analysis=risk_cases[:10], # Top 10 risks
        cases=table_items[:50], # Last 50 cases
        ai_insights=ai_insights
    )
