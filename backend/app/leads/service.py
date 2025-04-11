from typing import List, Optional

from sqlalchemy import or_
from sqlalchemy.orm import Session

from app.leads.models import Lead
from app.leads.schemas import LeadCreate, LeadUpdate


def get_all_leads(
    db: Session, skip: int = 0, limit: int = 100, search: Optional[str] = None
) -> List[Lead]:
    """
    Get all leads with optional search filtering
    """
    query = db.query(Lead)
    
    if search:
        query = query.filter(
            or_(
                Lead.first_name.ilike(f"%{search}%"),
                Lead.last_name.ilike(f"%{search}%"),
                Lead.email.ilike(f"%{search}%"),
                Lead.phone.ilike(f"%{search}%")
            )
        )
    
    return query.offset(skip).limit(limit).all()


def get_lead(db: Session, lead_id: int) -> Optional[Lead]:
    """
    Get a specific lead by ID
    """
    return db.query(Lead).filter(Lead.id == lead_id).first()


def create_lead(db: Session, lead_create: LeadCreate, user_id: int) -> Lead:
    """
    Create a new lead
    """
    lead = Lead(
        first_name=lead_create.first_name,
        last_name=lead_create.last_name,
        email=lead_create.email,
        phone=lead_create.phone,
        address=lead_create.address,
        city=lead_create.city,
        postal_code=lead_create.postal_code,
        country=lead_create.country,
        date_of_birth=lead_create.date_of_birth,
        occupation=lead_create.occupation,
        notes=lead_create.notes,
        source=lead_create.source,
        status=lead_create.status,
        created_by_user_id=user_id
    )
    
    db.add(lead)
    db.commit()
    db.refresh(lead)
    return lead


def update_lead(db: Session, lead_id: int, lead_update: LeadUpdate) -> Lead:
    """
    Update a lead
    """
    lead = get_lead(db, lead_id)
    
    # Update lead fields if they are provided
    for field, value in lead_update.dict(exclude_unset=True).items():
        setattr(lead, field, value)
    
    db.commit()
    db.refresh(lead)
    return lead


def delete_lead(db: Session, lead_id: int) -> None:
    """
    Delete a lead
    """
    lead = get_lead(db, lead_id)
    db.delete(lead)
    db.commit()
