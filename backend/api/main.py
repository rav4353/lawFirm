from contextlib import asynccontextmanager

from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

from api.routes import auth, documents, workflows, prompts, analyze, executions, audit_logs, compliance, users, rbac, legal_research
from api import analytics, case_analytics
from models.database import Base, engine
from services.metrics_service import PrometheusMiddleware, get_metrics_response

@asynccontextmanager
async def lifespan(app: FastAPI):
    # Create all tables on startup (only if not in testing)
    import os
    if os.getenv("TESTING") != "true":
        Base.metadata.create_all(bind=engine)
    yield

app = FastAPI(title="Veritas AI API", lifespan=lifespan)

# Register Prometheus Middleware
app.add_middleware(PrometheusMiddleware)

# Configure CORS
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],  # In production, specify the actual origin
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Mount routers
app.include_router(auth.router)
app.include_router(documents.router)
app.include_router(workflows.router)
app.include_router(prompts.router)
app.include_router(analyze.router)
app.include_router(executions.router)
app.include_router(audit_logs.router)
app.include_router(compliance.router)
app.include_router(users.router)
app.include_router(rbac.router)
app.include_router(legal_research.router)
app.include_router(analytics.router)
app.include_router(case_analytics.router)


@app.get("/metrics")
async def metrics():
    return get_metrics_response()

@app.get("/health")
async def health_check():
    return {"status": "healthy", "service": "veritas-ai-api"}

@app.get("/")
async def root():
    return {"message": "Welcome to Veritas AI API"}
