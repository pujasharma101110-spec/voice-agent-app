# pyrefly: ignore [missing-import]
from paddleocr import PaddleOCR
import logging

logging.basicConfig(level=logging.INFO)
print("Initializing PaddleOCR...")
try:
    ocr = PaddleOCR(use_angle_cls=True, lang='en')
    print("PaddleOCR initialized successfully!")
except Exception as e:
    print(f"Failed to initialize PaddleOCR: {e}")
