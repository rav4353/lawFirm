# Technology Stack - Veritas AI

The Veritas AI platform is built entirely using open-source technologies, ensuring no vendor lock-in and high cost-efficiency.

## Core Stack Components

| Component | Technology | Justification |
| :--- | :--- | :--- |
| **Frontend** | React Flow | Visual workflow builder for legal compliance rules. |
| **Backend** | Python + FastAPI | High-performance asynchronous endpoints for AI processing. |
| **Auth & RBAC** | OPA (Open Policy Agent) / Rego | Fine-grained, auditable policy-as-code. |
| **AI Framework** | Self-hosted LLM (Mistral 7B) | Data privacy compliance via local inference (Ollama/vLLM). |
| **Infrastructure** | k3s | Lightweight Kubernetes for local or edge deployment. |
| **CI/CD** | GitHub Actions | Automated linting, testing, and deployment workflows. |
| **Monitoring** | Prometheus + Grafana | Real-time system health and compliance metrics. |
| **Storage** | PostgreSQL + MinIO | Structured data tracking and S3-compatible object storage. |

## AI Configuration
- **Model:** Mistral 7B (Quantized for 8GB RAM compatibility).
- **Execution:** Offline-ready, no external API dependencies.
- **Extraction:** PyPDF2 / pdfplumber for document processing.

## Security & Compliance
- **RBAC:** Enforced via OPA server.
- **Data:** RLS (Row Level Security) in PostgreSQL where applicable.
- **Secrets:** No hardcoded secrets; managed via K8s Secrets/ConfigMaps.
