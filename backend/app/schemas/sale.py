from __future__ import annotations
from pydantic import BaseModel
from typing import Optional, List
from datetime import datetime
from app.schemas.customer import CustomerResponse
from app.schemas.medicine import MedicineResponse
from app.schemas.user import UserResponse


class SaleItemResponse(BaseModel):
    id: int
    sale_id: int
    medicine_id: int
    medicine: Optional[MedicineResponse] = None
    quantity: float
    unit_price: float
    discount: float = 0.0
    tax: float = 0.0
    subtotal: float = 0.0

    class Config:
        from_attributes = True


class SaleResponse(BaseModel):
    id: int
    invoice_number: str
    customer_id: Optional[int] = None
    customer: Optional[CustomerResponse] = None
    user_id: int
    user: Optional[UserResponse] = None
    subtotal: float = 0.0
    tax: float = 0.0
    discount: float = 0.0
    total: float = 0.0
    paid_amount: float = 0.0
    change_amount: float = 0.0
    payment_method: Optional[str] = None
    payment_status: str = "paid"
    notes: Optional[str] = None
    items: Optional[List[SaleItemResponse]] = None
    created_at: Optional[datetime] = None

    class Config:
        from_attributes = True


class SaleItemCreate(BaseModel):
    medicine_id: int
    quantity: float
    unit_price: float
    discount: float = 0.0
    tax: float = 0.0
    subtotal: float = 0.0


class SaleCreate(BaseModel):
    customer_id: Optional[int] = None
    subtotal: float = 0.0
    tax: float = 0.0
    discount: float = 0.0
    total: float = 0.0
    paid_amount: float = 0.0
    payment_method: str = "cash"
    notes: Optional[str] = None
    items: List[SaleItemCreate]
