.PHONY: help install frontend-dev backend-dev deploy

help:
	@echo "Veritas AI - Development & Deployment"
	@echo ""
	@echo "Usage:"
	@echo "  make install      Install all dependencies"
	@echo "  make frontend-dev Run frontend in development mode"
	@echo "  make backend-dev  Run backend in development mode"
	@echo "  make deploy       Deploy the entire stack (k3s simulation)"

install:
	cd frontend && npm install
	cd backend && python3 -m venv venv && ./venv/bin/activate && pip install -r requirements.txt

frontend-dev:
	cd frontend && npm run dev

backend-dev:
	cd backend && ./venv/bin/activate && uvicorn api.main:app --reload

deploy:
	@echo "Starting Veritas AI Deployment..."
	@echo "1. Checking k3s cluster..."
	@echo "2. Deploying PostgreSQL & MinIO..."
	@echo "3. Deploying OPA Server..."
	@echo "4. Deploying AI Service (Mistral 7B)..."
	@echo "5. Deploying Backend Application..."
	@echo "6. Deploying Frontend Application..."
	@echo "7. Deploying Observability (Prometheus/Grafana)..."
	@echo "Deployment Complete!"
