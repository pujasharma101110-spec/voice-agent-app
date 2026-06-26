# pyrefly: ignore [missing-import]
from pydantic import BaseModel, EmailStr, Field
from datetime import datetime
from typing import Optional

class UserBase(BaseModel):
    email: EmailStr

class UserCreate(UserBase):
    password: str = Field(..., min_length=8, max_length=72)

class UserResponse(UserBase):
    id: int
    created_at: datetime

    class Config:
        from_attributes = True
        # or orm_mode = True for older pydantic

class Token(BaseModel):
    access_token: str
    token_type: str

class TokenData(BaseModel):
    email: Optional[str] = None

class GoogleToken(BaseModel):
    token: str
