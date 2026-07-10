from pydantic import BaseModel
from typing import Optional
from datetime import date, datetime


class MedicineCategoryResponse(BaseModel):
    id: int
    name: str
    description: Optional[str] = None

    class Config:
        from_attributes = True


class MedicineCategoryCreate(BaseModel):
    name: str
    description: Optional[str] = None


class MedicineResponse(BaseModel):
    id: int
    name: str
    generic_name: Optional[str] = None
    brand: Optional[str] = None
    category_id: Optional[int] = None
    category: Optional[MedicineCategoryResponse] = None
    manufacturer: Optional[str] = None
    batch_number: Optional[str] = None
    barcode: Optional[str] = None
    qr_code: Optional[str] = None
    sku: Optional[str] = None
    purchase_price: float = 0.0
    selling_price: float = 0.0
    tax: float = 0.0
    quantity: float = 0
    min_stock: float = 10
    max_stock: float = 100
    manufacturing_date: Optional[date] = None
    expiry_date: Optional[date] = None
    rack_number: Optional[str] = None
    description: Optional[str] = None
    image: Optional[str] = None
    is_active: int = 1
    created_at: Optional[datetime] = None

    class Config:
        from_attributes = True


class MedicineCreate(BaseModel):
    name: str
    generic_name: Optional[str] = None
    brand: Optional[str] = None
    category_id: Optional[int] = None
    manufacturer: Optional[str] = None
    batch_number: Optional[str] = None
    barcode: Optional[str] = None
    sku: Optional[str] = None
    purchase_price: float = 0.0
    selling_price: float = 0.0
    tax: float = 0.0
    quantity: float = 0
    min_stock: float = 10
    max_stock: float = 100
    manufacturing_date: Optional[date] = None
    expiry_date: Optional[date] = None
    rack_number: Optional[str] = None
    description: Optional[str] = None


class MedicineUpdate(BaseModel):
    name: Optional[str] = None
    generic_name: Optional[str] = None
    brand: Optional[str] = None
    category_id: Optional[int] = None
    manufacturer: Optional[str] = None
    batch_number: Optional[str] = None
    barcode: Optional[str] = None
    sku: Optional[str] = None
    purchase_price: Optional[float] = None
    selling_price: Optional[float] = None
    tax: Optional[float] = None
    quantity: Optional[float] = None
    min_stock: Optional[float] = None
    max_stock: Optional[float] = None
    manufacturing_date: Optional[date] = None
    expiry_date: Optional[date] = None
    rack_number: Optional[str] = None
    description: Optional[str] = None
