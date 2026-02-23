"""OPA policy client with async HTTP queries.

Provides ``check_permission()`` and ``get_allowed_actions()`` to query a
running OPA server.  When OPA is unreachable **and** the application is
running in dev mode (``OPA_URL`` points to localhost), a built-in
fallback permission matrix is used so that development can continue
without a live OPA server.  In production the fail-closed principle
always applies.
"""

from __future__ import annotations

import logging

import httpx

from config import settings

logger = logging.getLogger(__name__)

OPA_URL = settings.OPA_URL
_POLICY_PATH = "/v1/data/veritas/authz"

# ── Built-in fallback matrix (mirrors policies/authz.rego) ──
# Only used when OPA is unreachable in local dev.
_FALLBACK_PERMISSIONS: dict[str, list[dict[str, str]]] = {
    "paralegal": [
        {"resource": "documents", "action": "upload"},
        {"resource": "documents", "action": "list_own"},
        {"resource": "documents", "action": "read_own"},
        {"resource": "documents", "action": "delete_own"},
        {"resource": "workflows", "action": "execute"},
        {"resource": "workflows", "action": "view_own"},
        {"resource": "audit_logs", "action": "view_own"},
    ],
    "associate": [
        {"resource": "documents", "action": "upload"},
        {"resource": "documents", "action": "list_own"},
        {"resource": "documents", "action": "read_own"},
        {"resource": "documents", "action": "read_any"},
        {"resource": "documents", "action": "delete_own"},
        {"resource": "workflows", "action": "create"},
        {"resource": "workflows", "action": "execute"},
        {"resource": "workflows", "action": "view_own"},
        {"resource": "workflows", "action": "view_all"},
        {"resource": "audit_logs", "action": "view_own"},
    ],
    "partner": [
        {"resource": "documents", "action": "upload"},
        {"resource": "documents", "action": "list_own"},
        {"resource": "documents", "action": "list_all"},
        {"resource": "documents", "action": "read_own"},
        {"resource": "documents", "action": "read_any"},
        {"resource": "documents", "action": "delete_own"},
        {"resource": "documents", "action": "delete_any"},
        {"resource": "workflows", "action": "create"},
        {"resource": "workflows", "action": "execute"},
        {"resource": "workflows", "action": "view_own"},
        {"resource": "workflows", "action": "view_all"},
        {"resource": "workflows", "action": "delete"},
        {"resource": "audit_logs", "action": "view_own"},
        {"resource": "audit_logs", "action": "view_all"},
        {"resource": "audit_logs", "action": "export"},
        {"resource": "users", "action": "list"},
        {"resource": "users", "action": "view"},
        {"resource": "prompts", "action": "view"},
    ],
    "it_admin": [
        {"resource": "documents", "action": "list_all"},
        {"resource": "documents", "action": "read_any"},
        {"resource": "workflows", "action": "view_all"},
        {"resource": "audit_logs", "action": "view_all"},
        {"resource": "audit_logs", "action": "export"},
        {"resource": "users", "action": "list"},
        {"resource": "users", "action": "view"},
        {"resource": "users", "action": "create"},
        {"resource": "users", "action": "deactivate"},
        {"resource": "prompts", "action": "create"},
        {"resource": "prompts", "action": "view"},
        {"resource": "prompts", "action": "update"},
    ],
}


def _is_dev_mode() -> bool:
    """Return True when OPA_URL targets localhost (local development)."""
    return "localhost" in OPA_URL or "127.0.0.1" in OPA_URL


def _fallback_check(role: str, resource: str, action: str) -> bool:
    """Check the built-in matrix. Only called in dev mode."""
    perms = _FALLBACK_PERMISSIONS.get(role, [])
    return any(p["resource"] == resource and p["action"] == action for p in perms)


def _fallback_actions(role: str) -> list[dict[str, str]]:
    """Return all allowed actions from the built-in matrix."""
    return _FALLBACK_PERMISSIONS.get(role, [])


def _get_client() -> httpx.AsyncClient:
    return httpx.AsyncClient(timeout=5.0)


async def check_permission(role: str, resource: str, action: str) -> bool:
    """Query OPA for a single allow/deny decision.

    Falls back to the built-in matrix in dev mode when OPA is unreachable.
    In production, defaults to **deny** (fail-closed).
    """
    try:
        async with _get_client() as client:
            resp = await client.post(
                f"{OPA_URL}{_POLICY_PATH}/allow",
                json={
                    "input": {
                        "role": role,
                        "resource": resource,
                        "action": action,
                    }
                },
            )
            resp.raise_for_status()
            body = resp.json()
            return bool(body.get("result", False))
    except Exception as exc:
        if _is_dev_mode():
            logger.warning(
                "OPA unreachable (%s), using fallback policy for %s/%s/%s",
                exc, role, resource, action,
            )
            return _fallback_check(role, resource, action)
        logger.error("OPA check_permission failed (fail-closed): %s", exc)
        return False


async def get_allowed_actions(role: str) -> list[dict[str, str]]:
    """Return all {resource, action} pairs the role is allowed to perform.

    Falls back to the built-in matrix in dev mode when OPA is unreachable.
    """
    try:
        async with _get_client() as client:
            resp = await client.post(
                f"{OPA_URL}{_POLICY_PATH}/allowed_actions",
                json={"input": {"role": role}},
            )
            resp.raise_for_status()
            body = resp.json()
            return body.get("result", [])
    except Exception as exc:
        if _is_dev_mode():
            logger.warning(
                "OPA unreachable (%s), using fallback policy for role '%s'",
                exc, role,
            )
            return _fallback_actions(role)
        logger.error("OPA get_allowed_actions failed (fail-closed): %s", exc)
        return []
