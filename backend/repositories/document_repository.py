from sqlalchemy.orm import Session

from models.document import Document


def create_document(db: Session, **kwargs) -> Document:
    """Create a new document record."""
    doc = Document(**kwargs)
    db.add(doc)
    db.commit()
    db.refresh(doc)
    return doc


def get_documents_for_user(db: Session, user_id: str) -> list[Document]:
    """Return all documents uploaded by a specific user, newest first."""
    return (
        db.query(Document)
        .filter(Document.uploaded_by == user_id)
        .order_by(Document.created_at.desc())
        .all()
    )


def get_all_documents(db: Session) -> list[Document]:
    """Return all documents across all users, newest first."""
    return (
        db.query(Document)
        .order_by(Document.created_at.desc())
        .all()
    )


def get_document_by_id(db: Session, document_id: str) -> Document | None:
    """Fetch a single document by its ID."""
    return db.query(Document).filter(Document.id == document_id).first()


def delete_document(db: Session, document: Document) -> None:
    """Delete a document record from the database."""
    db.delete(document)
    db.commit()
