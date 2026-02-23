from datetime import datetime
from typing import Optional

from pydantic import BaseModel, ConfigDict, Field


class WorkflowNodeData(BaseModel):
    """Data payload for a single React Flow node."""
    label: str = ""
    type: str = ""  # e.g. "document_upload", "extract_text", etc.
    config: dict = Field(default_factory=dict)


class WorkflowNode(BaseModel):
    """A React Flow node as stored / transmitted."""
    id: str
    type: str = "default"
    position: dict = Field(default_factory=lambda: {"x": 0, "y": 0})
    data: WorkflowNodeData = Field(default_factory=WorkflowNodeData)


class WorkflowEdge(BaseModel):
    """A React Flow edge."""
    id: str
    source: str
    target: str
    sourceHandle: Optional[str] = None
    targetHandle: Optional[str] = None
    animated: bool = True


class WorkflowCreate(BaseModel):
    name: str = Field(..., min_length=1, max_length=200)
    description: str = ""
    nodes: list[WorkflowNode] = Field(default_factory=list)
    edges: list[WorkflowEdge] = Field(default_factory=list)


class WorkflowUpdate(BaseModel):
    name: Optional[str] = Field(None, min_length=1, max_length=200)
    description: Optional[str] = None
    nodes: Optional[list[WorkflowNode]] = None
    edges: Optional[list[WorkflowEdge]] = None


class WorkflowResponse(BaseModel):
    id: str
    name: str
    description: str
    nodes: list[dict]
    edges: list[dict]
    created_by: str
    is_active: bool
    created_at: datetime
    updated_at: datetime

    model_config = ConfigDict(from_attributes=True)


class WorkflowListItem(BaseModel):
    id: str
    name: str
    description: str
    created_by: str
    is_active: bool
    created_at: datetime
    updated_at: datetime

    model_config = ConfigDict(from_attributes=True)


class WorkflowListResponse(BaseModel):
    workflows: list[WorkflowListItem]
    total: int
