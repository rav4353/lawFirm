package veritas.authz

import rego.v1

default allow := false

# ─── Permission matrix: role → resource → [actions] ───

permissions := {
    "paralegal": {
        "documents":  ["upload", "list_own", "read_own", "delete_own"],
        "workflows":  ["view_own", "execute"],
        "audit_logs": ["view_own"],
        "users":      ["view_self"],
    },
    "associate": {
        "documents":  ["upload", "list_own", "read_own", "read_any", "delete_own"],
        "workflows":  ["create", "view_own", "view_all", "execute"],
        "audit_logs": ["view_own"],
        "users":      ["view_self"],
    },
    "partner": {
        "documents":  ["upload", "list_own", "list_all", "read_own", "read_any", "delete_own", "delete_any"],
        "workflows":  ["create", "view_own", "view_all", "execute", "approve", "delete"],
        "audit_logs": ["view_own", "view_all", "export"],
        "users":      ["view_self", "list", "view"],
        "prompts":    ["view"],
    },
    "it_admin": {
        "documents":       ["upload", "list_all", "read_any", "delete_any"],
        "workflows":       ["create", "view_all", "execute"],
        "audit_logs":      ["view_all", "export"],
        "users":           ["list", "view", "create", "edit", "deactivate", "reset_password"],
        "prompts":         ["create", "view", "update"],
        "system_config":   ["manage"],
    },
}

# ─── Main authorization rule ───

allow if {
    role_perms := permissions[input.role]
    actions := role_perms[input.resource]
    input.action in actions
}

# ─── Helper: return all allowed {resource, action} pairs for a role ───

allowed_actions contains {"resource": resource, "action": action} if {
    some resource, actions in permissions[input.role]
    some action in actions
}
