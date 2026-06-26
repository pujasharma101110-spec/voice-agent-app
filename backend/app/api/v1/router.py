# pyrefly: ignore [missing-import]
from fastapi import APIRouter

api_router = APIRouter()

# Future router imports:
# from app.api.v1.endpoints import chat, ocr, voice, document
# api_router.include_router(chat.router, prefix="/chat", tags=["Chat"])
# api_router.include_router(ocr.router, prefix="/ocr", tags=["OCR"])
# api_router.include_router(voice.router, prefix="/voice", tags=["Voice"])

@api_router.get("/")
async def root():
    return {"message": "Welcome to AI Voice Assistant API V1"}
