from datetime import datetime

from pydantic import BaseModel, ConfigDict, field_serializer


class AuditLogResponse(BaseModel):
    id: str
    user_id: str
    role: str
    resource: str
    action: str
    resource_id: str | None
    timestamp: datetime

    @field_serializer("timestamp")
    def serialize_dt(self, dt: datetime):
        return dt.isoformat().replace("+00:00", "Z") if dt.tzinfo else dt.isoformat() + "Z"

    opa_input: dict | None
    opa_decision: dict | None
    additional_data: dict | None

    model_config = ConfigDict(from_attributes=True)


class AuditLogListResponse(BaseModel):
    logs: list[AuditLogResponse]
    total: int
