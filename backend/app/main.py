# pyrefly: ignore [missing-import]
from fastapi import FastAPI
from app.api.v1.health import router as health_router
from app.api.v1.upload import router as upload_router
from app.api.v1.chat import router as chat_router
from app.api.v1.documents import router as doc_router
from app.api.v1.history import router as history_router
from app.api.v1.auth import router as auth_router
from app.websocket.voice_socket import router as ws_router
from app.middleware.cors import add_cors_middleware
from fastapi.staticfiles import StaticFiles
from app.config.settings import settings
from app.utils.logger import logger
import app.models

app = FastAPI(title=settings.PROJECT_NAME)

# Mount Static Files
app.mount("/audio", StaticFiles(directory=str(settings.AUDIO_DIR)), name="audio")

# Middleware
add_cors_middleware(app)

# Include Routers
app.include_router(health_router, prefix=f"{settings.API_V1_STR}/health", tags=["Health"])
app.include_router(auth_router, prefix=f"{settings.API_V1_STR}/auth", tags=["Auth"])
app.include_router(upload_router, prefix=f"{settings.API_V1_STR}/upload", tags=["Upload"])
app.include_router(chat_router, prefix=f"{settings.API_V1_STR}/chat", tags=["Chat"])
app.include_router(doc_router, prefix=f"{settings.API_V1_STR}/documents", tags=["Documents"])
app.include_router(history_router, prefix=f"{settings.API_V1_STR}/history", tags=["History"])
app.include_router(ws_router, tags=["WebSocket"])

@app.on_event("startup")
async def startup_event():
    logger.info("Initializing Voice AI Backend...")

@app.get("/")
async def root():
    return {"message": "Welcome to Voice AI Backend API"}
