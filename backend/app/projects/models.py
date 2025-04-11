from sqlalchemy import Boolean, Column, Float, ForeignKey, Integer, String, Text, DateTime, JSON
from sqlalchemy.orm import relationship
from sqlalchemy.sql import func

from app.database import Base


class Project(Base):
    __tablename__ = "projects"

    id = Column(Integer, primary_key=True, index=True)
    name = Column(String(255))
    description = Column(Text, nullable=True)
    
    # Lead relationship
    lead_id = Column(Integer, ForeignKey("leads.id", ondelete="CASCADE"))
    lead = relationship("Lead", back_populates="projects")
    
    # Loan details
    loan_amount = Column(Float)
    loan_duration = Column(Integer)  # in months
    loan_type = Column(String(100))  # real estate, consumer, etc.
    loan_rate = Column(Float, nullable=True)
    
    # Insurance details
    guarantees_required = Column(JSON, nullable=True)  # JSON of required guarantees
    options = Column(JSON, nullable=True)  # JSON of selected insurance options
    
    # Project status
    status = Column(String(50), default="created")  # created, compared, exported, etc.
    
    # User who created the project
    created_by_user_id = Column(Integer, ForeignKey("users.id"))
    created_by = relationship("User", backref="projects_created")
    
    # Timestamps
    created_at = Column(DateTime(timezone=True), server_default=func.now())
    updated_at = Column(DateTime(timezone=True), onupdate=func.now())
    
    # Relationship to comparison results
    comparison_results = relationship("ComparisonResult", back_populates="project", cascade="all, delete-orphan")


class ComparisonResult(Base):
    __tablename__ = "comparison_results"

    id = Column(Integer, primary_key=True, index=True)
    
    # Project relationship
    project_id = Column(Integer, ForeignKey("projects.id", ondelete="CASCADE"))
    project = relationship("Project", back_populates="comparison_results")
    
    # Insurer and product details
    insurer = Column(String(100))  # UTWIN, APRIL, etc.
    product_code = Column(String(100))
    product_name = Column(String(255))
    
    # Tariff details
    monthly_premium = Column(Float)
    annual_premium = Column(Float)
    total_premium = Column(Float)  # Total premium over the loan duration
    
    # Coverage details
    coverage_percentage = Column(Float)
    coverage_details = Column(JSON, nullable=True)  # JSON of coverage details
    
    # Timestamps
    created_at = Column(DateTime(timezone=True), server_default=func.now())
    updated_at = Column(DateTime(timezone=True), onupdate=func.now())
    
    # Raw response data
    raw_response = Column(JSON, nullable=True)  # Full API response for reference
