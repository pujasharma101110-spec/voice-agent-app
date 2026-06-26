# pyrefly: ignore [missing-import]
from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session
from sqlalchemy import func
from app.database.session import get_db
from app.models.document import Document
from app.models.message import Message
from app.schemas.history import HistoryItem
from typing import List

router = APIRouter()

@router.get("/", response_model=List[HistoryItem])
async def get_history(db: Session = Depends(get_db)):
    history = []
    
    # 1. Add Documents (OCR)
    docs = db.query(Document).all()
    for doc in docs:
        history.append(HistoryItem(
            id=f"doc_{doc.id}",
            type="ocr",
            title=doc.filename,
            excerpt=doc.ocr_text[:100] + "..." if doc.ocr_text else "No text extracted",
            time=doc.created_at,
            tag="OCR"
        ))
    
    # 2. Add Chat/Voice Sessions
    # Get distinct session_ids and their latest message
    subquery = db.query(
        Message.session_id,
        func.max(Message.created_at).label("latest")
    ).group_by(Message.session_id).subquery()
    
    latest_messages = db.query(Message).join(
        subquery,
        (Message.session_id == subquery.c.session_id) & (Message.created_at == subquery.c.latest)
    ).all()
    
    # Track added sessions to avoid duplicates if multiple messages have same latest timestamp
    seen_sessions = set()
    for msg in latest_messages:
        if msg.session_id in seen_sessions:
            continue
        seen_sessions.add(msg.session_id)
        
        # Simple heuristic for voice vs chat
        is_voice = "user_" in msg.session_id or len(msg.session_id) > 20
        history.append(HistoryItem(
            id=f"session_{msg.session_id}",
            type="voice" if is_voice else "chat",
            title=f"Session: {msg.session_id[:8]}",
            excerpt=msg.content[:100] + "...",
            time=msg.created_at,
            tag="Voice" if is_voice else "Chat"
        ))
    
    # Sort by time descending
    history.sort(key=lambda x: x.time, reverse=True)
    
    return history

@router.get("/session/{session_id}")
async def get_session_messages(session_id: str, db: Session = Depends(get_db)):
    messages = db.query(Message).filter(Message.session_id == session_id).order_by(Message.created_at.asc()).all()
    return [{"role": "ai" if m.role == "assistant" else "user", "text": m.content} for m in messages]
