from datetime import datetime

from pydantic import BaseModel, ConfigDict


class ExecutionStartResponse(BaseModel):
    execution_id: str
    workflow_id: str
    document_id: str | None
    status: str
    created_at: datetime


class ExecutionStepResponse(BaseModel):
    id: str
    execution_id: str
    node_id: str
    node_type: str
    status: str
    started_at: datetime | None
    finished_at: datetime | None
    input_payload: dict | None
    output_payload: dict | None
    latency_seconds: float | None
    error_message: str | None
    created_at: datetime

    model_config = ConfigDict(from_attributes=True)


class ExecutionResponse(BaseModel):
    id: str
    workflow_id: str
    document_id: str | None
    status: str
    triggered_by: str
    started_at: datetime | None
    finished_at: datetime | None
    error_message: str | None
    created_at: datetime
    steps: list[ExecutionStepResponse]

    model_config = ConfigDict(from_attributes=True)


class ExecutionListItem(BaseModel):
    id: str
    workflow_id: str
    document_id: str | None
    status: str
    triggered_by: str
    created_at: datetime

    model_config = ConfigDict(from_attributes=True)


class ExecutionListResponse(BaseModel):
    executions: list[ExecutionListItem]
    total: int
