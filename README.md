# Veritas AI - LegalTech Compliance Platform

**Veritas AI** is a production-ready AI-powered legal document analysis platform. Built for the modern law firm, it allows legal teams to visually design compliance workflows, process documents, and receive real-time compliance scoring with auditable reasoning trails.

## 🎯 Business Context

- **Company:** LexFlow (LegalTech Startup)
- **Problem:** Law firms spend 40% of billable hours on manual contract review.
- **Solution:** Automated compliance checking against GDPR, CCPA, and internal policies with a visual "reasoning path" for every decision.

## 🚀 Key Features

- **Visual Workflow Builder:** Drag-and-drop interface (React Flow) for designing compliance logic.
- **AI Reasoning Path:** Click any decision to see the specific text analyzed, rules triggered, and confidence scores.
- **Role-Based Access (RBAC):** Fine-grained permissions enforced via Open Policy Agent (OPA).
- **Full Observability:** Prometheus & Grafana dashboards for system health and business metrics.
- **100% Open Source:** No dependencies on proprietary cloud AI services. Runs entirely offline on a local k3s cluster.

## 🛠 Technology Stack

- **Frontend:** React Flow
- **Backend:** FastAPI (Python)
- **Security:** OPA / Rego
- **AI:** Mistral 7B (Self-hosted)
- **Infrastructure:** k3s, PostgreSQL, MinIO
- **Monitoring:** Prometheus, Grafana

[View Full Tech Stack Details](./TECH_STACK.md) | [View Governance & Rules](./GOVERNANCE.md)

## 📂 Documentation Modules

- [Visual Workflow Builder](./docs/visual_workflow_builder.md)
- [AI Reasoning Backend](./docs/ai_reasoning_backend.md)
- [Security & RBAC (OPA)](./docs/security_rbac_opa.md)
- [Infrastructure & Observability](./docs/infrastructure_observability.md)
- [Project Timeline & Milestones](./TIMELINE.md)

## 🏁 Getting Started

### Prerequisites

- Docker / k3d (for local k3s cluster)
- Python 3.10+
- Node.js 18+

### Quick Deploy

```bash
# Clone the repository
git clone https://github.com/your-repo/veritas-ai.git
cd veritas-ai

# Deploy the stack (Single command deployment)
make deploy

# Start development servers (Frontend & Backend)
./dev.sh  # Mac/Linux
# OR
make dev  # Mac/Linux
# OR
.\dev.ps1 # Windows
```

## ⚖️ License

This project is open-source and licensed under the MIT License.
