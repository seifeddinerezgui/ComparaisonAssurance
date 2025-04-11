from sqlalchemy.orm import Session

from app.auth.models import User


def get_user_by_email(db: Session, email: str):
    """
    Get a user by email
    """
    return db.query(User).filter(User.email == email).first()


def get_user_by_id(db: Session, user_id: int):
    """
    Get a user by ID
    """
    return db.query(User).filter(User.id == user_id).first()


def get_users(db: Session, skip: int = 0, limit: int = 100):
    """
    Get all users with pagination
    """
    return db.query(User).offset(skip).limit(limit).all()
