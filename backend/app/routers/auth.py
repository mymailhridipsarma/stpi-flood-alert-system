from fastapi import APIRouter, HTTPException, Depends, status
from app.models.auth import UserRegister, UserLogin, Token
from app.database import supabase_client
from gotrue.errors import AuthApiError

router = APIRouter(prefix="/auth", tags=["auth"])

@router.post("/register", response_model=Token)
async def register(user_data: UserRegister):
    """
    Registers a new user on Supabase auth backend.
    """
    try:
        response = supabase_client.auth.sign_up({
            "email": user_data.email,
            "password": user_data.password,
            "options": {
                "data": {
                    "full_name": user_data.full_name or ""
                }
            }
        })
        if not response.session:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="Registration succeeded, but please confirm your email first."
            )
        return Token(
            access_token=response.session.access_token,
            token_type="bearer"
        )
    except AuthApiError as e:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=str(e.message)
        )
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"An unexpected error occurred during registration: {str(e)}"
        )

@router.post("/login", response_model=Token)
async def login(user_data: UserLogin):
    """
    Authenticates user and returns JWT token.
    """
    try:
        response = supabase_client.auth.sign_in_with_password({
            "email": user_data.email,
            "password": user_data.password
        })
        if not response.session:
            raise HTTPException(
                status_code=status.HTTP_401_UNAUTHORIZED,
                detail="Invalid credentials or email not confirmed."
            )
        return Token(
            access_token=response.session.access_token,
            token_type="bearer"
        )
    except AuthApiError as e:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail=str(e.message)
        )
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Login failed: {str(e)}"
        )
