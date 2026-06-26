# pyrefly: ignore [missing-import]
import os
from app.utils.logger import logger
from app.config.settings import settings

class PaddleService:
    _instance = None

    def __new__(cls):
        if cls._instance is None:
            cls._instance = super(PaddleService, cls).__new__(cls)
            try:
                import easyocr
                # Initialize EasyOCR reader
                cls._instance.reader = easyocr.Reader(['en'])
                logger.info("EasyOCR engine initialized successfully.")
            except Exception as e:
                logger.error(f"Error initializing EasyOCR: {e}")
                cls._instance.reader = None
        return cls._instance

    def extract_text(self, file_path: str) -> str:
        if not os.path.exists(file_path):
            logger.error(f"File not found: {file_path}")
            return ""

        ext = file_path.lower()

        # 1. Handle Word Documents (.docx)
        if ext.endswith(".docx"):
            try:
                import docx
                doc = docx.Document(file_path)
                text = "\n".join([para.text for para in doc.paragraphs])
                logger.info(f"Successfully extracted text from DOCX: {file_path}")
                return text
            except Exception as e:
                logger.error(f"Error during DOCX extraction: {e}")
                return ""

        # 2. Handle PDFs (Direct extraction)
        if ext.endswith(".pdf"):
            try:
                import fitz
                doc = fitz.open(file_path)
                text = ""
                for page in doc:
                    text += page.get_text()
                doc.close()
                if text.strip():
                    logger.info(f"Successfully extracted text from digital PDF: {file_path}")
                    return text
                logger.info(f"No digital text found in PDF, falling back to OCR: {file_path}")
            except Exception as e:
                logger.error(f"Error during PDF text extraction: {e}")

        # 3. Fallback to EasyOCR (for images and scanned documents)
        if not self.reader:
            return ""
        
        try:
            # EasyOCR returns a list of (bbox, text, confidence)
            results = self.reader.readtext(file_path)
            full_text = [res[1] for res in results]
            return "\n".join(full_text)
        except Exception as e:
            logger.error(f"Error during OCR extraction: {e}")
            return ""

paddle_service = PaddleService()
