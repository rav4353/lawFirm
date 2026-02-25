from pydantic import BaseModel
from typing import List, Optional


class RevenueTrend(BaseModel):
    month: str
    revenue: float

class ClientRevenue(BaseModel):
    client_name: str
    revenue: float

class TopClient(BaseModel):
    client_id: str
    client_name: str
    revenue: float

class ComplianceDistribution(BaseModel):
    status: str
    percentage: float

class DashboardMetricsResponse(BaseModel):
    total_revenue: float
    documents_processed: int
    avg_compliance_score: int
    active_clients: int
    
    revenue_trend: List[RevenueTrend]
    top_clients: List[TopClient]
    client_revenues: List[ClientRevenue]
    compliance_distribution: List[ComplianceDistribution]

class StatCard(BaseModel):
    label: str
    value: str
    icon: str
    trend: str
    status: str
    color: str
    bg: str
    glow: str

class ActivityLogItem(BaseModel):
    id: int
    type: str
    title: str
    status: str
    time: str
    icon: str
    color: str
    bg: str
    border: str

class SystemStatusItem(BaseModel):
    name: str
    status: str
    percentage: float
    icon: str
    color: str

class DashboardSummaryResponse(BaseModel):
    greeting_reviews: int
    stat_cards: List[StatCard]
    recent_activity: List[ActivityLogItem]
    system_status: List[SystemStatusItem]

class TeamMemberDetails(BaseModel):
    name: str
    role: str
    active_cases: int
    completed_tasks: int
    billable_hours: float
    revenue_generated: float
    utilization_rate: float
    status: str

class TeamPerformanceData(BaseModel):
    month: str
    hours: float
    tasks: int

class WorkloadDistribution(BaseModel):
    name: str
    cases: int

class TopPerformers(BaseModel):
    highest_revenue: Optional[TeamMemberDetails]
    most_cases_closed: Optional[TeamMemberDetails]
    best_utilization: Optional[TeamMemberDetails]
    fastest_resolution: Optional[TeamMemberDetails]

class TeamOverviewResponse(BaseModel):
    total_members: int
    active_cases: int
    avg_case_load: float
    avg_billable_hours: float
    completion_rate: float
    members: List[TeamMemberDetails]
    performance_chart: List[TeamPerformanceData]
    workload_distribution: List[WorkloadDistribution]
    top_performers: TopPerformers
