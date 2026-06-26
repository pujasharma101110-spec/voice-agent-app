# pyrefly: ignore [missing-import]
from paddleocr import PaddleOCR
from app.utils.logger import logger

class OCRService:
    def __init__(self, lang='en'):
        try:
            self.ocr = PaddleOCR(use_angle_cls=True, lang=lang)
            logger.info("PaddleOCR initialized successfully.")
        except Exception as e:
            logger.error(f"Failed to initialize PaddleOCR: {e}")
            self.ocr = None

    async def extract_text(self, image_path: str):
        if not self.ocr:
            return "OCR engine not available"
        
        result = self.ocr.ocr(image_path, cls=True)
        extracted_text = []
        for idx in range(len(result)):
            res = result[idx]
            for line in res:
                extracted_text.append(line[1][0])
        
        return " ".join(extracted_text)

ocr_service = OCRService()
