from sqlalchemy import Column, Integer, String, Float, Date, DateTime, func
from app.database import Base


class Customer(Base):
    __tablename__ = "customers"

    id = Column(Integer, primary_key=True, index=True)
    name = Column(String(150), nullable=False, index=True)
    phone = Column(String(20), index=True)
    email = Column(String(100))
    address = Column(String(500))
    date_of_birth = Column(Date)
    gender = Column(String(10))
    loyalty_points = Column(Float, default=0)
    total_purchases = Column(Float, default=0)
    is_active = Column(Integer, default=1)
    created_at = Column(DateTime, server_default=func.now())
    updated_at = Column(DateTime, server_default=func.now(), onupdate=func.now())
