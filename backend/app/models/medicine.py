from sqlalchemy import Column, Integer, String, Float, ForeignKey, Date, Text, DateTime, func
from sqlalchemy.orm import relationship
from app.database import Base


class Medicine(Base):
    __tablename__ = "medicines"

    id = Column(Integer, primary_key=True, index=True)
    name = Column(String(200), nullable=False, index=True)
    generic_name = Column(String(200))
    brand = Column(String(200))
    category_id = Column(Integer, ForeignKey("medicine_categories.id"), nullable=True)
    manufacturer = Column(String(200))
    batch_number = Column(String(100), index=True)
    barcode = Column(String(100), unique=True, index=True)
    qr_code = Column(Text)
    sku = Column(String(100), unique=True, index=True)
    purchase_price = Column(Float, default=0.0)
    selling_price = Column(Float, default=0.0)
    tax = Column(Float, default=0.0)
    quantity = Column(Float, default=0)
    min_stock = Column(Float, default=10)
    max_stock = Column(Float, default=100)
    manufacturing_date = Column(Date)
    expiry_date = Column(Date, index=True)
    rack_number = Column(String(50))
    description = Column(Text)
    image = Column(String(255))
    is_active = Column(Integer, default=1)
    created_at = Column(DateTime, server_default=func.now())
    updated_at = Column(DateTime, server_default=func.now(), onupdate=func.now())

    category = relationship("MedicineCategory")
