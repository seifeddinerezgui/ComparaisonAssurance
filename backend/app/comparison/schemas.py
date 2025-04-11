from pydantic import BaseModel


class ComparisonRequest(BaseModel):
    """
    Schema for requesting a comparison
    """
    project_id: int
