"""
Seed script — populate roles, permissions, and default role_permissions.
Aligned with OPA resource/action naming.
Run: python seeds/seed_rbac.py
"""

import sys
import os

sys.path.insert(0, os.path.join(os.path.dirname(__file__), ".."))

from models.database import SessionLocal, engine, Base
from models.rbac import Role, Permission, RolePermission

# ── Roles ──
ROLES = [
    {"name": "it_admin",  "display_name": "IT Admin"},
    {"name": "partner",   "display_name": "Partner"},
    {"name": "associate", "display_name": "Associate"},
    {"name": "paralegal", "display_name": "Paralegal"},
]

# ── Permissions by module ──
# Name format: {resource}/{action}
PERMISSIONS = [
    # Documents
    {"name": "documents/upload",     "module": "documents",    "display_name": "Upload Document"},
    {"name": "documents/view_own",   "module": "documents",    "display_name": "View Own Documents"},
    {"name": "documents/view_all",   "module": "documents",    "display_name": "View All Documents"},
    {"name": "documents/delete_own", "module": "documents",    "display_name": "Delete Own Document"},
    {"name": "documents/delete_any", "module": "documents",    "display_name": "Delete Any Document"},
    {"name": "documents/review",     "module": "documents",    "display_name": "Review Document"},
    
    # AI Analysis
    {"name": "ai_analysis/run",      "module": "ai_analysis", "display_name": "Run AI Analysis"},
    {"name": "ai_analysis/view",     "module": "ai_analysis", "display_name": "View Analysis Results"},
    
    # Workflows
    {"name": "workflows/create",      "module": "workflows",   "display_name": "Create Workflow"},
    {"name": "workflows/execute",     "module": "workflows",   "display_name": "Execute Workflow"},
    {"name": "workflows/view_own",    "module": "workflows",   "display_name": "View Own Workflows"},
    {"name": "workflows/view_all",    "module": "workflows",   "display_name": "View All Workflows"},
    {"name": "workflows/delete",      "module": "workflows",   "display_name": "Delete Workflow"},
    
    # Users
    {"name": "users/list",            "module": "users",       "display_name": "List Users"},
    {"name": "users/create",          "module": "users",       "display_name": "Create User"},
    {"name": "users/edit",            "module": "users",       "display_name": "Edit User"},
    {"name": "users/deactivate",      "module": "users",       "display_name": "Deactivate User"},
    {"name": "users/reset_password",  "module": "users",       "display_name": "Reset Password"},
    
    # System
    {"name": "system_config/manage",  "module": "system",      "display_name": "Manage System Config"},
    {"name": "audit_logs/view_own",   "module": "system",      "display_name": "View Own Audit Logs"},
    {"name": "audit_logs/view_all",   "module": "system",      "display_name": "View All Audit Logs"},
    {"name": "audit_logs/export",     "module": "system",      "display_name": "Export Audit Logs"},
    {"name": "prompts/manage",        "module": "system",      "display_name": "Manage Prompts"},
]

# ── Default permission matrix ──
DEFAULT_MATRIX = {
    "it_admin": [
        "documents/upload", "documents/view_all", "documents/delete_any", "documents/review",
        "ai_analysis/run", "ai_analysis/view",
        "workflows/create", "workflows/execute", "workflows/view_all", "workflows/delete",
        "users/list", "users/create", "users/edit", "users/deactivate", "users/reset_password",
        "system_config/manage", "audit_logs/view_all", "audit_logs/export", "prompts/manage",
    ],
    "partner": [
        "documents/upload", "documents/view_all", "documents/delete_any", "documents/review",
        "ai_analysis/run", "ai_analysis/view",
        "workflows/create", "workflows/execute", "workflows/view_all", "workflows/delete",
        "users/list", "audit_logs/view_all", "audit_logs/export",
    ],
    "associate": [
        "documents/upload", "documents/view_own", "documents/view_all", "documents/review",
        "ai_analysis/run", "ai_analysis/view",
        "workflows/create", "workflows/execute", "workflows/view_all",
        "audit_logs/view_own",
    ],
    "paralegal": [
        "documents/upload", "documents/view_own", "documents/review",
        "workflows/execute", "workflows/view_own",
        "audit_logs/view_own",
    ],
}


def seed():
    Base.metadata.create_all(bind=engine)
    db = SessionLocal()

    try:
        # Clear existing RBAC data to re-align
        db.query(RolePermission).delete()
        db.query(Permission).delete()
        db.query(Role).delete()
        db.commit()
        
        print("Cleared existing RBAC data.")

        # Create roles
        role_map = {}
        for r in ROLES:
            role = Role(**r)
            db.add(role)
            db.flush()
            role_map[r["name"]] = role.id
        print(f"Created {len(ROLES)} roles")

        # Create permissions
        perm_map = {}
        for p in PERMISSIONS:
            perm = Permission(**p)
            db.add(perm)
            db.flush()
            perm_map[p["name"]] = perm.id
        print(f"Created {len(PERMISSIONS)} permissions")

        # Create role_permissions
        count = 0
        for role_name, role_id in role_map.items():
            allowed_perms = DEFAULT_MATRIX.get(role_name, [])
            for perm_name, perm_id in perm_map.items():
                rp = RolePermission(
                    role_id=role_id,
                    permission_id=perm_id,
                    allowed=perm_name in allowed_perms,
                )
                db.add(rp)
                count += 1

        db.commit()
        print(f"Created {count} role_permission records")
        print("✅ RBAC seeding complete (aligned)!")

    except Exception as e:
        db.rollback()
        print(f"❌ Seeding failed: {e}")
        raise
    finally:
        db.close()


if __name__ == "__main__":
    seed()
