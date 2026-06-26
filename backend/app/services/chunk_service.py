# pyrefly: ignore [missing-import]
from langchain.text_splitter import RecursiveCharacterTextSplitter
from app.config.settings import settings

class ChunkService:
    def __init__(self):
        self.text_splitter = RecursiveCharacterTextSplitter(
            chunk_size=settings.CHUNK_SIZE,
            chunk_overlap=settings.CHUNK_OVERLAP,
            length_function=len,
        )

    def split_text(self, text: str) -> list[str]:
        return self.text_splitter.split_text(text)

chunk_service = ChunkService()
