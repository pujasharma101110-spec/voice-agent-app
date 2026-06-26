from pydantic import BaseModel
from typing import List, Optional
from datetime import datetime

class HistoryItem(BaseModel):
    id: str
    type: str # chat, voice, ocr
    title: str
    excerpt: str
    time: datetime
    tag: str
