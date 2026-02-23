import io
import json

import pytest
from unittest.mock import patch
from httpx import ASGITransport, AsyncClient

from api.main import app
from models.database import Base, engine

@pytest.fixture(autouse=True)
def setup_db():
    Base.metadata.create_all(bind=engine)
    yield
    Base.metadata.drop_all(bind=engine)

@pytest.mark.asyncio
async def test_end_to_end_ai_analysis():
    """Validates the full Analysis persistence and Reasoning Path flow."""
    
    # 1. Start application with TestClient
    transport = ASGITransport(app=app)
    async with AsyncClient(transport=transport, base_url="http://test") as client:
    
        # 1. Register a partner user and an it_admin user
        partner_data = {"email": "partner@veritas.ai", "password": "securepassword", "role": "partner"}
        admin_data = {"email": "admin@veritas.ai", "password": "securepassword", "role": "it_admin"}
        await client.post("/auth/register", json=partner_data)
        await client.post("/auth/register", json=admin_data)
        
        # 2. Login to get both tokens
        p_resp = await client.post("/auth/login", data={"username": partner_data["email"], "password": partner_data["password"]})
        assert p_resp.status_code == 200, f"Login failed: {p_resp.text}"
        partner_token = p_resp.json()["access_token"]
        partner_headers = {"Authorization": f"Bearer {partner_token}"}
        
        a_resp = await client.post("/auth/login", data={"username": admin_data["email"], "password": admin_data["password"]})
        assert a_resp.status_code == 200, f"Login failed: {a_resp.text}"
        admin_token = a_resp.json()["access_token"]
        admin_headers = {"Authorization": f"Bearer {admin_token}"}
        
        # 3. Upload a Document
        dummy_pdf = io.BytesIO(
            b"%PDF-1.4\n1 0 obj\n<< /Type /Catalog /Pages 2 0 R >>\nendobj\n"
            b"2 0 obj\n<< /Type /Pages /Kids [3 0 R] /Count 1 >>\nendobj\n"
            b"3 0 obj\n<< /Type /Page /Parent 2 0 R /MediaBox [0 0 612 792] >>\nendobj\n"
            b"xref\n0 4\n0000000000 65535 f \n0000000009 00000 n \n0000000058 00000 n \n0000000115 00000 n \n"
            b"trailer\n<< /Size 4 /Root 1 0 R >>\nstartxref\n190\n%%EOF"
        )
        files = {"file": ("test_doc.pdf", dummy_pdf, "application/pdf")}
        
        with patch("services.document_service.pdfplumber.open", side_effect=Exception("mocked")):
            doc_resp = await client.post("/documents/upload", files=files, headers=partner_headers)
        
        assert doc_resp.status_code == 201
        doc_id = doc_resp.json()["id"]
        
        # 4. Create an active Prompt Version
        prompt_data = {
            "analysis_type": "gdpr",
            "version": "v1.0.0",
            "system_prompt": "You are a legal AI. Analyze for GDPR compliance.",
            "is_active": True
        }
        prompt_resp = await client.post("/prompts", json=prompt_data, headers=admin_headers)
        assert prompt_resp.status_code == 201
        
        # 5. Analyze the document (will gracefully degrade since Ollama is offline)
        analyze_req = {
            "document_id": doc_id,
            "analysis_type": "gdpr"
        }
        analyze_resp = await client.post("/analyze", json=analyze_req, headers=partner_headers)
        assert analyze_resp.status_code == 201
            
        result = analyze_resp.json()
        print("\n✅ Verification Successful! Reasoning Path:")
        print(json.dumps({
            "rules_triggered": result["rules_triggered"],
            "confidence_score": result["confidence_score"],
            "source_text": result["source_text"],
            "latency_seconds": result["latency_seconds"]
        }, indent=2))
        
        # Assert the formatting matches the governance requirements
        assert "rules_triggered" in result
        assert "confidence_score" in result
        assert "source_text" in result
        assert "latency_seconds" in result
