from datetime import datetime
from typing import Any, Dict, List, Optional

from pydantic import BaseModel, Field


class ProjectBase(BaseModel):
    name: str
    description: Optional[str] = None
    loan_amount: float
    loan_duration: int
    loan_type: str
    loan_rate: Optional[float] = None
    guarantees_required: Optional[Dict[str, Any]] = None
    options: Optional[Dict[str, Any]] = None


class ProjectCreate(ProjectBase):
    lead_id: int


class ProjectUpdate(BaseModel):
    name: Optional[str] = None
    description: Optional[str] = None
    loan_amount: Optional[float] = None
    loan_duration: Optional[int] = None
    loan_type: Optional[str] = None
    loan_rate: Optional[float] = None
    guarantees_required: Optional[Dict[str, Any]] = None
    options: Optional[Dict[str, Any]] = None
    status: Optional[str] = None


class ComparisonResultBase(BaseModel):
    insurer: str
    product_code: str
    product_name: str
    monthly_premium: float
    annual_premium: float
    total_premium: float
    coverage_percentage: float
    coverage_details: Optional[Dict[str, Any]] = None
    raw_response: Optional[Dict[str, Any]] = None


class ComparisonResultCreate(ComparisonResultBase):
    project_id: int


class ComparisonResultResponse(ComparisonResultBase):
    id: int
    project_id: int
    created_at: datetime
    updated_at: Optional[datetime] = None

    class Config:
        orm_mode = True


class ProjectResponse(ProjectBase):
    id: int
    lead_id: int
    status: str
    created_by_user_id: int
    created_at: datetime
    updated_at: Optional[datetime] = None
    comparison_results: List[ComparisonResultResponse] = []

    class Config:
        orm_mode = True
