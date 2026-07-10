from sqlalchemy import Column, Integer, String, Float, ForeignKey, DateTime, func, Text
from sqlalchemy.orm import relationship
from app.database import Base


class Sale(Base):
    __tablename__ = "sales"

    id = Column(Integer, primary_key=True, index=True)
    invoice_number = Column(String(100), unique=True, index=True)
    customer_id = Column(Integer, ForeignKey("customers.id"), nullable=True)
    user_id = Column(Integer, ForeignKey("users.id"), nullable=False)
    subtotal = Column(Float, default=0.0)
    tax = Column(Float, default=0.0)
    discount = Column(Float, default=0.0)
    total = Column(Float, default=0.0)
    paid_amount = Column(Float, default=0.0)
    change_amount = Column(Float, default=0.0)
    payment_method = Column(String(50))  # cash, credit_card, debit_card, mobile_wallet
    payment_status = Column(String(50), default="paid")  # paid, pending, refunded
    notes = Column(Text)
    created_at = Column(DateTime, server_default=func.now())

    customer = relationship("Customer")
    user = relationship("User")
    items = relationship("SaleItem", back_populates="sale", cascade="all, delete-orphan")


class SaleItem(Base):
    __tablename__ = "sale_items"

    id = Column(Integer, primary_key=True, index=True)
    sale_id = Column(Integer, ForeignKey("sales.id"), nullable=False)
    medicine_id = Column(Integer, ForeignKey("medicines.id"), nullable=False)
    quantity = Column(Float, nullable=False)
    unit_price = Column(Float, nullable=False)
    discount = Column(Float, default=0.0)
    tax = Column(Float, default=0.0)
    subtotal = Column(Float, default=0.0)
    created_at = Column(DateTime, server_default=func.now())

    sale = relationship("Sale", back_populates="items")
    medicine = relationship("Medicine")
