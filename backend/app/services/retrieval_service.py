# pyrefly: ignore [missing-import]
from app.services.chroma_service import chroma_service
from app.utils.logger import logger

class RetrievalService:
    def get_context(self, query: str, n_results: int = 5) -> str:
        try:
            results = chroma_service.query(query, n_results=n_results)
            documents = results.get("documents", [[]])[0]
            context = "\n\n".join(documents)
            return context
        except Exception as e:
            logger.error(f"Error during retrieval: {e}")
            return ""

retrieval_service = RetrievalService()
