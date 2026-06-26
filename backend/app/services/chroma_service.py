# pyrefly: ignore [missing-import]
import chromadb
from app.config.settings import settings
from app.utils.logger import logger
from app.services.embedding_service import embedding_service

class ChromaService:
    def __init__(self):
        self.client = chromadb.PersistentClient(path=settings.CHROMA_DB_PATH)
        self.collection = self.client.get_or_create_collection(name="documents")
        logger.info("ChromaDB persistent client initialized.")

    def add_chunks(self, chunks: list[str], ids: list[str], metadatas: list[dict]):
        embeddings = embedding_service.get_embeddings(chunks)
        self.collection.add(
            ids=ids,
            embeddings=embeddings,
            documents=chunks,
            metadatas=metadatas
        )

    def query(self, query_text: str, n_results: int = 5, where: dict = None):
        query_embeddings = embedding_service.get_embeddings([query_text])
        return self.collection.query(
            query_embeddings=query_embeddings,
            n_results=n_results,
            where=where
        )

    def delete_by_doc_id(self, doc_id: str):
        self.collection.delete(where={"doc_id": doc_id})

chroma_service = ChromaService()
