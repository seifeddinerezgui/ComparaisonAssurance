from datetime import date
from sqlalchemy import Boolean, Column, Date, ForeignKey, Integer, String, Text, DateTime
from sqlalchemy.orm import relationship
from sqlalchemy.sql import func

from app.database import Base


class Lead(Base):
    __tablename__ = "leads"

    id = Column(Integer, primary_key=True, index=True)
    first_name = Column(String(100))
    last_name = Column(String(100))
    email = Column(String(255), index=True)
    phone = Column(String(20))
    address = Column(String(255), nullable=True)
    city = Column(String(100), nullable=True)
    postal_code = Column(String(20), nullable=True)
    country = Column(String(100), nullable=True)
    date_of_birth = Column(Date, nullable=True)
    occupation = Column(String(100), nullable=True)
    
    notes = Column(Text, nullable=True)
    source = Column(String(100), nullable=True)  # Where the lead came from (e.g., "Comparadise")
    status = Column(String(50), default="new")  # new, contacted, qualified, converted, etc.
    
    # HubSpot integration fields
    hubspot_id = Column(String(100), nullable=True)
    hubspot_sync_status = Column(String(50), nullable=True)  # synced, pending, failed
    hubspot_last_sync = Column(DateTime(timezone=True), nullable=True)
    
    # Relationships
    created_by_user_id = Column(Integer, ForeignKey("users.id"))
    created_by = relationship("User", backref="leads_created")
    
    created_at = Column(DateTime(timezone=True), server_default=func.now())
    updated_at = Column(DateTime(timezone=True), onupdate=func.now())
    
    # Relationship to projects (simulations)
    projects = relationship("Project", back_populates="lead", cascade="all, delete-orphan")
    
    @property
    def full_name(self):
        """Return the lead's full name"""
        if self.first_name and self.last_name:
            return f"{self.first_name} {self.last_name}"
        elif self.first_name:
            return self.first_name
        elif self.last_name:
            return self.last_name
        return ""
