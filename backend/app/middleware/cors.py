# pyrefly: ignore [missing-import]
from fastapi.middleware.cors import CORSMiddleware
from app.config.settings import settings

def add_cors_middleware(app):
    app.add_middleware(
        CORSMiddleware,
        allow_origins=["http://localhost:8080"],
        allow_credentials=True,
        allow_methods=["*"],
        allow_headers=["*"],
    )
