# pyrefly: ignore [missing-import]
from gtts import gTTS
import os
import uuid
from app.config.settings import settings
from app.utils.logger import logger

class TTSService:
    def __init__(self):
        self.audio_dir = settings.AUDIO_DIR
        self.audio_dir.mkdir(parents=True, exist_ok=True)

    def generate_speech(self, text: str) -> str:
        """
        Converts text to speech and returns the relative path to the audio file.
        """
        try:
            filename = f"speech_{uuid.uuid4()}.mp3"
            filepath = self.audio_dir / filename
            
            tts = gTTS(text=text, lang='en')
            tts.save(str(filepath))
            
            logger.info(f"Generated TTS audio: {filename}")
            return filename
        except Exception as e:
            logger.error(f"Error generating TTS: {e}")
            return ""

tts_service = TTSService()
