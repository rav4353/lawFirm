# Architectural & Governance Rules - Veritas AI

This document defines the non-negotiable rules for the project. Adherence to these rules is required for all development and PR approvals.

## 1. Architectural Governance
- **1.1 Service Boundary Rule:**
    - Frontend → Backend only.
    - Backend → OPA, DB, AI, MinIO.
    - AI → NEVER talks to DB or OPA.
    - OPA → Contains NO business logic.
- **1.2 Stateless Rule:** All services must be stateless (session/state to PG/MinIO).
- **1.3 Separation of Concerns:** Backend must use `/api`, `/services`, `/models`, `/repositories`, `/metrics`. No logic in controllers.
- **1.4 Workflow Engine:** Definitions in DB; validation before execution; deterministic execution; extendable node types. No hardcoded logic in frontend.

## 2. Policy & Security (OPA-First)
- **2.1 OPA Absolute Authority:** No role checks in code (e.g., `if role == "Partner"`). Every action goes through OPA.
- **2.2 Policy-as-Code:** Policies in `/policy`, include unit tests, version-controlled.
- **2.3 Document-Level Permissions:** Enforced per-document, not just per-endpoint.
- **2.4 Audit Immutability:** Append-only logs with `user_id`, `role`, `action`, `timestamp`, `OPA decision`, `document_id`, `workflow_id`.

## 3. AI & Prompt Engineering
- **3.1 Isolation:** AI service in a separate pod, resource limits, 30s timeout, structured JSON response only.
- **3.2 Prompt Versioning:** Prompts in DB with version numbers; traceable in audit logs; no hardcoded prompts.
- **3.3 Reasoning Transparency:** AI MUST return analyzed text, triggered rules, confidence score, and processing time.
- **3.4 Graceful Degradation:** Log/metric on failure; return partial results; system must NOT crash.

## 4. DevOps & Deployment
- **4.1 One-Command Deployment:** `make deploy` must start/deploy the entire stack (k3s, DB, MinIO, OPA, AI, Monitoring) with no manual steps.
- **4.2 No SaaS Rule:** 100% offline-ready after initial pull. No OpenAI, Anthropic, or Cloud DP/Storage.
- **4.3 Resource Control:** Pods must have CPU/Memory limits and Liveness/Readiness probes.
- **4.4 CI Enforcement:** Block merge on lint, unit, Rego, or Docker build failures.
- **4.5 Metrics:** Prometheus metrics for RPM, Latency (Backend/OPA/AI), and Error Rates.

## 5. Time-Box Discipline
- **5.1 End-to-End First:** Working flow (Login → Upload → Result) by Day 3. No polish before E2E.
- **5.2 No Gold Plating:** Stick to the evaluation rubric.
- **5.3 Daily Milestones:** Deployable state and working demo slice every day.

## 6. AI Development Meta-Rules
- **6.1 Task Atomicity:** Every task must be atomic with clear acceptance criteria.
- **6.2 No Architecture Drift:** Reject changes that break boundaries or add unauthorized dependencies.
- **6.3 Deterministic Code:** Use typed schemas; no "hidden magic".
- **6.4 Strict Dependency Rule:** 100% Open Source with documented licenses.

## 7. Quality Standards
- 70% Backend test coverage.
- Mandatory Rego tests.
- Workflow integration & deployment smoke tests.

## 8. UI/UX & Responsiveness (Cross-Device Rule)
- **8.1 Multi-Device Compatibility:** The application MUST be fully responsive (Mobile, Tablet, Desktop).
- **8.2 Breakpoint Discipline:** Use standard breakpoints; no hardcoded pixel widths for layout containers.
- **8.3 Touch-Friendly:** Interactive elements (React Flow nodes/edges) must be accessible on touch devices.
- **8.4 Performance Aesthetics:** Maintain the "premium" feel across all screen sizes with smooth transitions and optimized assets.
