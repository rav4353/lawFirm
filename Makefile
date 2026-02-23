.PHONY: help install frontend-dev backend-dev build-images deploy

help:
	@echo "Veritas AI - Development & Deployment"
	@echo ""
	@echo "Usage:"
	@echo "  make install      Install all dependencies"
	@echo "  make frontend-dev Run frontend in development mode"
	@echo "  make backend-dev  Run backend in development mode"
	@echo "  make build-images Build backend/frontend Docker images"
	@echo "  make deploy       Deploy the stack to the current k8s context"

install:
	cd frontend && npm install
	cd backend && python3 -m venv venv && ./venv/bin/activate && pip install -r requirements.txt

frontend-dev:
	cd frontend && npm run dev

backend-dev:
	cd backend && ./venv/bin/activate && uvicorn api.main:app --reload

build-images:
	docker build -t veritas-ai-backend:latest ./backend
	docker build -t veritas-ai-frontend:latest ./frontend

deploy:
	@echo "Starting Veritas AI Deployment..."
	@echo "1. Building Docker images..."
	@$(MAKE) build-images
	@echo "2. Applying Kubernetes manifests..."
	kubectl apply -f k8s/00-namespace.yaml
	kubectl apply -f k8s/01-postgres.yaml
	kubectl apply -f k8s/02-backend.yaml
	kubectl apply -f k8s/03-frontend.yaml
	kubectl apply -f k8s/04-ingress.yaml
	@echo "Deployment Complete!"
