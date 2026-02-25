import os
import uuid
from pathlib import Path

import pdfplumber
from fastapi import HTTPException, UploadFile, status
from sqlalchemy.orm import Session

from repositories import document_repository
from services import audit_service

UPLOAD_DIR = Path(__file__).resolve().parent.parent / "uploads"
UPLOAD_DIR.mkdir(exist_ok=True)

MAX_FILE_SIZE = 10 * 1024 * 1024  # 10 MB


async def upload_document(db: Session, file: UploadFile, user_id: str):
    """Validate, save to disk, extract text, and persist metadata."""

    # --- Validate content type ---
    if file.content_type != "application/pdf":
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Only PDF files are accepted.",
        )

    # --- Read file bytes & enforce size limit ---
    contents = await file.read()
    if len(contents) > MAX_FILE_SIZE:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=f"File exceeds maximum size of {MAX_FILE_SIZE // (1024 * 1024)} MB.",
        )

    # --- Save to disk ---
    file_id = str(uuid.uuid4())
    safe_name = f"{file_id}.pdf"
    disk_path = UPLOAD_DIR / safe_name
    disk_path.write_bytes(contents)

    # --- Extract text with pdfplumber ---
    extracted_text = ""
    try:
        with pdfplumber.open(disk_path) as pdf:
            for page in pdf.pages:
                page_text = page.extract_text()
                if page_text:
                    extracted_text += page_text + "\n"
    except Exception:
        extracted_text = "[Text extraction failed]"

    # --- Persist to database ---
    doc = document_repository.create_document(
        db,
        id=file_id,
        filename=file.filename or "unnamed.pdf",
        content_type=file.content_type,
        size_bytes=len(contents),
        extracted_text=extracted_text.strip() or None,
        disk_path=str(disk_path),
        uploaded_by=user_id,
    )
    audit_service.log_action(
        db,
        user_id=user_id,
        resource="document",
        action="document_upload",
        module="Document Management",
        resource_id=doc.id,
        metadata={"filename": doc.filename, "size_bytes": doc.size_bytes}
    )
    return doc


def list_documents(db: Session, user_id: str, *, can_list_all: bool = False):
    """Return documents. If *can_list_all* is True, return every document;
    otherwise only those belonging to *user_id*."""
    if can_list_all:
        docs = document_repository.get_all_documents(db)
    else:
        docs = document_repository.get_documents_for_user(db, user_id)
    return {"documents": docs, "total": len(docs)}


def get_document(
    db: Session,
    document_id: str,
    user_id: str,
    *,
    can_access_any: bool = False,
):
    """Get a single document. Ownership is enforced unless *can_access_any*."""
    doc = document_repository.get_document_by_id(db, document_id)
    if not doc:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Document not found.",
        )
    if not can_access_any and doc.uploaded_by != user_id:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Document not found.",
        )
    return doc


def delete_document(
    db: Session,
    document_id: str,
    user_id: str,
    *,
    can_access_any: bool = False,
):
    """Delete a document from disk and database."""
    doc = document_repository.get_document_by_id(db, document_id)
    if not doc:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Document not found.",
        )
    if not can_access_any and doc.uploaded_by != user_id:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Document not found.",
        )

    # Remove file from disk
    try:
        os.remove(doc.disk_path)
    except OSError:
        pass  # File may already be gone

    document_repository.delete_document(db, doc)

    audit_service.log_action(
        db,
        user_id=user_id,
        resource="document",
        action="document_delete",
        module="Document Management",
        resource_id=document_id,
        metadata={"filename": doc.filename}
    )
