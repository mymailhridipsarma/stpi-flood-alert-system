from fastapi import APIRouter, HTTPException, Depends, status, Header
from app.database import supabase_client
from typing import Dict, Any

router = APIRouter(prefix="/users", tags=["users"])

def get_current_user(authorization: str = Header(...)):
    """
    Validates the bearer token against Supabase auth.
    """
    if not authorization.startswith("Bearer "):
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Invalid authorization header format."
        )
    token = authorization.split(" ")[1]
    try:
        user_res = supabase_client.auth.get_user(token)
        if not user_res or not user_res.user:
            raise HTTPException(
                status_code=status.HTTP_401_UNAUTHORIZED,
                detail="Invalid or expired token."
            )
        return user_res.user
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail=f"Authentication failed: {str(e)}"
        )

@router.get("/me")
async def get_user_profile(user=Depends(get_current_user)):
    """
    Returns authenticated user profile details.
    """
    return {
        "id": user.id,
        "email": user.email,
        "user_metadata": user.user_metadata,
        "last_sign_in_at": user.last_sign_in_at
    }
