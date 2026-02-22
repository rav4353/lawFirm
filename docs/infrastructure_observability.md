# Module: Infrastructure & Observability

Veritas AI is designed for high availability, reproducibility, and deep visibility into system performance and AI health.

## Infrastructure Architecture
- **Cluster:** Lightweight **k3s** cluster.
- **One-Command Deployment:** Use `make deploy` to orchestrate the entire stack (k3s, DB, MinIO, OPA, AI, Monitoring) with zero manual steps.
- **No SaaS Rule:** 100% open-source and offline-ready. Strictly no dependencies on OpenAI, Anthropic, Google AI, or cloud-managed databases/storage.
- **Orchestration:** Kubernetes manifests define resource limits (CPU/Memory), liveness/readiness probes, and config maps.

## CI/CD Workflow (GitHub Actions)
1. **Linting:** Automated code style checks.
2. **Testing:** Unit tests for FastAPI and Rego (OPA).
3. **Build:** Containerization of services.
4. **Deploy:** Strategy for updating the k3s cluster.

## Observability & Monitoring
Real-time tracking using **Prometheus** and **Grafana**:
- **System Health:** CPU/Memory utilization of the AI service, database, and backend.
- **API Performance:** 
    - Requests per minute (RPM).
    - OPA decision latency (ensuring auth doesn't bottleneck).
- **AI Intelligence Metrics:** 
    - LLM inference time (time to generate results).
    - Compliance pass/fail rates across different regulatory frameworks.
- **Business Insights:** Total documents processed per 24h, average compliance scores.

## Reproducibility
The entire stack can be deployed with a single command (e.g., `make deploy` or a Taskfile), ensuring "it works on my machine" is a thing of the past. Containers are used for all services to guarantee environment parity.
