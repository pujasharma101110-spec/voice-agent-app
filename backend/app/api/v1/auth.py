# pyrefly: ignore [missing-import]
from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from app.database.session import get_db
from app.models.user import User
from app.schemas.user import UserCreate, UserResponse, Token, GoogleToken
from app.core.security import get_password_hash, verify_password, create_access_token
from fastapi.security import OAuth2PasswordRequestForm
from google.oauth2 import id_token
from google.auth.transport import requests as google_requests
from app.config.settings import settings

router = APIRouter()

@router.post("/google", response_model=Token)
async def google_auth(token_data: GoogleToken, db: Session = Depends(get_db)):
    try:
        # Verify the token with Google
        idinfo = id_token.verify_oauth2_token(
            token_data.token, 
            google_requests.Request(), 
            settings.GOOGLE_CLIENT_ID
        )
        
        email = idinfo['email']
        
        # Check if user exists
        user = db.query(User).filter(User.email == email).first()
        if not user:
            # Create a new user for this Google account
            user = User(
                email=email,
                username=email,
                hashed_password=get_password_hash("google-oauth-placeholder") # They don't need a password
            )
            db.add(user)
            db.commit()
            db.refresh(user)
        
        access_token = create_access_token(subject=user.email)
        return {"access_token": access_token, "token_type": "bearer"}
    except ValueError as e:
        # Invalid token
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail=f"Invalid Google Token: {str(e)}"
        )

@router.post("/register", response_model=UserResponse)
async def register(user_in: UserCreate, db: Session = Depends(get_db)):
    # Check if user exists
    user = db.query(User).filter(User.email == user_in.email).first()
    if user:
        raise HTTPException(
            status_code=400,
            detail="A user with this email already exists"
        )
    
    # Create user
    new_user = User(
        email=user_in.email,
        username=user_in.email, # Use email as username for now
        hashed_password=get_password_hash(user_in.password)
    )
    db.add(new_user)
    db.commit()
    db.refresh(new_user)
    return new_user

@router.post("/login", response_model=Token)
async def login(form_data: OAuth2PasswordRequestForm = Depends(), db: Session = Depends(get_db)):
    user = db.query(User).filter(User.email == form_data.username).first()
    if not user or not verify_password(form_data.password, user.hashed_password):
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Incorrect email or password",
            headers={"WWW-Authenticate": "Bearer"},
        )
    
    access_token = create_access_token(subject=user.email)
    return {"access_token": access_token, "token_type": "bearer"}
