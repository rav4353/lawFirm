from sqlalchemy.orm import Session

from models.workflow import Workflow


def create_workflow(db: Session, **kwargs) -> Workflow:
    """Create a new workflow record."""
    wf = Workflow(**kwargs)
    db.add(wf)
    db.commit()
    db.refresh(wf)
    return wf


def get_workflows_for_user(db: Session, user_id: str) -> list[Workflow]:
    """Return workflows created by a specific user, newest first."""
    return (
        db.query(Workflow)
        .filter(Workflow.created_by == user_id)
        .order_by(Workflow.updated_at.desc())
        .all()
    )


def get_all_workflows(db: Session) -> list[Workflow]:
    """Return all workflows, newest first."""
    return (
        db.query(Workflow)
        .order_by(Workflow.updated_at.desc())
        .all()
    )


def get_workflow_by_id(db: Session, workflow_id: str) -> Workflow | None:
    """Fetch a single workflow by its ID."""
    return db.query(Workflow).filter(Workflow.id == workflow_id).first()


def update_workflow(db: Session, workflow: Workflow, **kwargs) -> Workflow:
    """Update attributes on an existing workflow."""
    for key, value in kwargs.items():
        if value is not None:
            setattr(workflow, key, value)
    db.commit()
    db.refresh(workflow)
    return workflow


def delete_workflow(db: Session, workflow: Workflow) -> None:
    """Delete a workflow from the database."""
    db.delete(workflow)
    db.commit()
