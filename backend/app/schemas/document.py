# pyrefly: ignore [missing-import]
from pydantic import BaseModel
from typing import Optional, List
from datetime import datetime

class DocumentBase(BaseModel):
    filename: str
    file_type: str

class DocumentCreate(DocumentBase):
    file_path: str

class DocumentResponse(DocumentBase):
    id: int
    created_at: datetime
    ocr_text: Optional[str] = None

    class Config:
        from_attributes = True
