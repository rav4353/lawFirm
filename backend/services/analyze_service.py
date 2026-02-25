import time

from fastapi import HTTPException, status
from sqlalchemy.orm import Session

from repositories import analysis_repository, document_repository, prompt_repository
from schemas.analysis import AnalysisRequest
from services import ai_service, audit_service


async def process_analysis(
    db: Session,
    request: AnalysisRequest,
    user_id: str
):
    """
    Orchestrate the AI analysis:
    1. Fetch document and active prompt.
    2. Call ai_service and measure latency.
    3. Save the result.
    """
    # 1. Fetch document
    doc = document_repository.get_document_by_id(db, request.document_id)
    if not doc:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Document not found.",
        )
    
    # 2. Extract text (fallback if none)
    doc_text = doc.extracted_text
    if not doc_text:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Document has no extracted text to analyze.",
        )
        
    # 3. Fetch active prompt for the requested analysis type
    active_prompt = prompt_repository.get_active_prompt(db, request.analysis_type)
    system_prompt_text = active_prompt.system_prompt if active_prompt else f"You are a legal AI assistant analyzing for {request.analysis_type} compliance."
    prompt_id = active_prompt.id if active_prompt else None
    
    # 4. Perform analysis and measure latency
    start_time = time.monotonic()
    ai_result = await ai_service.analyze_compliance(system_prompt_text, doc_text)
    latency = time.monotonic() - start_time
    
    # 5. Persist the result
    result = analysis_repository.create_analysis_result(
        db,
        document_id=request.document_id,
        workflow_id=request.workflow_id,
        analysis_type=request.analysis_type,
        prompt_version_id=prompt_id,
        rules_triggered=ai_result["rules_triggered"],
        confidence_score=ai_result["confidence_score"],
        source_text=ai_result["source_text"],
        latency_seconds=latency,
        analyzed_by=user_id,
    )
    
    audit_service.log_action(
        db,
        user_id=user_id,
        resource="analysis",
        action="analysis_performed",
        module="AI Compliance Analysis",
        resource_id=result.id,
        metadata={"analysis_type": request.analysis_type, "document_id": request.document_id}
    )
    return result
