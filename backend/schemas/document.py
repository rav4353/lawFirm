from datetime import datetime
from typing import Optional

from pydantic import BaseModel, ConfigDict, field_serializer


class DocumentResponse(BaseModel):
    id: str
    filename: str
    content_type: str
    size_bytes: int
    extracted_text: Optional[str] = None
    uploaded_by: str
    created_at: datetime

    @field_serializer("created_at")
    def serialize_dt(self, dt: datetime):
        return dt.isoformat().replace("+00:00", "Z") if dt.tzinfo else dt.isoformat() + "Z"

    model_config = ConfigDict(from_attributes=True)


class DocumentListResponse(BaseModel):
    documents: list[DocumentResponse]
    total: int
