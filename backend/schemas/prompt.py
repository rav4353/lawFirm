from datetime import datetime

from pydantic import BaseModel, ConfigDict, Field


class PromptVersionCreate(BaseModel):
    analysis_type: str = Field(..., description="e.g. gdpr, ccpa")
    version: str = Field(..., description="e.g. v1.0.0")
    system_prompt: str = Field(..., min_length=10)
    is_active: bool = False


class PromptVersionResponse(BaseModel):
    id: str
    analysis_type: str
    version: str
    system_prompt: str
    is_active: bool
    created_at: datetime

    model_config = ConfigDict(from_attributes=True)


class PromptListResponse(BaseModel):
    prompts: list[PromptVersionResponse]
    total: int
