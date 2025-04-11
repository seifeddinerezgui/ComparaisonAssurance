from typing import List

from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session

from app.auth.models import User
from app.auth.service import get_current_user
from app.database import get_db
from app.projects.models import ComparisonResult, Project
from app.projects.schemas import ComparisonResultResponse
from app.projects.service import get_project
from app.comparison.engine import ComparisonEngine
from app.comparison.schemas import ComparisonRequest

router = APIRouter()


@router.post("/run", response_model=List[ComparisonResultResponse])
async def run_comparison(
    comparison_request: ComparisonRequest,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """
    Run a comparison for a specific project
    """
    # Verify that the project exists
    project = get_project(db, comparison_request.project_id)
    if project is None:
        raise HTTPException(status_code=404, detail="Project not found")
    
    # Create and run the comparison engine
    engine = ComparisonEngine(db)
    results = engine.run_comparison(project_id=comparison_request.project_id)
    
    return results


@router.get("/project/{project_id}", response_model=List[ComparisonResultResponse])
async def get_comparison_results(
    project_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """
    Get comparison results for a specific project
    """
    # Verify that the project exists
    project = get_project(db, project_id)
    if project is None:
        raise HTTPException(status_code=404, detail="Project not found")
    
    # Get comparison results
    results = db.query(ComparisonResult).filter(
        ComparisonResult.project_id == project_id
    ).all()
    
    return results


@router.delete("/project/{project_id}", status_code=status.HTTP_204_NO_CONTENT)
async def delete_comparison_results(
    project_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """
    Delete all comparison results for a specific project
    """
    # Verify that the project exists
    project = get_project(db, project_id)
    if project is None:
        raise HTTPException(status_code=404, detail="Project not found")
    
    # Delete comparison results
    db.query(ComparisonResult).filter(
        ComparisonResult.project_id == project_id
    ).delete()
    
    # Update project status
    project.status = "created"
    db.commit()
    
    return None
