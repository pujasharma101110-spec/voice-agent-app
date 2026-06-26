# pyrefly: ignore [missing-import]
from sentence_transformers import SentenceTransformer
from app.config.settings import settings
from app.utils.logger import logger

class EmbeddingService:
    _instance = None

    def __new__(cls):
        if cls._instance is None:
            cls._instance = super(EmbeddingService, cls).__new__(cls)
            try:
                cls._instance.model = SentenceTransformer(settings.EMBEDDING_MODEL_NAME)
                logger.info(f"Embedding model {settings.EMBEDDING_MODEL_NAME} loaded.")
            except Exception as e:
                logger.error(f"Error loading embedding model: {e}")
                cls._instance.model = None
        return cls._instance

    def get_embeddings(self, texts: list[str]):
        if not self.model:
            return []
        return self.model.encode(texts).tolist()

embedding_service = EmbeddingService()
