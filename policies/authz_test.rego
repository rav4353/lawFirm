package veritas.authz_test

import rego.v1

import data.veritas.authz

# ═══════════════════════════════════════════════
# DOCUMENTS
# ═══════════════════════════════════════════════

# --- paralegal ---

test_paralegal_can_upload_doc if {
    authz.allow with input as {"role": "paralegal", "resource": "documents", "action": "upload"}
}

test_paralegal_can_list_own_docs if {
    authz.allow with input as {"role": "paralegal", "resource": "documents", "action": "list_own"}
}

test_paralegal_cannot_list_all_docs if {
    not authz.allow with input as {"role": "paralegal", "resource": "documents", "action": "list_all"}
}

test_paralegal_can_read_own_doc if {
    authz.allow with input as {"role": "paralegal", "resource": "documents", "action": "read_own"}
}

test_paralegal_cannot_read_any_doc if {
    not authz.allow with input as {"role": "paralegal", "resource": "documents", "action": "read_any"}
}

test_paralegal_can_delete_own_doc if {
    authz.allow with input as {"role": "paralegal", "resource": "documents", "action": "delete_own"}
}

test_paralegal_cannot_delete_any_doc if {
    not authz.allow with input as {"role": "paralegal", "resource": "documents", "action": "delete_any"}
}

# --- associate ---

test_associate_can_upload_doc if {
    authz.allow with input as {"role": "associate", "resource": "documents", "action": "upload"}
}

test_associate_can_read_any_doc if {
    authz.allow with input as {"role": "associate", "resource": "documents", "action": "read_any"}
}

test_associate_cannot_list_all_docs if {
    not authz.allow with input as {"role": "associate", "resource": "documents", "action": "list_all"}
}

test_associate_cannot_delete_any_doc if {
    not authz.allow with input as {"role": "associate", "resource": "documents", "action": "delete_any"}
}

# --- partner ---

test_partner_can_list_all_docs if {
    authz.allow with input as {"role": "partner", "resource": "documents", "action": "list_all"}
}

test_partner_can_read_any_doc if {
    authz.allow with input as {"role": "partner", "resource": "documents", "action": "read_any"}
}

test_partner_can_delete_any_doc if {
    authz.allow with input as {"role": "partner", "resource": "documents", "action": "delete_any"}
}

# --- it_admin ---

test_admin_can_list_all_docs if {
    authz.allow with input as {"role": "it_admin", "resource": "documents", "action": "list_all"}
}

test_admin_cannot_upload_doc if {
    not authz.allow with input as {"role": "it_admin", "resource": "documents", "action": "upload"}
}

test_admin_cannot_delete_any_doc if {
    not authz.allow with input as {"role": "it_admin", "resource": "documents", "action": "delete_any"}
}

# ═══════════════════════════════════════════════
# WORKFLOWS
# ═══════════════════════════════════════════════

test_paralegal_can_view_own_workflow if {
    authz.allow with input as {"role": "paralegal", "resource": "workflows", "action": "view_own"}
}

test_paralegal_cannot_create_workflow if {
    not authz.allow with input as {"role": "paralegal", "resource": "workflows", "action": "create"}
}

test_associate_can_create_workflow if {
    authz.allow with input as {"role": "associate", "resource": "workflows", "action": "create"}
}

test_associate_cannot_approve_workflow if {
    not authz.allow with input as {"role": "associate", "resource": "workflows", "action": "approve"}
}

test_partner_can_approve_workflow if {
    authz.allow with input as {"role": "partner", "resource": "workflows", "action": "approve"}
}

test_partner_can_delete_workflow if {
    authz.allow with input as {"role": "partner", "resource": "workflows", "action": "delete"}
}

test_admin_can_view_all_workflows if {
    authz.allow with input as {"role": "it_admin", "resource": "workflows", "action": "view_all"}
}

test_admin_cannot_create_workflow if {
    not authz.allow with input as {"role": "it_admin", "resource": "workflows", "action": "create"}
}

# ═══════════════════════════════════════════════
# AUDIT LOGS
# ═══════════════════════════════════════════════

test_paralegal_can_view_own_logs if {
    authz.allow with input as {"role": "paralegal", "resource": "audit_logs", "action": "view_own"}
}

test_paralegal_cannot_view_all_logs if {
    not authz.allow with input as {"role": "paralegal", "resource": "audit_logs", "action": "view_all"}
}

test_paralegal_cannot_export_logs if {
    not authz.allow with input as {"role": "paralegal", "resource": "audit_logs", "action": "export"}
}

test_partner_can_view_all_logs if {
    authz.allow with input as {"role": "partner", "resource": "audit_logs", "action": "view_all"}
}

test_partner_can_export_logs if {
    authz.allow with input as {"role": "partner", "resource": "audit_logs", "action": "export"}
}

test_admin_can_export_logs if {
    authz.allow with input as {"role": "it_admin", "resource": "audit_logs", "action": "export"}
}

# ═══════════════════════════════════════════════
# USERS
# ═══════════════════════════════════════════════

test_paralegal_can_view_self if {
    authz.allow with input as {"role": "paralegal", "resource": "users", "action": "view_self"}
}

test_paralegal_cannot_list_users if {
    not authz.allow with input as {"role": "paralegal", "resource": "users", "action": "list_all"}
}

test_paralegal_cannot_create_user if {
    not authz.allow with input as {"role": "paralegal", "resource": "users", "action": "create"}
}

test_partner_can_list_users if {
    authz.allow with input as {"role": "partner", "resource": "users", "action": "list_all"}
}

test_partner_cannot_create_user if {
    not authz.allow with input as {"role": "partner", "resource": "users", "action": "create"}
}

test_admin_can_create_user if {
    authz.allow with input as {"role": "it_admin", "resource": "users", "action": "create"}
}

test_admin_can_update_role if {
    authz.allow with input as {"role": "it_admin", "resource": "users", "action": "update_role"}
}

test_admin_can_deactivate_user if {
    authz.allow with input as {"role": "it_admin", "resource": "users", "action": "deactivate"}
}

# ═══════════════════════════════════════════════
# EDGE CASES
# ═══════════════════════════════════════════════

test_unknown_role_denied if {
    not authz.allow with input as {"role": "intern", "resource": "documents", "action": "upload"}
}

test_unknown_resource_denied if {
    not authz.allow with input as {"role": "partner", "resource": "billing", "action": "create"}
}

test_unknown_action_denied if {
    not authz.allow with input as {"role": "partner", "resource": "documents", "action": "purge"}
}

test_empty_input_denied if {
    not authz.allow with input as {}
}

# ═══════════════════════════════════════════════
# allowed_actions helper
# ═══════════════════════════════════════════════

test_paralegal_allowed_actions_count if {
    actions := authz.allowed_actions with input as {"role": "paralegal"}
    count(actions) == 7  # 4 docs + 1 workflow + 1 audit + 1 user
}

test_admin_allowed_actions_count if {
    actions := authz.allowed_actions with input as {"role": "it_admin"}
    count(actions) == 10  # 1 doc + 1 wf + 3 audit + 5 users
}
