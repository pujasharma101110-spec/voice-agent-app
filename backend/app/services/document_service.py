# pyrefly: ignore [missing-import]
from app.ocr.service import ocr_service
from app.rag.vector_store import vector_store
from app.utils.logger import logger

class DocumentService:
    async def process_document(self, file_path: str, user_id: str):
        logger.info(f"Processing document for user {user_id}: {file_path}")
        
        # 1. Extract text via OCR
        text = await ocr_service.extract_text(file_path)
        
        # 2. Store in Vector DB for RAG
        doc_id = f"{user_id}_{hash(file_path)}"
        await vector_store.add_documents(
            collection_name="user_docs",
            documents=[text],
            ids=[doc_id],
            metadatas=[{"user_id": user_id, "source": file_path}]
        )
        
        return {"id": doc_id, "text_preview": text[:100]}

document_service = DocumentService()
