# pyrefly: ignore [missing-import]
from sqlalchemy.orm import Session
from app.database.connection import SessionLocal
from app.models.document import Document
from app.services.chroma_service import chroma_service
from app.utils.logger import logger

def reindex_all():
    db = SessionLocal()
    docs = db.query(Document).all()
    logger.info(f"Re-indexing {len(docs)} documents...")
    
    for doc in docs:
        if doc.ocr_text:
            # Simple chunking
            chunks = [c.strip() for c in doc.ocr_text.split("\n\n") if len(c.strip()) > 20]
            if not chunks:
                chunks = [doc.ocr_text[i:i+1000] for i in range(0, len(doc.ocr_text), 800)]
            
            ids = [f"doc_{doc.id}_chunk_{i}" for i in range(len(chunks))]
            metadatas = [{"doc_id": str(doc.id), "filename": doc.filename} for _ in chunks]
            
            try:
                chroma_service.add_chunks(chunks, ids, metadatas)
                logger.info(f"Successfully re-indexed document {doc.id}: {doc.filename}")
            except Exception as e:
                logger.error(f"Error indexing document {doc.id}: {e}")
    
    db.close()
    logger.info("Re-indexing complete.")

if __name__ == "__main__":
    reindex_all()
