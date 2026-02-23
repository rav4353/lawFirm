from sqlalchemy.orm import Session

from models.prompt import PromptVersion


def create_prompt_version(db: Session, **kwargs) -> PromptVersion:
    """Create a new prompt version record."""
    prompt = PromptVersion(**kwargs)
    db.add(prompt)
    db.commit()
    db.refresh(prompt)
    return prompt


def get_prompts_by_type(db: Session, analysis_type: str) -> list[PromptVersion]:
    """Return all prompt versions for a given analysis type, newest first."""
    return (
        db.query(PromptVersion)
        .filter(PromptVersion.analysis_type == analysis_type)
        .order_by(PromptVersion.created_at.desc())
        .all()
    )


def get_all_prompts(db: Session) -> list[PromptVersion]:
    """Return all prompt versions, newest first."""
    return db.query(PromptVersion).order_by(PromptVersion.created_at.desc()).all()


def get_active_prompt(db: Session, analysis_type: str) -> PromptVersion | None:
    """Fetch the currently active prompt for a specific analysis type."""
    return (
        db.query(PromptVersion)
        .filter(
            PromptVersion.analysis_type == analysis_type,
            PromptVersion.is_active == True,
        )
        .first()
    )


def set_active_prompt(db: Session, analysis_type: str, prompt_id: str) -> PromptVersion | None:
    """Set a specific prompt as active, deactivating all others for this type."""
    # Deactivate current active
    db.query(PromptVersion).filter(
        PromptVersion.analysis_type == analysis_type,
        PromptVersion.is_active == True,
    ).update({"is_active": False})

    # Activate new
    prompt = db.query(PromptVersion).filter(PromptVersion.id == prompt_id).first()
    if prompt:
        prompt.is_active = True
        db.commit()
        db.refresh(prompt)

    return prompt
