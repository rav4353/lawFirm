import time
from datetime import datetime, timezone
from typing import Any

from fastapi import HTTPException, UploadFile, status
from sqlalchemy.orm import Session

from repositories import execution_repository, workflow_repository
from schemas.analysis import AnalysisRequest
from services import analyze_service, document_service


def _now():
    return datetime.now(timezone.utc)


def _topological_order(nodes: list[dict], edges: list[dict]) -> list[dict]:
    node_map = {n["id"]: n for n in nodes}
    in_deg: dict[str, int] = {n["id"]: 0 for n in nodes}
    adj: dict[str, list[str]] = {n["id"]: [] for n in nodes}

    for e in edges:
        src = e.get("source")
        tgt = e.get("target")
        if src in adj and tgt in in_deg:
            adj[src].append(tgt)
            in_deg[tgt] += 1

    queue = [nid for nid, d in in_deg.items() if d == 0]
    ordered_ids: list[str] = []

    while queue:
        nid = queue.pop(0)
        ordered_ids.append(nid)
        for nxt in adj.get(nid, []):
            in_deg[nxt] -= 1
            if in_deg[nxt] == 0:
                queue.append(nxt)

    if len(ordered_ids) != len(nodes):
        raise HTTPException(
            status_code=status.HTTP_422_UNPROCESSABLE_ENTITY,
            detail="Workflow graph contains a cycle or disconnected references.",
        )

    return [node_map[nid] for nid in ordered_ids]


async def execute_workflow(
    db: Session,
    workflow_id: str,
    file: UploadFile,
    user_id: str,
) -> dict[str, Any]:
    wf = workflow_repository.get_workflow_by_id(db, workflow_id)
    if not wf:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Workflow not found.",
        )

    nodes = wf.nodes
    edges = wf.edges

    if not nodes:
        raise HTTPException(
            status_code=status.HTTP_422_UNPROCESSABLE_ENTITY,
            detail="Workflow has no nodes to execute.",
        )

    ordered_nodes = _topological_order(nodes, edges)

    execution = execution_repository.create_execution(
        db,
        workflow_id=workflow_id,
        document_id=None,
        status="running",
        triggered_by=user_id,
        started_at=_now(),
    )

    ctx: dict[str, Any] = {
        "document": None,
        "analyses": [],
    }

    try:
        for node in ordered_nodes:
            node_id = node.get("id")
            node_type = node.get("type")

            step = execution_repository.create_step(
                db,
                execution_id=execution.id,
                node_id=str(node_id),
                node_type=str(node_type),
                status="running",
                started_at=_now(),
                input_payload={"node": node},
            )

            start_time = time.monotonic()
            try:
                output: dict[str, Any] = {}

                if node_type == "document_upload":
                    doc = await document_service.upload_document(db, file, user_id)
                    ctx["document"] = doc
                    execution_repository.update_execution(db, execution, document_id=doc.id)
                    output = {
                        "document_id": doc.id,
                        "filename": doc.filename,
                        "size_bytes": doc.size_bytes,
                    }

                elif node_type == "extract_text":
                    doc = ctx.get("document")
                    if not doc:
                        raise HTTPException(
                            status_code=status.HTTP_422_UNPROCESSABLE_ENTITY,
                            detail="extract_text requires a document from document_upload.",
                        )
                    text = doc.extracted_text or ""
                    output = {
                        "extracted": bool(text),
                        "chars": len(text),
                        "preview": text[:500],
                    }

                elif node_type in {"analyze_gdpr", "analyze_ccpa"}:
                    doc = ctx.get("document")
                    if not doc:
                        raise HTTPException(
                            status_code=status.HTTP_422_UNPROCESSABLE_ENTITY,
                            detail="analysis requires a document from document_upload.",
                        )
                    analysis_type = "gdpr" if node_type == "analyze_gdpr" else "ccpa"
                    req = AnalysisRequest(
                        document_id=doc.id,
                        analysis_type=analysis_type,
                        workflow_id=workflow_id,
                    )
                    result = await analyze_service.process_analysis(db, req, user_id)
                    analysis_payload = {
                        "analysis_result_id": result.id,
                        "analysis_type": result.analysis_type,
                        "rules_triggered": result.rules_triggered,
                        "confidence_score": result.confidence_score,
                        "source_text": result.source_text,
                        "latency_seconds": result.latency_seconds,
                        "created_at": result.created_at.isoformat(),
                    }
                    ctx["analyses"].append(analysis_payload)
                    output = analysis_payload

                elif node_type == "score_compliance":
                    analyses = ctx.get("analyses", [])
                    if not analyses:
                        raise HTTPException(
                            status_code=status.HTTP_422_UNPROCESSABLE_ENTITY,
                            detail="score_compliance requires at least one analysis node.",
                        )

                    # Minimal deterministic scoring heuristic for MVP/demo
                    penalties = 0
                    for a in analyses:
                        rules = (a.get("rules_triggered") or "").strip().lower()
                        if rules and rules != "none":
                            penalties += 25

                    score = max(0, 100 - penalties)
                    output = {
                        "score": score,
                        "analyses": analyses,
                        "verdict": "compliant" if score == 100 else "needs_review",
                    }

                else:
                    raise HTTPException(
                        status_code=status.HTTP_422_UNPROCESSABLE_ENTITY,
                        detail=f"Unknown or unsupported node type '{node_type}'.",
                    )

                latency = time.monotonic() - start_time
                execution_repository.update_step(
                    db,
                    step,
                    status="succeeded",
                    finished_at=_now(),
                    output_payload=output,
                    latency_seconds=latency,
                )

            except Exception as exc:
                latency = time.monotonic() - start_time
                execution_repository.update_step(
                    db,
                    step,
                    status="failed",
                    finished_at=_now(),
                    error_message=str(exc),
                    output_payload=None,
                    latency_seconds=latency,
                )
                raise

        execution = execution_repository.update_execution(
            db,
            execution,
            status="succeeded",
            finished_at=_now(),
        )

    except Exception as exc:
        execution = execution_repository.update_execution(
            db,
            execution,
            status="failed",
            finished_at=_now(),
            error_message=str(exc),
        )

    steps = execution_repository.list_steps_for_execution(db, execution.id)
    return {
        "execution": execution,
        "steps": steps,
    }
