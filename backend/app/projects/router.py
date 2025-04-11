from typing import List, Optional

from fastapi import APIRouter, Depends, HTTPException, Query, status
from sqlalchemy.orm import Session

from app.auth.models import User
from app.auth.service import get_current_user
from app.database import get_db
from app.leads.service import get_lead
from app.projects.models import Project
from app.projects.schemas import ProjectCreate, ProjectResponse, ProjectUpdate
from app.projects.service import (
    create_project, 
    get_all_projects, 
    get_project, 
    update_project, 
    delete_project, 
    get_projects_by_lead
)

router = APIRouter()


@router.get("/", response_model=List[ProjectResponse])
async def read_projects(
    skip: int = 0,
    limit: int = 100,
    lead_id: Optional[int] = Query(None, description="Filter by lead ID"),
    status: Optional[str] = Query(None, description="Filter by status"),
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """
    Get all projects with optional filtering
    """
    projects = get_all_projects(db, skip=skip, limit=limit, lead_id=lead_id, status=status)
    return projects


@router.post("/", response_model=ProjectResponse, status_code=status.HTTP_201_CREATED)
async def add_project(
    project_create: ProjectCreate,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """
    Create a new project (simulation)
    """
    # Verify that the lead exists
    lead = get_lead(db, lead_id=project_create.lead_id)
    if lead is None:
        raise HTTPException(status_code=404, detail="Lead not found")
    
    return create_project(db=db, project_create=project_create, user_id=current_user.id)


@router.get("/{project_id}", response_model=ProjectResponse)
async def read_project(
    project_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """
    Get a specific project by ID
    """
    project = get_project(db, project_id=project_id)
    if project is None:
        raise HTTPException(status_code=404, detail="Project not found")
    return project


@router.put("/{project_id}", response_model=ProjectResponse)
async def update_project_api(
    project_id: int,
    project_update: ProjectUpdate,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """
    Update a project
    """
    project = get_project(db, project_id=project_id)
    if project is None:
        raise HTTPException(status_code=404, detail="Project not found")
    
    updated_project = update_project(db=db, project_id=project_id, project_update=project_update)
    return updated_project


@router.delete("/{project_id}", status_code=status.HTTP_204_NO_CONTENT)
async def remove_project(
    project_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """
    Delete a project
    """
    project = get_project(db, project_id=project_id)
    if project is None:
        raise HTTPException(status_code=404, detail="Project not found")
    
    delete_project(db=db, project_id=project_id)
    return None


@router.get("/lead/{lead_id}", response_model=List[ProjectResponse])
async def read_lead_projects(
    lead_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """
    Get all projects for a specific lead
    """
    # Verify that the lead exists
    lead = get_lead(db, lead_id=lead_id)
    if lead is None:
        raise HTTPException(status_code=404, detail="Lead not found")
    
    projects = get_projects_by_lead(db, lead_id=lead_id)
    return projects
