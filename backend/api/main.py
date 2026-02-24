from contextlib import asynccontextmanager

from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

from api.routes import auth, documents, workflows, prompts, analyze, executions, audit_logs
from models.database import Base, engine
from models.workflow import Workflow  # noqa: F401
from models.prompt import PromptVersion  # noqa: F401 
from models.analysis import AnalysisResult  # noqa: F401 - DB init
from models.execution import WorkflowExecution, ExecutionStep  # noqa: F401 - DB init
from models.audit import AuditLog  # noqa: F401 - DB init


@asynccontextmanager
async def lifespan(app: FastAPI):
    # Create all tables on startup
    Base.metadata.create_all(bind=engine)
    yield


app = FastAPI(title="Veritas AI API", lifespan=lifespan)

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


@app.get("/health")
async def health_check():
    return {"status": "healthy", "service": "veritas-ai-api"}

@app.get("/")
async def root():
    return {"message": "Welcome to Veritas AI API"}
