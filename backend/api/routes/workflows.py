from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session

from api.dependencies.auth import get_current_user, require_permission
from models.database import get_db
from models.user import User
from schemas.workflow import (
    WorkflowCreate,
    WorkflowUpdate,
    WorkflowResponse,
    WorkflowListResponse,
)
from services import workflow_service, opa_service

router = APIRouter(prefix="/workflows", tags=["Workflows"])


@router.post("", response_model=WorkflowResponse, status_code=201)
async def create_workflow(
    data: WorkflowCreate,
    current_user: User = Depends(require_permission("workflows", "create")),
    db: Session = Depends(get_db),
):
    """Create a new compliance workflow. Requires 'workflows/create' permission."""
    return workflow_service.create_workflow(db, data, current_user.id)


@router.get("", response_model=WorkflowListResponse)
async def list_workflows(
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    """List workflows. Partners/admins see all; others see only their own."""
    can_view_all = await opa_service.check_permission(
        current_user.role, "workflows", "view_all"
    )
    return workflow_service.list_workflows(db, current_user.id, can_view_all=can_view_all)


@router.get("/{workflow_id}", response_model=WorkflowResponse)
async def get_workflow(
    workflow_id: str,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    """Get a specific workflow by ID."""
    can_view_all = await opa_service.check_permission(
        current_user.role, "workflows", "view_all"
    )
    return workflow_service.get_workflow(
        db, workflow_id, current_user.id, can_view_all=can_view_all
    )


@router.put("/{workflow_id}", response_model=WorkflowResponse)
async def update_workflow(
    workflow_id: str,
    data: WorkflowUpdate,
    current_user: User = Depends(require_permission("workflows", "create")),
    db: Session = Depends(get_db),
):
    """Update an existing workflow. Only the creator can update."""
    return workflow_service.update_workflow(db, workflow_id, data, current_user.id)


@router.delete("/{workflow_id}", status_code=204)
async def delete_workflow(
    workflow_id: str,
    current_user: User = Depends(require_permission("workflows", "delete")),
    db: Session = Depends(get_db),
):
    """Delete a workflow. Requires 'workflows/delete' permission."""
    workflow_service.delete_workflow(db, workflow_id, current_user.id)
