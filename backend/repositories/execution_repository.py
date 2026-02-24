from sqlalchemy.orm import Session

from models.execution import WorkflowExecution, ExecutionStep


def create_execution(db: Session, **kwargs) -> WorkflowExecution:
    execution = WorkflowExecution(**kwargs)
    db.add(execution)
    db.commit()
    db.refresh(execution)
    return execution


def update_execution(db: Session, execution: WorkflowExecution, **kwargs) -> WorkflowExecution:
    for key, value in kwargs.items():
        setattr(execution, key, value)
    db.commit()
    db.refresh(execution)
    return execution


def get_execution_by_id(db: Session, execution_id: str) -> WorkflowExecution | None:
    return db.query(WorkflowExecution).filter(WorkflowExecution.id == execution_id).first()


def list_executions_for_workflow(
    db: Session, workflow_id: str, *, limit: int = 20
) -> list[WorkflowExecution]:
    return (
        db.query(WorkflowExecution)
        .filter(WorkflowExecution.workflow_id == workflow_id)
        .order_by(WorkflowExecution.created_at.desc())
        .limit(limit)
        .all()
    )


def create_step(db: Session, **kwargs) -> ExecutionStep:
    step = ExecutionStep(**kwargs)
    db.add(step)
    db.commit()
    db.refresh(step)
    return step


def update_step(db: Session, step: ExecutionStep, **kwargs) -> ExecutionStep:
    for key, value in kwargs.items():
        setattr(step, key, value)
    db.commit()
    db.refresh(step)
    return step


def list_steps_for_execution(db: Session, execution_id: str) -> list[ExecutionStep]:
    return (
        db.query(ExecutionStep)
        .filter(ExecutionStep.execution_id == execution_id)
        .order_by(ExecutionStep.created_at.asc())
        .all()
    )
