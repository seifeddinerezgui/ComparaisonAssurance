from datetime import timedelta
from fastapi import APIRouter, Depends, HTTPException, status
from fastapi.security import OAuth2PasswordRequestForm
from sqlalchemy.orm import Session

from app.auth.service import authenticate_user, create_access_token, get_current_user
from app.auth.schemas import Token, UserCreate, UserResponse
from app.auth.models import User
from app.auth.utils import get_password_hash
from app.config import settings
from app.database import get_db
from app.integrations.hubspot.client import get_hubspot_auth_url, exchange_code_for_token, get_hubspot_user_info

router = APIRouter()


@router.post("/login", response_model=Token)
async def login_for_access_token(
    form_data: OAuth2PasswordRequestForm = Depends(),
    db: Session = Depends(get_db)
):
    """
    Authenticate a user and return an access token
    """
    user = authenticate_user(db, form_data.username, form_data.password)
    if not user:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Incorrect username or password",
            headers={"WWW-Authenticate": "Bearer"},
        )
    access_token_expires = timedelta(minutes=settings.ACCESS_TOKEN_EXPIRE_MINUTES)
    access_token = create_access_token(
        data={"sub": user.email}, expires_delta=access_token_expires
    )
    return {"access_token": access_token, "token_type": "bearer"}


@router.post("/register", response_model=UserResponse, status_code=status.HTTP_201_CREATED)
async def register_user(user_create: UserCreate, db: Session = Depends(get_db)):
    """
    Register a new user
    """
    # Check if user with this email already exists
    existing_user = db.query(User).filter(User.email == user_create.email).first()
    if existing_user:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Email already registered"
        )
    
    # Create new user
    new_user = User(
        email=user_create.email,
        hashed_password=get_password_hash(user_create.password),
        first_name=user_create.first_name,
        last_name=user_create.last_name,
        is_admin=False
    )
    db.add(new_user)
    db.commit()
    db.refresh(new_user)
    return new_user


@router.get("/me", response_model=UserResponse)
async def read_users_me(current_user: User = Depends(get_current_user)):
    """
    Get the currently authenticated user
    """
    return current_user


@router.get("/hubspot/auth-url")
async def get_hubspot_authorization_url():
    """
    Get the HubSpot authorization URL
    """
    auth_url = get_hubspot_auth_url()
    return {"auth_url": auth_url}


@router.post("/hubspot/callback", response_model=Token)
async def hubspot_callback(code: str, db: Session = Depends(get_db)):
    """
    Handle HubSpot OAuth callback and create user if needed
    """
    # Exchange authorization code for access token
    token_data = exchange_code_for_token(code)
    if not token_data or "access_token" not in token_data:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Failed to obtain access token from HubSpot"
        )
    
    # Get user info from HubSpot
    user_info = get_hubspot_user_info(token_data["access_token"])
    if not user_info or "email" not in user_info:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Failed to get user information from HubSpot"
        )
    
    # Check if user exists, create if not
    email = user_info["email"]
    user = db.query(User).filter(User.email == email).first()
    
    if not user:
        # Create new user from HubSpot data
        user = User(
            email=email,
            first_name=user_info.get("first_name", ""),
            last_name=user_info.get("last_name", ""),
            is_hubspot_user=True,
            hubspot_id=user_info.get("id", ""),
            hubspot_access_token=token_data["access_token"],
            hubspot_refresh_token=token_data.get("refresh_token", ""),
            hashed_password=""  # Hubspot users don't have a password
        )
        db.add(user)
        db.commit()
        db.refresh(user)
    else:
        # Update existing user with new HubSpot tokens
        user.is_hubspot_user = True
        user.hubspot_id = user_info.get("id", "")
        user.hubspot_access_token = token_data["access_token"]
        user.hubspot_refresh_token = token_data.get("refresh_token", "")
        db.commit()
        db.refresh(user)
    
    # Create access token for our system
    access_token_expires = timedelta(minutes=settings.ACCESS_TOKEN_EXPIRE_MINUTES)
    access_token = create_access_token(
        data={"sub": user.email}, expires_delta=access_token_expires
    )
    
    return {"access_token": access_token, "token_type": "bearer"}
