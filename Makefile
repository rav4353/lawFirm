.PHONY: help install dev frontend-dev backend-dev build-images deploy deploy-manifests monitoring cluster teardown status test

# ╔══════════════════════════════════════╗
# ║  Veritas AI — Makefile               ║
# ╚══════════════════════════════════════╝

CLUSTER_NAME := veritas
NAMESPACE    := veritas

help: ## Show this help
	@echo ""
	@echo "  Veritas AI — Development & Deployment"
	@echo "  ======================================"
	@echo ""
	@grep -E '^[a-zA-Z_-]+:.*?## .*$$' $(MAKEFILE_LIST) | sort | \
		awk 'BEGIN {FS = ":.*?## "}; {printf "  \033[36m%-18s\033[0m %s\n", $$1, $$2}'
	@echo ""

# ───── Development ─────

install: ## Install all dependencies (frontend + backend)
	cd frontend && npm install
	cd backend && python3 -m venv venv && . venv/bin/activate && pip install -r requirements.txt

dev: ## Run both frontend and backend dev servers
	./dev.sh

frontend-dev: ## Run frontend in development mode
	cd frontend && npm run dev

backend-dev: ## Run backend in development mode
	cd backend && . venv/bin/activate && uvicorn api.main:app --reload --port 8000

# ───── Testing ─────

test: ## Run all tests (backend pytest + OPA Rego)
	@echo "Running backend tests..."
	cd backend && . venv/bin/activate && pytest tests/ -v
	@echo ""
	@echo "Running OPA policy tests..."
	opa test policies/ -v || echo "Install OPA CLI: brew install opa"

test-backend: ## Run backend pytest only
	cd backend && . venv/bin/activate && pytest tests/ -v

test-opa: ## Run OPA Rego tests only
	opa test policies/ -v

# ───── Docker ─────

build-images: ## Build backend and frontend Docker images
	docker build -t veritas-ai-backend:latest ./backend
	docker build -t veritas-ai-frontend:latest ./frontend

# ───── Cluster ─────

cluster: ## Create k3d cluster with port mappings
	@if k3d cluster list 2>/dev/null | grep -q $(CLUSTER_NAME); then \
		echo "Cluster '$(CLUSTER_NAME)' already exists."; \
	else \
		k3d cluster create $(CLUSTER_NAME) \
			--port "80:80@loadbalancer" \
			--port "443:443@loadbalancer" \
			--agents 1 --wait; \
		echo "Cluster '$(CLUSTER_NAME)' created."; \
	fi

# ───── Deployment ─────

deploy: ## Full deployment: cluster → images → manifests → monitoring
	@echo "Starting Veritas AI full deployment..."
	./deploy.sh

deploy-manifests: ## Apply all K8s manifests (assumes cluster exists)
	kubectl apply -f k8s/00-namespace.yaml
	kubectl apply -f k8s/01-postgres.yaml
	kubectl apply -f k8s/06-minio.yaml
	kubectl apply -f k8s/07-ollama.yaml
	kubectl apply -f k8s/05-opa.yaml
	kubectl apply -f k8s/02-backend.yaml
	kubectl apply -f k8s/03-frontend.yaml
	kubectl apply -f k8s/04-ingress.yaml
	@$(MAKE) monitoring

monitoring: ## Deploy Prometheus + Grafana only
	kubectl apply -f k8s/monitoring/prometheus.yaml
	kubectl apply -f k8s/monitoring/grafana.yaml

# ───── Operations ─────

status: ## Show pod and service status
	@echo ""
	@echo "  ── Pods ──"
	@kubectl get pods -n $(NAMESPACE) -o wide 2>/dev/null || echo "  Cluster not running."
	@echo ""
	@echo "  ── Services ──"
	@kubectl get svc -n $(NAMESPACE) 2>/dev/null || true
	@echo ""
	@echo "  ── Ingress ──"
	@kubectl get ingress -n $(NAMESPACE) 2>/dev/null || true
	@echo ""

teardown: ## Destroy the k3d cluster completely
	k3d cluster delete $(CLUSTER_NAME)
	@echo "Cluster '$(CLUSTER_NAME)' deleted."
