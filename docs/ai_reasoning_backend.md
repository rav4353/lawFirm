# Module: AI Reasoning Backend

The AI backend handles document processing, compliance analysis, and generates the "reasoning path" that explains AI decisions.

## Core Capabilities
- **FastAPI Application:** Serves as the central hub for the UI and AI services.
- **Async Processing:** Handles long-running LLM tasks without blocking the main thread.
- **Text Extraction:** Uses `PyPDF2` and `pdfplumber` to convert legal documents into machine-readable text.
- **Compliance Scoring:** Logic to calculate scores based on LLM outputs.

## LLM Integration & Prompting
- **Model:** Mistral 7B (isolated pod, 8GB RAM quantized).
- **Prompt Versioning:** Prompts are stored in the database with version numbers, traceable in audit logs. No hardcoded final prompts.
- **Performance:** 30s timeout mechanism for all AI inferences.
- **Offline Inference:** Ensures zero data leakage to external cloud providers.

## AI Reasoning Path (Mandatory Output)
Every AI decision must include a reasoning trail. Responses that only return "Compliant" are invalid. Output includes:
1. **Source Text:** The specific snippet analyzed.
2. **Rules Triggered:** Which regulatory requirements (GDPR/CCPA/Policy) were violated.
3. **Confidence Score:** AI's certainty.
4. **Latency:** Time taken for the specific inference step.

## Endpoints
- `POST /analyze`: Main endpoint for document processing.
- `GET /results/{id}`: Fetching results and reasoning trails.
- `HEALTH /health`: Readiness and liveness probes for k3s.
