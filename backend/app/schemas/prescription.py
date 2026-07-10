from __future__ import annotations
from pydantic import BaseModel
from typing import Optional
from datetime import datetime
from app.schemas.customer import CustomerResponse
from app.schemas.user import UserResponse


class PrescriptionResponse(BaseModel):
    id: int
    customer_id: int
    customer: Optional[CustomerResponse] = None
    uploaded_by: int
    uploader: Optional[UserResponse] = None
    approved_by: Optional[int] = None
    approver: Optional[UserResponse] = None
    image_path: Optional[str] = None
    notes: Optional[str] = None
    status: str = "pending"
    rejection_reason: Optional[str] = None
    created_at: Optional[datetime] = None

    class Config:
        from_attributes = True


class PrescriptionCreate(BaseModel):
    customer_id: int
    notes: Optional[str] = None


class PrescriptionUpdate(BaseModel):
    status: Optional[str] = None
    rejection_reason: Optional[str] = None
