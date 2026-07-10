from sqlalchemy import Column, Integer, String, DateTime, func
from app.database import Base


class MedicineCategory(Base):
    __tablename__ = "medicine_categories"

    id = Column(Integer, primary_key=True, index=True)
    name = Column(String(100), unique=True, nullable=False)
    description = Column(String(255))
    created_at = Column(DateTime, server_default=func.now())
    updated_at = Column(DateTime, server_default=func.now(), onupdate=func.now())
