# Project Timeline - Veritas AI

The development of Veritas AI is structured into a 7-day sprint to deliver a fully functional MVP.

## Day 1-2: Foundation & Infrastructure
- [ ] k3s cluster running locally (k3d/kind).
- [ ] PostgreSQL & MinIO deployment.
- [ ] FastAPI application with health checks.
- [ ] GitHub Actions workflow for linting and testing.
- [ ] OPA server deployment with basic RBAC policies.

## Day 3-4: Core Functionality
- [ ] React Flow canvas rendering sample workflow nodes.
- [ ] User authentication with JWT + RBAC enforcement via OPA.
- [ ] Self-hosted LLM endpoint (Mistral 7B) with API wrapper.
- [ ] Document upload endpoint with text extraction (PyPDF2, pdfplumber).
- [ ] Basic compliance scoring API.

## Day 5-6: Integration & Intelligence
- [ ] Workflow definitions stored in PostgreSQL.
- [ ] AI analysis integrated into React Flow nodes.
- [ ] Audit logging for all user actions.
- [ ] Prometheus metrics exposed from FastAPI and OPA.
- [ ] Grafana dashboard showing RPM, latency, and compliance rates.

## Day 7: Polish & Documentation
- [ ] End-to-end user flow demonstration.
- [ ] Architecture diagram (Mermaid).
- [ ] README with setup instructions.
- [ ] Demo video and retrospective.
