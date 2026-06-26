# pyrefly: ignore [missing-import]
from sqlalchemy.orm import Session
from app.database.connection import SessionLocal
from app.models.document import Document
from app.ocr.paddle_service import paddle_service
from app.services.chroma_service import chroma_service
from app.utils.logger import logger

def fix_all_documents():
    db = SessionLocal()
    docs = db.query(Document).all()
    logger.info(f"Fixing {len(docs)} documents...")
    
    for doc in docs:
        logger.info(f"Processing ID {doc.id}: {doc.filename}")
        
        # 1. Re-extract text
        text = paddle_service.extract_text(doc.file_path)
        if text:
            doc.ocr_text = text
            db.commit()
            logger.info(f"Updated text for document {doc.id} (Length: {len(text)})")
            
            # 2. Re-index in Chroma
            chunks = [c.strip() for c in text.split("\n\n") if len(c.strip()) > 20]
            if not chunks:
                chunks = [text[i:i+1000] for i in range(0, len(text), 800)]
            
            ids = [f"doc_{doc.id}_chunk_{i}" for i in range(len(chunks))]
            metadatas = [{"doc_id": str(doc.id), "filename": doc.filename} for _ in chunks]
            
            try:
                chroma_service.add_chunks(chunks, ids, metadatas)
                logger.info(f"Successfully re-indexed document {doc.id}")
            except Exception as e:
                logger.error(f"Error indexing document {doc.id}: {e}")
        else:
            logger.warning(f"Still no text extracted for document {doc.id}")
    
    db.close()
    logger.info("Cleanup complete.")

if __name__ == "__main__":
    fix_all_documents()
