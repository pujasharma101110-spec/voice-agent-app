from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session
from app.database.session import get_db
from app.models.message import Message
from app.schemas.chat import ChatRequest, ChatResponse
from app.services.retrieval_service import retrieval_service
from app.services.groq_service import groq_service
from app.utils.logger import logger

router = APIRouter()

@router.post("/", response_model=ChatResponse)
async def chat_with_ai(request: ChatRequest, db: Session = Depends(get_db)):
    logger.info(f"Chat request received: {request.query}")
    
    # 1. Save User Message
    user_msg = Message(
        session_id=request.session_id,
        role="user",
        content=request.query
    )
    db.add(user_msg)
    
    # 2. Retrieve Context from Vector DB
    context = retrieval_service.get_context(request.query)
    
    # 3. Build Messages for LLM
    messages = [
        {"role": "system", "content": f"You are a helpful assistant. Use the following context to answer: {context}"},
        *request.history,
        {"role": "user", "content": request.query}
    ]
    
    # 4. Call Groq
    response = groq_service.chat_completion(messages)
    
    # 5. Save Assistant Message
    assistant_msg = Message(
        session_id=request.session_id,
        role="assistant",
        content=response
    )
    db.add(assistant_msg)
    db.commit()
    
    return ChatResponse(response=response, session_id=request.session_id)
