# pyrefly: ignore [missing-import]
from pydantic import BaseModel

class VoiceTranscript(BaseModel):
    text: str
    session_id: str

class VoiceResponse(BaseModel):
    text: str
    audio_url: Optional[str] = None
