# pyrefly: ignore [missing-import]
from fastapi import Request, HTTPException
import time
from app.utils.logger import logger
from app.core.security import decode_token

async def auth_middleware(request: Request, call_next):
    start_time = time.time()
    
    # Define public paths
    public_paths = ["/api/v1/health", "/api/v1/auth", "/docs", "/openapi.json", "/audio"]
    
    is_public = any(request.url.path.startswith(path) for path in public_paths)
    
    if not is_public and request.method != "OPTIONS":
        auth_header = request.headers.get("Authorization")
        if not auth_header or not auth_header.startswith("Bearer "):
            raise HTTPException(status_code=401, detail="Unauthorized: Missing or invalid token")
        
        token = auth_header.split(" ")[1]
        payload = decode_token(token)
        if not payload:
            raise HTTPException(status_code=401, detail="Unauthorized: Token expired or invalid")
        
        # Attach user info to request state
        request.state.user_email = payload.get("sub")
    
    response = await call_next(request)
    
    process_time = time.time() - start_time
    logger.info(f"Path: {request.url.path} | Time: {process_time:.4f}s")
    
    return response
