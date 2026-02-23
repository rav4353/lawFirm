from fastapi import Depends, HTTPException, status
from fastapi.security import OAuth2PasswordBearer
from sqlalchemy.orm import Session

from models.database import get_db
from models.user import User
from repositories import user_repository
from services.auth_service import decode_access_token
from services import opa_service

oauth2_scheme = OAuth2PasswordBearer(tokenUrl="/auth/login")


def get_current_user(
    token: str = Depends(oauth2_scheme),
    db: Session = Depends(get_db),
) -> User:
    """Decode the JWT and return the current user. Raises 401 on failure."""
    payload = decode_access_token(token)
    user_id: str = payload.get("sub")
    if user_id is None:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Invalid token payload",
        )
    user = user_repository.get_user_by_id(db, user_id)
    if user is None:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="User not found",
        )
    return user


def require_permission(resource: str, action: str):
    """Returns a FastAPI dependency that checks OPA for authorization.

    Usage on a route::

        @router.post("/documents/upload",
                      dependencies=[Depends(require_permission("documents", "upload"))])
    """

    async def permission_checker(
        current_user: User = Depends(get_current_user),
    ) -> User:
        allowed = await opa_service.check_permission(
            role=current_user.role,
            resource=resource,
            action=action,
        )
        if not allowed:
            raise HTTPException(
                status_code=status.HTTP_403_FORBIDDEN,
                detail=f"Permission denied: {resource}/{action} for role '{current_user.role}'",
            )
        return current_user

    return permission_checker


# ── Kept for backward compatibility (deprecated) ──


def require_role(*allowed_roles: str):
    """Returns a dependency that enforces role-based access.

    .. deprecated::
        Use :func:`require_permission` with OPA policies instead.
    """

    def role_checker(current_user: User = Depends(get_current_user)) -> User:
        if current_user.role not in allowed_roles:
            raise HTTPException(
                status_code=status.HTTP_403_FORBIDDEN,
                detail=f"Role '{current_user.role}' is not authorized for this action",
            )
        return current_user

    return role_checker
