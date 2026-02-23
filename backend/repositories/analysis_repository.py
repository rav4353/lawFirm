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
