# pyrefly: ignore [missing-import]
from fastapi import APIRouter, WebSocket, WebSocketDisconnect
from app.websocket.manager import manager 
from app.services.groq_service import groq_service
from app.utils.logger import logger
from app.database.connection import SessionLocal
from app.models.message import Message
import json
import os

router = APIRouter()

@router.websocket("/ws/voice/{client_id}")
async def voice_websocket(websocket: WebSocket, client_id: str):
    await manager.connect(websocket, client_id)
    db = SessionLocal()
    try:
        while True:
            data = await websocket.receive()
            
            transcript = ""
            if "text" in data:
                message_data = json.loads(data["text"])
                transcript = message_data.get("text", "")
            elif "bytes" in data:
                import uuid
                from app.config.settings import settings
                temp_filename = f"temp_{uuid.uuid4()}.webm"
                temp_path = settings.AUDIO_DIR / temp_filename
                
                with open(temp_path, "wb") as f:
                    f.write(data["bytes"])
                
                transcript = groq_service.transcribe_audio(str(temp_path))
                
                if os.path.exists(temp_path):
                    os.remove(temp_path)

                if transcript and len(transcript.strip()) > 0:
                    logger.info(f"Whisper Transcribed: {transcript}")
                    
                    # 1. Save User Message
                    user_msg = Message(
                        session_id=client_id,
                        role="user",
                        content=transcript
                    )
                    db.add(user_msg)
                    db.commit()
                    
                    # 2. Send the "You" message back to sync the UI
                    await websocket.send_text(json.dumps({
                        "type": "user_transcript",
                        "text": transcript
                    }))
                    
                    # 3. Get AI Response with RAG Context
                    from app.services.retrieval_service import retrieval_service
                    context = retrieval_service.get_context(transcript)
                    
                    system_prompt = f"You are a helpful voice assistant. Use the following context from the user's documents to answer: {context}. Keep responses concise and friendly for voice conversation."
                    
                    messages = [
                        {"role": "system", "content": system_prompt},
                        {"role": "user", "content": transcript}
                    ]
                    ai_response = groq_service.chat_completion(messages)
                    
                    # 4. Save Assistant Message
                    assistant_msg = Message(
                        session_id=client_id,
                        role="assistant",
                        content=ai_response
                    )
                    db.add(assistant_msg)
                    db.commit()
                    
                    # 5. Generate TTS Audio
                    from app.services.tts_service import tts_service
                    audio_filename = tts_service.generate_speech(ai_response)
                    audio_url = f"/audio/{audio_filename}" if audio_filename else None
                    
                    # 6. Send AI response with audio URL
                    await websocket.send_text(json.dumps({
                        "type": "ai_response",
                        "text": ai_response,
                        "audio_url": audio_url
                    }))
                else:
                    logger.warning("Whisper returned empty transcript.")
            
    except WebSocketDisconnect:
        manager.disconnect(websocket, client_id)
        logger.info(f"Client {client_id} disconnected.")
    except Exception as e:
        logger.error(f"WebSocket error: {e}")
        if websocket.client_state.name != "DISCONNECTED":
            await websocket.close()
    finally:
        db.close()
