from sqlalchemy.orm import Session

from models.user import User
from schemas.auth import UserCreate


def get_user_by_email(db: Session, email: str) -> User | None:
    """Fetch a user by their email address."""
    return db.query(User).filter(User.email == email).first()


def get_user_by_id(db: Session, user_id: str) -> User | None:
    """Fetch a user by their ID."""
    return db.query(User).filter(User.id == user_id).first()


def create_user(db: Session, user_data: UserCreate, hashed_password: str) -> User:
    """Create a new user record."""
    db_user = User(
        email=user_data.email,
        hashed_password=hashed_password,
        role=user_data.role.value,
    )
    db.add(db_user)
    db.commit()
    db.refresh(db_user)
    return db_user
