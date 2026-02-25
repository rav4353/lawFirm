import json
import logging
from typing import List, Optional, Any
from sqlalchemy.orm import Session
import httpx

from config import settings
from repositories import legal_research_repository
from schemas.legal_research import SearchQueryRequest, SearchResultResponse, CaseResponse

logger = logging.getLogger(__name__)

OLLAMA_URL = getattr(settings, "OLLAMA_URL", "http://localhost:11434")
MODEL_NAME = "mistral"
INFERENCE_TIMEOUT = 60.0

async def perform_legal_research(db: Session, user_id: str, req: SearchQueryRequest) -> SearchResultResponse:
    """Execute search and generate AI summary of results."""
    # 1. Log the query
    legal_research_repository.save_research_query(db, user_id, req)
    
    # 2. Search cases
    cases = legal_research_repository.search_cases(db, req)
    
    # 3. Generate AI Summary (Always generate, even if 0 cases found locally)
    ai_summary = await _generate_research_summary(req.query, cases)
    
    case_responses = [CaseResponse.model_validate(c) for c in cases]
    return SearchResultResponse(
        cases=case_responses,
        ai_summary=ai_summary,
        total=len(cases)
    )

async def _generate_research_summary(query: str, cases: List[Any]) -> str:
    """Use Ollama to summarize the search results in context of the query."""
    serialized_cases = ""
    for c in cases[:3]: # Summarize top 3
        serialized_cases += f"Case: {c.title}\nRuling: {c.key_ruling}\nSummary: {c.summary}\n\n"

    prompt = f"""You are a professional legal research assistant.
The user searched for: "{query}"

{f"Here are the most relevant cases found in our local database:\n" + serialized_cases if serialized_cases else "No specific cases matching this query were found in our internal database."}

Please provide a concise (2-3 paragraph) synthesis. 
If cases were provided above, explain how they relate to the search query.
If no cases were provided, provide a general legal overview of the topic based on your knowledge, but clearly state that no specific local precedents were matched.
Do not invent specific case names if not provided; only use provided info for specific citations or speak in general legal terms.
"""

    payload = {
        "model": MODEL_NAME,
        "prompt": prompt,
        "stream": False,
        "options": {"temperature": 0.3}
    }

    try:
        async with httpx.AsyncClient(timeout=INFERENCE_TIMEOUT) as client:
            response = await client.post(f"{OLLAMA_URL}/api/generate", json=payload)
            response.raise_for_status()
            data = response.json()
            return data.get("response", "AI summary unavailable.")
    except Exception as e:
        logger.error(f"Failed to generate research summary: {e}")
        return "AI analysis service is currently unavailable. Please review the case details below."
