from sqlalchemy.orm import Session

from models.user import User
from schemas.auth import UserCreate


def get_user_by_email(db: Session, email: str) -> User | None:
    """Fetch a user by their email address."""
    return db.query(User).filter(User.email == email).first()


def get_user_by_id(db: Session, user_id: str) -> User | None:
    """Fetch a user by their ID."""
    return db.query(User).filter(User.id == user_id).first()


def get_all_users(db: Session) -> list[User]:
    """Return all users, newest first."""
    return db.query(User).order_by(User.created_at.desc()).all()


def create_user(db: Session, user_data: UserCreate, hashed_password: str) -> User:
    """Create a new user record. First user becomes it_admin, others paralegal."""
    # Check if ANY it_admin exists in the system
    admin_exists = db.query(User).filter(User.role == "it_admin").first() is not None
    role = "it_admin" if not admin_exists else "paralegal"
    
    db_user = User(
        name=user_data.name,
        email=user_data.email,
        hashed_password=hashed_password,
        role=role,
    )
    db.add(db_user)
    db.commit()
    db.refresh(db_user)
    return db_user


def create_user_admin(
    db: Session,
    *,
    name: str,
    email: str,
    hashed_password: str,
    role: str,
) -> User:
    """Admin-only user creation with explicit role assignment."""
    db_user = User(
        name=name,
        email=email,
        hashed_password=hashed_password,
        role=role,
    )
    db.add(db_user)
    db.commit()
    db.refresh(db_user)
    return db_user


def update_user(db: Session, user: User, **kwargs) -> User:
    """Update user fields. Only set provided kwargs."""
    for key, value in kwargs.items():
        if value is not None:
            setattr(user, key, value)
    db.commit()
    db.refresh(user)
    return user


def deactivate_user(db: Session, user: User) -> User:
    """Deactivate a user account."""
    user.is_active = False
    db.commit()
    db.refresh(user)
    return user


def activate_user(db: Session, user: User) -> User:
    """Activate a user account."""
    user.is_active = True
    db.commit()
    db.refresh(user)
    return user
