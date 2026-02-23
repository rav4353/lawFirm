from fastapi import APIRouter, Depends
from fastapi.security import OAuth2PasswordRequestForm
from sqlalchemy.orm import Session

from api.dependencies.auth import get_current_user
from models.database import get_db
from models.user import User
from schemas.auth import UserCreate, UserResponse, Token
from services import auth_service, opa_service

router = APIRouter(prefix="/auth", tags=["Authentication"])


@router.post("/register", response_model=UserResponse, status_code=201)
def register(user_data: UserCreate, db: Session = Depends(get_db)):
    """Register a new user account."""
    user = auth_service.register_user(db, user_data)
    return user


@router.post("/login", response_model=Token)
def login(form_data: OAuth2PasswordRequestForm = Depends(), db: Session = Depends(get_db)):
    """Authenticate and receive a JWT access token.

    Uses OAuth2 form: 'username' field = email, 'password' field = password.
    """
    return auth_service.authenticate_user(db, form_data.username, form_data.password)


@router.get("/me", response_model=UserResponse)
def get_me(current_user: User = Depends(get_current_user)):
    """Get the currently authenticated user's profile."""
    return current_user


@router.get("/permissions")
async def get_permissions(current_user: User = Depends(get_current_user)):
    """Return the list of allowed {resource, action} pairs for the current user.

    The frontend uses this to conditionally show/hide UI elements.
    """
    actions = await opa_service.get_allowed_actions(current_user.role)
    return {"role": current_user.role, "permissions": actions}
