# Module: Security & RBAC with OPA

Veritas AI uses a "Policy as Code" approach for fine-grained authorization, utilizing **Open Policy Agent (OPA)**.

## User Roles & Permissions

| Role | Capabilities | Primary View |
| :--- | :--- | :--- |
| **Paralegal** | Upload documents, view results. | Execution View |
| **Associate** | Create/modify compliance workflow templates. | Builder View |
| **Partner** | Full access + Audit log viewer. | Audit & Analytics |
| **IT Admin** | System health monitoring. | Grafana Dashboards |

## RBAC Implementation (OPA)
- **OPA Absolute Authority:** No role checks are allowed inside backend or frontend code. Every action is verified via an OPA query.
- **Policy Storage:** All Rego policies are stored in the `/policy` directory.
- **Enforcement:** The FastAPI backend queries the OPA server before executing sensitive actions or returning sensitive data.
- **Testing:** Rego unit tests are integrated into the CI pipeline.
- **Audit Immutability:** Append-only, non-updatable logs including `user_id`, `role`, `action`, `timestamp`, `OPA decision`, and `document_id`.

## Fine-Grained Control
Permissions are enforced per-document, not just per-endpoint:
- **Associate:** May edit workflows but only for their department/assigned documents.
- **Partner:** Read-only access to all audit trails and compliance trends.

## Security Practices
- **No Hardcoded Secrets:** Environment variables and K8s secrets are used throughout.
- **Stateless Authentication:** JWT-based authentication for secure and scalable user sessions.
- **Principle of Least Privilege:** Users only have access to the data and actions necessary for their specific role.
