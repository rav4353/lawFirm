import json
from typing import Any

from sqlalchemy.orm import Session

from models.analysis import AnalysisResult


def create_analysis_result(db: Session, **kwargs) -> AnalysisResult:
    """Create a new AI analysis result record."""
    result = AnalysisResult(**kwargs)
    db.add(result)
    db.commit()
    db.refresh(result)
    return result


def get_analysis_result(db: Session, result_id: str) -> AnalysisResult | None:
    """Fetch an analysis result by its ID."""
    return db.query(AnalysisResult).filter(AnalysisResult.id == result_id).first()


def get_analysis_results_for_document(db: Session, document_id: str) -> list[AnalysisResult]:
    """Fetch all analysis results for a specific document."""
    return (
        db.query(AnalysisResult)
        .filter(AnalysisResult.document_id == document_id)
        .order_by(AnalysisResult.created_at.desc())
        .all()
    )


def get_latest_compliance_for_document(db: Session, document_id: str) -> AnalysisResult | None:
    """Fetch the most recent compliance analysis result for a document."""
    return (
        db.query(AnalysisResult)
        .filter(
            AnalysisResult.document_id == document_id,
            AnalysisResult.analysis_type == "compliance",
        )
        .order_by(AnalysisResult.created_at.desc())
        .first()
    )


def create_compliance_result(
    db: Session,
    document_id: str,
    analyzed_by: str,
    compliance_data: dict[str, Any],
    latency_seconds: float,
) -> AnalysisResult:
    """Persist a new compliance analysis result."""
    result = AnalysisResult(
        document_id=document_id,
        analysis_type="compliance",
        # Legacy required fields (NOT NULL in old schema)
        rules_triggered="See compliance report",
        confidence_score=0.0,
        source_text="N/A",
        # Compliance-specific fields
        gdpr_status=compliance_data.get("gdpr_status", "FAIL"),
        ccpa_status=compliance_data.get("ccpa_status", "FAIL"),
        score=compliance_data.get("score", 0),
        detected_sections=json.dumps(compliance_data.get("detected_sections", [])),
        missing_sections=json.dumps(compliance_data.get("missing_sections", [])),
        ai_suggestions=json.dumps(compliance_data.get("ai_suggestions", [])),
        latency_seconds=latency_seconds,
        analyzed_by=analyzed_by,
    )
    db.add(result)
    db.commit()
    db.refresh(result)
    return result
