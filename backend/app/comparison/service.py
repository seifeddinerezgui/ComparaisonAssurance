from typing import List, Optional

from sqlalchemy.orm import Session

from app.projects.models import ComparisonResult, Project


def get_comparison_results_by_project(
    db: Session, project_id: int
) -> List[ComparisonResult]:
    """
    Get comparison results for a specific project
    """
    return db.query(ComparisonResult).filter(
        ComparisonResult.project_id == project_id
    ).all()


def get_comparison_result(
    db: Session, result_id: int
) -> Optional[ComparisonResult]:
    """
    Get a specific comparison result by ID
    """
    return db.query(ComparisonResult).filter(
        ComparisonResult.id == result_id
    ).first()


def delete_comparison_results(db: Session, project_id: int) -> None:
    """
    Delete all comparison results for a specific project
    """
    db.query(ComparisonResult).filter(
        ComparisonResult.project_id == project_id
    ).delete()
    db.commit()
