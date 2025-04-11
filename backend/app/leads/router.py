from typing import List, Optional

from fastapi import APIRouter, Depends, HTTPException, Query, status
from sqlalchemy.orm import Session

from app.auth.models import User
from app.auth.service import get_current_user
from app.database import get_db
from app.leads.models import Lead
from app.leads.schemas import LeadCreate, LeadResponse, LeadUpdate
from app.leads.service import create_lead, get_all_leads, get_lead, update_lead, delete_lead

router = APIRouter()


@router.get("/", response_model=List[LeadResponse])
async def read_leads(
    skip: int = 0,
    limit: int = 100,
    search: Optional[str] = Query(None, description="Search by name, email, or phone"),
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """
    Get all leads with optional filtering
    """
    leads = get_all_leads(db, skip=skip, limit=limit, search=search)
    return leads


@router.post("/", response_model=LeadResponse, status_code=status.HTTP_201_CREATED)
async def add_lead(
    lead_create: LeadCreate,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """
    Create a new lead
    """
    return create_lead(db=db, lead_create=lead_create, user_id=current_user.id)


@router.get("/{lead_id}", response_model=LeadResponse)
async def read_lead(
    lead_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """
    Get a specific lead by ID
    """
    lead = get_lead(db, lead_id=lead_id)
    if lead is None:
        raise HTTPException(status_code=404, detail="Lead not found")
    return lead


@router.put("/{lead_id}", response_model=LeadResponse)
async def update_lead_api(
    lead_id: int,
    lead_update: LeadUpdate,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """
    Update a lead
    """
    lead = get_lead(db, lead_id=lead_id)
    if lead is None:
        raise HTTPException(status_code=404, detail="Lead not found")
    
    updated_lead = update_lead(db=db, lead_id=lead_id, lead_update=lead_update)
    return updated_lead


@router.delete("/{lead_id}", status_code=status.HTTP_204_NO_CONTENT)
async def remove_lead(
    lead_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """
    Delete a lead
    """
    lead = get_lead(db, lead_id=lead_id)
    if lead is None:
        raise HTTPException(status_code=404, detail="Lead not found")
    
    delete_lead(db=db, lead_id=lead_id)
    return None


@router.post("/{lead_id}/sync-to-hubspot", response_model=LeadResponse)
async def sync_lead_to_hubspot(
    lead_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """
    Sync a lead to HubSpot
    """
    lead = get_lead(db, lead_id=lead_id)
    if lead is None:
        raise HTTPException(status_code=404, detail="Lead not found")
    
    # This would call the HubSpot sync service
    # For now, we'll just update the lead's hubspot_sync_status
    lead.hubspot_sync_status = "synced"
    db.commit()
    db.refresh(lead)
    
    return lead
