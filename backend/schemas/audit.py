from datetime import datetime

from pydantic import BaseModel, ConfigDict


class AuditLogResponse(BaseModel):
    id: str
    user_id: str
    role: str
    resource: str
    action: str
    resource_id: str | None
    timestamp: datetime
    opa_input: dict | None
    opa_decision: dict | None
    extra_metadata: dict | None

    model_config = ConfigDict(from_attributes=True)


class AuditLogListResponse(BaseModel):
    logs: list[AuditLogResponse]
    total: int
