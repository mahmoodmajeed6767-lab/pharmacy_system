from pydantic import BaseModel
from typing import Optional
from datetime import datetime


class SupplierResponse(BaseModel):
    id: int
    company_name: str
    contact_person: Optional[str] = None
    phone: Optional[str] = None
    email: Optional[str] = None
    address: Optional[str] = None
    tax_number: Optional[str] = None
    outstanding_balance: float = 0.0
    is_active: int = 1
    created_at: Optional[datetime] = None

    class Config:
        from_attributes = True


class SupplierCreate(BaseModel):
    company_name: str
    contact_person: Optional[str] = None
    phone: Optional[str] = None
    email: Optional[str] = None
    address: Optional[str] = None
    tax_number: Optional[str] = None


class SupplierUpdate(BaseModel):
    company_name: Optional[str] = None
    contact_person: Optional[str] = None
    phone: Optional[str] = None
    email: Optional[str] = None
    address: Optional[str] = None
    tax_number: Optional[str] = None
