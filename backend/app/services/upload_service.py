# pyrefly: ignore [missing-import]
import shutil
from pathlib import Path
import uuid
from fastapi import UploadFile
from app.config.settings import settings
from app.utils.logger import logger

class UploadService:
    def __init__(self):
        self.upload_dir = settings.UPLOAD_DIR
        self.upload_dir.mkdir(parents=True, exist_ok=True)

    async def save_file(self, file: UploadFile) -> str:
        file_extension = Path(file.filename).suffix
        unique_filename = f"{uuid.uuid4()}{file_extension}"
        file_path = self.upload_dir / unique_filename
        
        try:
            with file_path.open("wb") as buffer:
                shutil.copyfileobj(file.file, buffer)
            logger.info(f"File saved to {file_path}")
            return str(file_path)
        except Exception as e:
            logger.error(f"Failed to save file: {e}")
            raise e

upload_service = UploadService()
