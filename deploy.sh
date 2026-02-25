#!/bin/bash
set -euo pipefail

# ╔══════════════════════════════════════════════════════════════╗
# ║  Veritas AI — One-Command Deployment to k3d                 ║
# ║  Usage:  ./deploy.sh                                        ║
# ║  Teardown: ./deploy.sh teardown                             ║
# ╚══════════════════════════════════════════════════════════════╝

CLUSTER_NAME="veritas"
NAMESPACE="veritas"
ROOT_DIR="$( cd "$( dirname "${BASH_SOURCE[0]}" )" && pwd )"

# ---- Colors ----
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
CYAN='\033[0;36m'
NC='\033[0m'

info()  { echo -e "${CYAN}[INFO]${NC}  $1"; }
ok()    { echo -e "${GREEN}[OK]${NC}    $1"; }
warn()  { echo -e "${YELLOW}[WARN]${NC}  $1"; }
error() { echo -e "${RED}[ERROR]${NC} $1"; exit 1; }

# ────────────────────────────────────────────────────────────────
# Teardown
# ────────────────────────────────────────────────────────────────
if [ "${1:-}" = "teardown" ]; then
  info "Tearing down k3d cluster '${CLUSTER_NAME}'..."
  k3d cluster delete "${CLUSTER_NAME}" 2>/dev/null || true
  ok "Cluster deleted."
  exit 0
fi

# ────────────────────────────────────────────────────────────────
# Step 0: Prerequisites check
# ────────────────────────────────────────────────────────────────
info "Checking prerequisites..."

for cmd in docker k3d kubectl; do
  if ! command -v "$cmd" &>/dev/null; then
    error "'$cmd' is not installed. Please install it first."
  fi
done

if ! docker info &>/dev/null; then
  error "Docker daemon is not running. Please start Docker Desktop."
fi

ok "All prerequisites met (docker, k3d, kubectl)"

# ────────────────────────────────────────────────────────────────
# Step 1: Create k3d cluster
# ────────────────────────────────────────────────────────────────
if k3d cluster list 2>/dev/null | grep -q "${CLUSTER_NAME}"; then
  warn "Cluster '${CLUSTER_NAME}' already exists. Reusing it."
else
  info "Creating k3d cluster '${CLUSTER_NAME}'..."
  k3d cluster create "${CLUSTER_NAME}" \
    --port "80:80@loadbalancer" \
    --port "443:443@loadbalancer" \
    --agents 1 \
    --wait
  ok "Cluster '${CLUSTER_NAME}' created."
fi

# Point kubectl to our cluster
kubectl config use-context "k3d-${CLUSTER_NAME}"

# ────────────────────────────────────────────────────────────────
# Step 2: Build Docker images
# ────────────────────────────────────────────────────────────────
info "Building Docker images..."

docker build -t veritas-ai-backend:latest "${ROOT_DIR}/backend"
ok "Backend image built."

docker build -t veritas-ai-frontend:latest "${ROOT_DIR}/frontend"
ok "Frontend image built."

# ────────────────────────────────────────────────────────────────
# Step 3: Import images into k3d
# ────────────────────────────────────────────────────────────────
info "Importing images into k3d cluster..."

k3d image import veritas-ai-backend:latest -c "${CLUSTER_NAME}"
k3d image import veritas-ai-frontend:latest -c "${CLUSTER_NAME}"

ok "Images imported."

# ────────────────────────────────────────────────────────────────
# Step 4: Apply K8s manifests (in dependency order)
# ────────────────────────────────────────────────────────────────
info "Applying Kubernetes manifests..."

# Namespace first
kubectl apply -f "${ROOT_DIR}/k8s/00-namespace.yaml"

# Storage layer
kubectl apply -f "${ROOT_DIR}/k8s/01-postgres.yaml"
kubectl apply -f "${ROOT_DIR}/k8s/06-minio.yaml"

# AI layer
kubectl apply -f "${ROOT_DIR}/k8s/07-ollama.yaml"

# Auth layer
kubectl apply -f "${ROOT_DIR}/k8s/05-opa.yaml"

# Application layer
kubectl apply -f "${ROOT_DIR}/k8s/02-backend.yaml"
kubectl apply -f "${ROOT_DIR}/k8s/03-frontend.yaml"

# Ingress
kubectl apply -f "${ROOT_DIR}/k8s/04-ingress.yaml"

# Monitoring
kubectl apply -f "${ROOT_DIR}/k8s/monitoring/prometheus.yaml"
kubectl apply -f "${ROOT_DIR}/k8s/monitoring/grafana.yaml"

ok "All manifests applied."

# ────────────────────────────────────────────────────────────────
# Step 5: Wait for rollouts
# ────────────────────────────────────────────────────────────────
info "Waiting for deployments to become ready..."

DEPLOYMENTS=("postgres" "minio" "opa" "backend" "frontend" "ollama" "prometheus" "grafana")

for dep in "${DEPLOYMENTS[@]}"; do
  info "  Waiting for ${dep}..."
  kubectl rollout status deployment/"${dep}" -n "${NAMESPACE}" --timeout=180s || {
    warn "Deployment '${dep}' did not become ready in time. Check: kubectl describe deployment/${dep} -n ${NAMESPACE}"
  }
done

ok "All deployments are ready."

# ────────────────────────────────────────────────────────────────
# Step 6: Pull Ollama model (async)
# ────────────────────────────────────────────────────────────────
info "Pulling Mistral 7B quantised model into Ollama (this may take a few minutes)..."

OLLAMA_POD=$(kubectl get pod -n "${NAMESPACE}" -l app=ollama -o jsonpath='{.items[0].metadata.name}' 2>/dev/null || echo "")
if [ -n "${OLLAMA_POD}" ]; then
  kubectl exec -n "${NAMESPACE}" "${OLLAMA_POD}" -- ollama pull mistral:7b-instruct-v0.3-q4_0 &
  PULL_PID=$!
  info "  Model pull running in background (PID ${PULL_PID}). You can check progress with:"
  info "  kubectl logs -f ${OLLAMA_POD} -n ${NAMESPACE}"
else
  warn "Could not find Ollama pod. Pull the model manually after deployment."
fi

# ────────────────────────────────────────────────────────────────
# Step 7: Print summary
# ────────────────────────────────────────────────────────────────
echo ""
echo -e "${CYAN}╔══════════════════════════════════════════════════════════╗${NC}"
echo -e "${CYAN}║         Veritas AI — Deployment Complete! 🚀            ║${NC}"
echo -e "${CYAN}╠══════════════════════════════════════════════════════════╣${NC}"
echo -e "${CYAN}║${NC}  Frontend:     ${GREEN}http://localhost${NC}                       ${CYAN}║${NC}"
echo -e "${CYAN}║${NC}  Backend API:  ${GREEN}http://localhost/api${NC}                   ${CYAN}║${NC}"
echo -e "${CYAN}║${NC}  Backend Docs: ${GREEN}http://localhost/api/docs${NC}              ${CYAN}║${NC}"
echo -e "${CYAN}║${NC}  Grafana:      ${GREEN}http://localhost/grafana${NC}  (admin/veritas) ${CYAN}║${NC}"
echo -e "${CYAN}║${NC}  Prometheus:   ${GREEN}http://localhost/prometheus${NC}            ${CYAN}║${NC}"
echo -e "${CYAN}╠══════════════════════════════════════════════════════════╣${NC}"
echo -e "${CYAN}║${NC}  Teardown:     ${YELLOW}./deploy.sh teardown${NC}                  ${CYAN}║${NC}"
echo -e "${CYAN}║${NC}  Pod status:   ${YELLOW}kubectl get pods -n veritas${NC}           ${CYAN}║${NC}"
echo -e "${CYAN}╚══════════════════════════════════════════════════════════╝${NC}"
echo ""
