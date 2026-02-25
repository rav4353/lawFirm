import time
from prometheus_client import Counter, Histogram, CollectorRegistry, REGISTRY, generate_latest, CONTENT_TYPE_LATEST
from starlette.middleware.base import BaseHTTPMiddleware
from fastapi import Response

# ── Custom Metrics ──

# API Request Latency
REQUEST_LATENCY = Histogram(
    "veritas_api_request_duration_seconds",
    "Latency of API requests in seconds",
    ["method", "endpoint"]
)

# AI Inference Latency
AI_INFERENCE_LATENCY = Histogram(
    "veritas_ai_inference_duration_seconds",
    "Latency of AI (Ollama) inference calls",
    ["model", "analysis_type"]
)

# OPA Decision Latency
OPA_DECISION_LATENCY = Histogram(
    "veritas_opa_decision_duration_seconds",
    "Latency of OPA authorization decisions"
)

# Compliance results
COMPLIANCE_RESULTS = Counter(
    "veritas_compliance_audit_total",
    "Total number of compliance audits performed",
    ["framework", "status"] # framework: gdpr/ccpa, status: PASS/FAIL
)

# Total documents processed
DOCUMENTS_PROCESSED = Counter(
    "veritas_documents_processed_total",
    "Total number of documents processed"
)

# ── Middleware ──

class PrometheusMiddleware(BaseHTTPMiddleware):
    async def dispatch(self, request, call_next):
        if request.url.path == "/metrics":
            return await call_next(request)
            
        start_time = time.time()
        response = await call_next(request)
        process_time = time.time() - start_time
        
        # Track latency for all endpoints
        endpoint = request.url.path
        REQUEST_LATENCY.labels(method=request.method, endpoint=endpoint).observe(process_time)
        
        return response

def get_metrics_response():
    """Renders all metrics in Prometheus text format."""
    return Response(content=generate_latest(REGISTRY), media_type=CONTENT_TYPE_LATEST)
