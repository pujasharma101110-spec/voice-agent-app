# pyrefly: ignore [missing-import]
from fastapi import APIRouter, UploadFile, File, Depends
from sqlalchemy.orm import Session
from app.database.session import get_db
from app.services.upload_service import upload_service
from app.ocr.paddle_service import paddle_service
from app.models.document import Document
from app.schemas.document import DocumentResponse
from app.utils.logger import logger

router = APIRouter()

from app.models.chunk import Chunk

@router.post("/", response_model=DocumentResponse)
async def upload_document(
    file: UploadFile = File(...),
    db: Session = Depends(get_db)
):
    logger.info(f"Uploading file: {file.filename}")
    
    # 1. Save file locally
    file_path = await upload_service.save_file(file)
    
    # 2. OCR Extraction
    text = paddle_service.extract_text(file_path)
    
    # 3. Store in Database
    new_doc = Document(
        filename=file.filename,
        file_path=file_path,
        file_type=file.content_type,
        ocr_text=text
    )
    db.add(new_doc)
    db.commit()
    db.refresh(new_doc)
    
    # 4. Index in ChromaDB and SQL Chunks
    if text:
        try:
            from app.services.chroma_service import chroma_service
            # Simple chunking logic
            raw_chunks = [c.strip() for c in text.split("\n\n") if len(c.strip()) > 20]
            if not raw_chunks:
                raw_chunks = [text[i:i+1000] for i in range(0, len(text), 800)]
            
            # Save to SQL Chunk table
            for i, chunk_text in enumerate(raw_chunks):
                sql_chunk = Chunk(
                    document_id=new_doc.id,
                    content=chunk_text,
                    vector_id=f"doc_{new_doc.id}_chunk_{i}"
                )
                db.add(sql_chunk)
            db.commit()

            # Save to Vector DB (Chroma)
            ids = [f"doc_{new_doc.id}_chunk_{i}" for i in range(len(raw_chunks))]
            metadatas = [{"doc_id": str(new_doc.id), "filename": file.filename} for _ in raw_chunks]
            chroma_service.add_chunks(raw_chunks, ids, metadatas)
            
            logger.info(f"Indexed {len(raw_chunks)} chunks for document {new_doc.id}")
        except Exception as e:
            logger.error(f"Failed to index document {new_doc.id}: {e}")
    
    return new_doc
