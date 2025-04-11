from datetime import date, datetime
from typing import Optional

from pydantic import BaseModel, EmailStr


class LeadBase(BaseModel):
    first_name: str
    last_name: str
    email: EmailStr
    phone: str
    address: Optional[str] = None
    city: Optional[str] = None
    postal_code: Optional[str] = None
    country: Optional[str] = None
    date_of_birth: Optional[date] = None
    occupation: Optional[str] = None
    notes: Optional[str] = None
    source: Optional[str] = None
    status: str = "new"


class LeadCreate(LeadBase):
    pass


class LeadUpdate(BaseModel):
    first_name: Optional[str] = None
    last_name: Optional[str] = None
    email: Optional[EmailStr] = None
    phone: Optional[str] = None
    address: Optional[str] = None
    city: Optional[str] = None
    postal_code: Optional[str] = None
    country: Optional[str] = None
    date_of_birth: Optional[date] = None
    occupation: Optional[str] = None
    notes: Optional[str] = None
    source: Optional[str] = None
    status: Optional[str] = None


class LeadResponse(LeadBase):
    id: int
    hubspot_id: Optional[str] = None
    hubspot_sync_status: Optional[str] = None
    hubspot_last_sync: Optional[datetime] = None
    created_by_user_id: int
    created_at: datetime
    updated_at: Optional[datetime] = None

    class Config:
        orm_mode = True
