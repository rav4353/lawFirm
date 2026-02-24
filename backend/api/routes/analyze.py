from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session

from api.dependencies.auth import get_current_user, require_permission
from models.database import get_db
from models.user import User
from schemas.analysis import AnalysisRequest, AnalysisResultResponse
from repositories import analysis_repository
from services import analyze_service, opa_service, document_service

router = APIRouter(prefix="/analyze", tags=["Analysis"])


@router.post("", response_model=AnalysisResultResponse, status_code=201)
async def analyze_document(
    request: AnalysisRequest,
    current_user: User = Depends(require_permission("documents", "read_own")),  # Must be able to read doc to analyze it
    db: Session = Depends(get_db),
):
    """Trigger an AI analysis on a document. Returns the Reasoning Path."""
    can_read_any = await opa_service.check_permission(
        current_user.role, "documents", "read_any"
    )
    # Enforce ownership / access by actually fetching via document_service
    document_service.get_document(
        db,
        request.document_id,
        current_user.id,
        can_access_any=can_read_any,
    )

    result = await analyze_service.process_analysis(db, request, current_user.id)
    return result


@router.get("/results/{result_id}", response_model=AnalysisResultResponse)
async def get_analysis_result(
    result_id: str,
    current_user: User = Depends(require_permission("documents", "read_own")),
    db: Session = Depends(get_db),
):
    """Fetch a past AI analysis result including its Reasoning Path."""
    result = analysis_repository.get_analysis_result(db, result_id)
    if not result:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Analysis result not found.",
        )

    can_read_any = await opa_service.check_permission(
        current_user.role, "documents", "read_any"
    )
    # If user can't read any, ensure the referenced document is theirs
    document_service.get_document(
        db,
        result.document_id,
        current_user.id,
        can_access_any=can_read_any,
    )

    return result
