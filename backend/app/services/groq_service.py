# pyrefly: ignore [missing-import]
from groq import Groq
from app.config.settings import settings
from app.utils.logger import logger
import os

class GroqService:
    def __init__(self):
        self.client = Groq(api_key=settings.GROQ_API_KEY)
        self.model = settings.GROQ_MODEL
        logger.info(f"Groq service initialized with model {self.model}")

    def chat_completion(self, messages: list[dict]):
        try:
            response = self.client.chat.completions.create(
                model=self.model,
                messages=messages,
                temperature=0.7,
                max_tokens=1024
            )
            return response.choices[0].message.content
        except Exception as e:
            logger.error(f"Error calling Groq API: {e}")
            return "I'm sorry, I'm having trouble connecting to my brain right now."

    def transcribe_audio(self, audio_file_path: str):
        try:
            with open(audio_file_path, "rb") as file:
                transcription = self.client.audio.transcriptions.create(
                    file=(os.path.basename(audio_file_path), file.read()),
                    model="whisper-large-v3",
                    response_format="text",
                )
            return transcription
        except Exception as e:
            logger.error(f"Error in Whisper transcription: {e}")
            return None

groq_service = GroqService()
