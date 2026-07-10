from fastapi import APIRouter, Depends, HTTPException, Query
from sqlalchemy.orm import Session
from sqlalchemy import or_
from app.database import get_db
from app.models.supplier import Supplier
from app.models.user import User
from app.schemas.supplier import SupplierCreate, SupplierUpdate, SupplierResponse
from app.api.deps import get_current_user, get_admin_user
from typing import List, Optional

router = APIRouter()


@router.get("/", response_model=dict)
def list_suppliers(
    page: int = Query(1, ge=1),
    limit: int = Query(10, ge=1, le=100),
    search: Optional[str] = None,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    query = db.query(Supplier).filter(Supplier.is_active == 1)
    if search:
        query = query.filter(
            or_(
                Supplier.company_name.ilike(f"%{search}%"),
                Supplier.phone.ilike(f"%{search}%"),
                Supplier.contact_person.ilike(f"%{search}%"),
            )
        )
    total = query.count()
    suppliers = query.offset((page - 1) * limit).limit(limit).all()
    return {
        "status": "success",
        "data": [SupplierResponse.model_validate(s).model_dump() for s in suppliers],
        "total": total,
        "page": page,
        "limit": limit,
        "total_pages": (total + limit - 1) // limit,
    }


@router.get("/{supplier_id}", response_model=SupplierResponse)
def get_supplier(supplier_id: int, db: Session = Depends(get_db), current_user: User = Depends(get_current_user)):
    supplier = db.query(Supplier).filter(Supplier.id == supplier_id).first()
    if not supplier:
        raise HTTPException(status_code=404, detail="Supplier not found")
    return SupplierResponse.model_validate(supplier)


@router.post("/", response_model=SupplierResponse)
def create_supplier(req: SupplierCreate, db: Session = Depends(get_db), current_user: User = Depends(get_admin_user)):
    supplier = Supplier(**req.model_dump())
    db.add(supplier)
    db.commit()
    db.refresh(supplier)
    return SupplierResponse.model_validate(supplier)


@router.put("/{supplier_id}", response_model=SupplierResponse)
def update_supplier(supplier_id: int, req: SupplierUpdate, db: Session = Depends(get_db), current_user: User = Depends(get_admin_user)):
    supplier = db.query(Supplier).filter(Supplier.id == supplier_id).first()
    if not supplier:
        raise HTTPException(status_code=404, detail="Supplier not found")
    for field, value in req.model_dump(exclude_unset=True).items():
        setattr(supplier, field, value)
    db.commit()
    db.refresh(supplier)
    return SupplierResponse.model_validate(supplier)


@router.delete("/{supplier_id}")
def delete_supplier(supplier_id: int, db: Session = Depends(get_db), current_user: User = Depends(get_admin_user)):
    supplier = db.query(Supplier).filter(Supplier.id == supplier_id).first()
    if not supplier:
        raise HTTPException(status_code=404, detail="Supplier not found")
    supplier.is_active = 0
    db.commit()
    return {"status": "success", "message": "Supplier deactivated"}
