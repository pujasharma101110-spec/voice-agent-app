# pyrefly: ignore [missing-import]
import chromadb
# pyrefly: ignore [missing-import]
from chromadb.config import Settings
# pyrefly: ignore [missing-import]
from sentence_transformers import SentenceTransformer
from app.config.settings import settings
from app.utils.logger import logger

class VectorStore:
    def __init__(self):
        self.client = chromadb.PersistentClient(path=settings.CHROMA_DB_PATH)
        self.model = SentenceTransformer('all-MiniLM-L6-v2')
        logger.info("ChromaDB and Embedding model initialized.")

    def get_or_create_collection(self, name: str):
        return self.client.get_or_create_collection(name=name)

    async def add_documents(self, collection_name: str, documents: list, ids: list, metadatas: list = None):
        collection = self.get_or_create_collection(collection_name)
        embeddings = self.model.encode(documents).tolist()
        collection.add(
            embeddings=embeddings,
            documents=documents,
            ids=ids,
            metadatas=metadatas
        )

    async def search(self, collection_name: str, query: str, n_results: int = 5):
        collection = self.get_or_create_collection(collection_name)
        query_embedding = self.model.encode([query]).tolist()
        return collection.query(
            query_embeddings=query_embedding,
            n_results=n_results
        )

vector_store = VectorStore()
