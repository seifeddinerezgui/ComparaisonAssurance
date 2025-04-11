from typing import List, Optional

from sqlalchemy import and_
from sqlalchemy.orm import Session

from app.projects.models import Project
from app.projects.schemas import ProjectCreate, ProjectUpdate


def get_all_projects(
    db: Session, 
    skip: int = 0, 
    limit: int = 100, 
    lead_id: Optional[int] = None,
    status: Optional[str] = None
) -> List[Project]:
    """
    Get all projects with optional filtering
    """
    query = db.query(Project)
    
    # Apply filters if provided
    if lead_id:
        query = query.filter(Project.lead_id == lead_id)
    
    if status:
        query = query.filter(Project.status == status)
    
    return query.offset(skip).limit(limit).all()


def get_project(db: Session, project_id: int) -> Optional[Project]:
    """
    Get a specific project by ID
    """
    return db.query(Project).filter(Project.id == project_id).first()


def get_projects_by_lead(db: Session, lead_id: int) -> List[Project]:
    """
    Get all projects for a specific lead
    """
    return db.query(Project).filter(Project.lead_id == lead_id).all()


def create_project(db: Session, project_create: ProjectCreate, user_id: int) -> Project:
    """
    Create a new project
    """
    project = Project(
        name=project_create.name,
        description=project_create.description,
        lead_id=project_create.lead_id,
        loan_amount=project_create.loan_amount,
        loan_duration=project_create.loan_duration,
        loan_type=project_create.loan_type,
        loan_rate=project_create.loan_rate,
        guarantees_required=project_create.guarantees_required,
        options=project_create.options,
        status="created",
        created_by_user_id=user_id
    )
    
    db.add(project)
    db.commit()
    db.refresh(project)
    return project


def update_project(db: Session, project_id: int, project_update: ProjectUpdate) -> Project:
    """
    Update a project
    """
    project = get_project(db, project_id)
    
    # Update project fields if they are provided
    for field, value in project_update.dict(exclude_unset=True).items():
        setattr(project, field, value)
    
    db.commit()
    db.refresh(project)
    return project


def delete_project(db: Session, project_id: int) -> None:
    """
    Delete a project
    """
    project = get_project(db, project_id)
    db.delete(project)
    db.commit()
