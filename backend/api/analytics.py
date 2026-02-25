from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from sqlalchemy import func, text, desc
from typing import List
from datetime import datetime

from models.database import get_db
from models.user import User
from models.billing import Billing
from models.client import Client
from models.document import Document
from models.analysis import AnalysisResult
from models.lawfirm_case import LawfirmCase
from models.lawfirm_task import LawfirmTask
from models.timesheet import Timesheet
from api.dependencies.auth import get_current_user
from schemas.analytics import (
    DashboardMetricsResponse, RevenueTrend, TopClient, ClientRevenue, ComplianceDistribution,
    TeamOverviewResponse, TeamMemberDetails, TeamPerformanceData, WorkloadDistribution, TopPerformers
)

router = APIRouter(prefix="/analytics", tags=["analytics"])

@router.get("/dashboard", response_model=DashboardMetricsResponse)
def get_dashboard_metrics(
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    # RBAC rules:
    # Partner has full access.
    # Associate has access but maybe limited in future.
    # Paralegal has no access.
    if current_user.role == "paralegal":
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="You do not have permission to view firm analytics."
        )

    # 1. Total Revenue
    total_revenue_result = db.query(func.sum(Billing.amount)).scalar()
    total_revenue = float(total_revenue_result) if total_revenue_result else 0.0

    # 2. Documents Processed
    documents_processed = db.query(func.count(Document.id)).scalar() or 0

    # 3. Average Compliance Score
    avg_score_result = db.query(func.avg(AnalysisResult.score)).scalar()
    avg_compliance_score = int(avg_score_result) if avg_score_result is not None else 0

    # 4. Active Clients
    # Clients that have at least one document
    active_clients = db.query(func.count(func.distinct(Document.uploaded_by))).scalar() or 0 # Actually client_id isn't on document in original schema, but let's count clients in DB that have billing
    # Let's just use total clients for now or clients with billing
    active_clients = db.query(func.count(Client.id)).scalar() or 0

    # 5. Revenue Trend (Month by Month)
    # Using python grouping for a simple cross-database approach or literal SQL
    # Since sqlite and postgres have different date_trunc, we can just group by substring if sqlite or execute raw.
    # Assuming postgres:
    trend_query = text("""
        SELECT to_char(created_at, 'Mon YYYY') as month_str, SUM(amount) as total
        FROM billing
        GROUP BY month_str, to_char(created_at, 'YYYY-MM')
        ORDER BY to_char(created_at, 'YYYY-MM') ASC
        LIMIT 6
    """)
    # fallback to a simpler approach if we want robust cross-engine without text()
    
    # We will fetch all billings and calculate in python to be perfectly safe against sqlite/postgres date functions
    all_bills = db.query(Billing).order_by(Billing.created_at.asc()).all()
    months_dict = {}
    for b in all_bills:
        m_str = b.created_at.strftime("%b %Y")
        months_dict[m_str] = months_dict.get(m_str, 0) + b.amount

    revenue_trend = []
    for m, val in months_dict.items():
        revenue_trend.append(RevenueTrend(month=m, revenue=float(val)))
    
    # Slice to last 6 months
    revenue_trend = revenue_trend[-6:]

    # 6. Top Clients & Client Revenue
    # Join billing and clients
    client_totals = db.query(
        Client.id,
        Client.name,
        func.sum(Billing.amount).label("total_revenue")
    ).join(Billing, Client.id == Billing.client_id).group_by(Client.id, Client.name).order_by(desc("total_revenue")).limit(5).all()

    top_clients = []
    client_revenues = []
    for c in client_totals:
        top_clients.append(TopClient(client_id=str(c.id), client_name=c.name, revenue=float(c.total_revenue)))
        # For the Bar Chart
        if len(client_revenues) < 4:  # Chart typically shows top 3 or 4 easily
            client_revenues.append(ClientRevenue(client_name=c.name, revenue=float(c.total_revenue)))

    # 7. Compliance Distribution
    total_analysis = db.query(func.count(AnalysisResult.id)).scalar()
    if total_analysis > 0:
        gdpr_passes = db.query(func.count(AnalysisResult.id)).filter(AnalysisResult.gdpr_status == "PASS").scalar() or 0
        gdpr_fails = db.query(func.count(AnalysisResult.id)).filter(AnalysisResult.gdpr_status == "FAIL").scalar() or 0
        
        pass_pct = round((gdpr_passes / total_analysis) * 100, 1)
        fail_pct = round((gdpr_fails / total_analysis) * 100, 1)
        
        compliance_distribution = [
            ComplianceDistribution(status="Pass", percentage=pass_pct),
            ComplianceDistribution(status="Fail", percentage=fail_pct)
        ]
    else:
        compliance_distribution = [
            ComplianceDistribution(status="Pass", percentage=100.0),
            ComplianceDistribution(status="Fail", percentage=0.0)
        ]

    return DashboardMetricsResponse(
        total_revenue=total_revenue,
        documents_processed=documents_processed,
        avg_compliance_score=avg_compliance_score,
        active_clients=active_clients,
        revenue_trend=revenue_trend,
        top_clients=top_clients,
        client_revenues=client_revenues,
        compliance_distribution=compliance_distribution
    )


@router.get("/team-overview", response_model=TeamOverviewResponse)
def get_team_overview(
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    if current_user.role == "paralegal":
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="You do not have permission to view team overview."
        )

    users = db.query(User).filter(User.role != "it_admin").all()
    total_members = len(users)

    cases = db.query(LawfirmCase).all()
    active_cases = len([c for c in cases if c.status != "closed"])
    
    avg_case_load = round(active_cases / total_members, 1) if total_members > 0 else 0.0

    tasks = db.query(LawfirmTask).all()
    completed_tasks = len([t for t in tasks if t.status == "completed"])
    completion_rate = round((completed_tasks / len(tasks)) * 100, 1) if len(tasks) > 0 else 0.0

    timesheets = db.query(Timesheet).all()
    total_hours = sum(t.hours for t in timesheets)
    avg_billable_hours = round(total_hours / total_members, 1) if total_members > 0 else 0.0

    members_data = []
    workload_dist = []

    for u in users:
        u_cases = [c for c in cases if c.assigned_to == u.id]
        u_active_cases = len([c for c in u_cases if c.status != "closed"])
        u_closed_cases = len([c for c in u_cases if c.status == "closed"])
        
        u_tasks = [t for t in tasks if t.assigned_to == u.id]
        u_completed_tasks = len([t for t in u_tasks if t.status == "completed"])

        u_timesheets = [ts for ts in timesheets if ts.user_id == u.id]
        u_billable_hours = sum(ts.hours for ts in u_timesheets)
        u_revenue = sum(ts.revenue_generated for ts in u_timesheets)

        # Basic utilization logic: assume 6 months of data generated
        months_worked = 6
        expected_total_hours = u.expected_hours_per_month * months_worked if u.expected_hours_per_month else 160 * 6
        u_utilization = round((u_billable_hours / expected_total_hours) * 100, 1) if expected_total_hours > 0 else 0

        status_flag = "Active"
        if u_active_cases > 5 or u_utilization > 95:
            status_flag = "Overloaded"
        
        member_detail = TeamMemberDetails(
            name=u.name or u.email.split('@')[0],
            role=u.role.capitalize(),
            active_cases=u_active_cases,
            completed_tasks=u_completed_tasks,
            billable_hours=round(u_billable_hours, 1),
            revenue_generated=round(u_revenue, 2),
            utilization_rate=u_utilization,
            status=status_flag
        )
        members_data.append((member_detail, u_closed_cases)) # Keep closed cases for top performers
        
        if u_active_cases > 0:
            workload_dist.append(WorkloadDistribution(name=member_detail.name, cases=u_active_cases))

    # performance chart (aggregate timesheets by month)
    # using simple dictionary to group by month
    month_agg = {}
    for ts in timesheets:
        if ts.month not in month_agg:
            month_agg[ts.month] = {"hours": 0.0, "tasks": 0}
        month_agg[ts.month]["hours"] += ts.hours
    
    # approximate tasks completed by month using timesheet months for simplistic charts 
    # (in reality we use completed_at, but we have to map completed_at -> "MMM YYYY")
    for t in tasks:
        if t.status == "completed" and t.completed_at:
            m_str = t.completed_at.strftime("%b %Y")
            if m_str not in month_agg:
                month_agg[m_str] = {"hours": 0.0, "tasks": 0}
            month_agg[m_str]["tasks"] += 1

    # sort logic by parsing "MMM YYYY"
    def sort_month(m_str):
        try:
            return datetime.strptime(m_str, "%b %Y")
        except:
            return datetime.min

    sorted_months = sorted(month_agg.keys(), key=sort_month)
    performance_chart = [
        TeamPerformanceData(month=m, hours=round(month_agg[m]["hours"], 1), tasks=month_agg[m]["tasks"])
        for m in sorted_months[-6:] # last 6 months
    ]

    # Top performers
    highest_rev_member = None
    most_closed_member = None
    best_util_member = None
    
    if members_data:
        highest_rev_member = max(members_data, key=lambda x: x[0].revenue_generated)[0]
        most_closed_member = max(members_data, key=lambda x: x[1])[0] # The tuple second logic is closed cases
        best_util_member = max(members_data, key=lambda x: x[0].utilization_rate)[0]

    # Clean members_data from tuples
    members_list = [m[0] for m in members_data]

    top_performers = TopPerformers(
        highest_revenue=highest_rev_member if (highest_rev_member and highest_rev_member.revenue_generated > 0) else None,
        most_cases_closed=most_closed_member if (most_closed_member) else None, # Simplified
        best_utilization=best_util_member if (best_util_member and best_util_member.utilization_rate > 0) else None,
        fastest_resolution=None # Optional for now
    )

    return TeamOverviewResponse(
        total_members=total_members,
        active_cases=active_cases,
        avg_case_load=avg_case_load,
        avg_billable_hours=avg_billable_hours,
        completion_rate=completion_rate,
        members=members_list,
        performance_chart=performance_chart,
        workload_distribution=workload_dist,
        top_performers=top_performers
    )
