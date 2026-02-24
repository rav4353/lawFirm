"""RBAC Pydantic schemas."""

from pydantic import BaseModel


class RoleResponse(BaseModel):
    id: str
    name: str
    display_name: str

    class Config:
        from_attributes = True


class PermissionResponse(BaseModel):
    id: str
    name: str
    display_name: str
    module: str
    allowed: bool = False


class RolePermissionsResponse(BaseModel):
    role: RoleResponse
    permissions: list[PermissionResponse]


class PermissionToggle(BaseModel):
    permission_id: str
    allowed: bool


class BulkPermissionUpdate(BaseModel):
    permissions: list[PermissionToggle]


class PermissionsByModule(BaseModel):
    module: str
    module_display: str
    permissions: list[PermissionResponse]


class RolesListResponse(BaseModel):
    roles: list[RoleResponse]
    total: int


class AllPermissionsResponse(BaseModel):
    modules: list[PermissionsByModule]
    total: int
