from sqlalchemy import Column, Integer, String, Float, DateTime, func
from app.database import Base


class Supplier(Base):
    __tablename__ = "suppliers"

    id = Column(Integer, primary_key=True, index=True)
    company_name = Column(String(200), nullable=False, index=True)
    contact_person = Column(String(150))
    phone = Column(String(20), index=True)
    email = Column(String(100))
    address = Column(String(500))
    tax_number = Column(String(100))
    outstanding_balance = Column(Float, default=0.0)
    is_active = Column(Integer, default=1)
    created_at = Column(DateTime, server_default=func.now())
    updated_at = Column(DateTime, server_default=func.now(), onupdate=func.now())
