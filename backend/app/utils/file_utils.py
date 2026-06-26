# pyrefly: ignore [missing-import]
import os
from pathlib import Path

def get_file_size(file_path: str) -> int:
    return os.path.getsize(file_path)

def delete_file(file_path: str):
    if os.path.exists(file_path):
        os.remove(file_path)
