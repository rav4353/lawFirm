"""
RBAC Models — roles, permissions, role_permissions tables.
"""

import uuid
from sqlalchemy import Column, String, Boolean, ForeignKey, UniqueConstraint
from models.database import Base


class Role(Base):
    __tablename__ = "roles"

    id = Column(String, primary_key=True, default=lambda: str(uuid.uuid4()))
    name = Column(String, unique=True, nullable=False)          # e.g. "it_admin"
    display_name = Column(String, nullable=False)               # e.g. "IT Admin"


class Permission(Base):
    __tablename__ = "permissions"

    id = Column(String, primary_key=True, default=lambda: str(uuid.uuid4()))
    name = Column(String, unique=True, nullable=False)          # e.g. "upload_document"
    display_name = Column(String, nullable=False)               # e.g. "Upload Document"
    module = Column(String, nullable=False)                     # e.g. "documents"


class RolePermission(Base):
    __tablename__ = "role_permissions"

    id = Column(String, primary_key=True, default=lambda: str(uuid.uuid4()))
    role_id = Column(String, ForeignKey("roles.id"), nullable=False)
    permission_id = Column(String, ForeignKey("permissions.id"), nullable=False)
    allowed = Column(Boolean, default=False, nullable=False)

    __table_args__ = (
        UniqueConstraint("role_id", "permission_id", name="uq_role_permission"),
    )
