from fastapi import APIRouter, Depends, HTTPException, Query
from sqlalchemy.orm import Session
from sqlalchemy import or_
from app.database import get_db
from app.models.customer import Customer
from app.models.sale import Sale
from app.models.user import User
from app.schemas.customer import CustomerCreate, CustomerUpdate, CustomerResponse
from app.api.deps import get_current_user, get_pharmacist_or_admin, get_admin_user
from typing import Optional

router = APIRouter()


@router.get("/", response_model=dict)
def list_customers(
    page: int = Query(1, ge=1),
    limit: int = Query(10, ge=1, le=100),
    search: Optional[str] = None,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    query = db.query(Customer).filter(Customer.is_active == 1)
    if search:
        query = query.filter(
            or_(
                Customer.name.ilike(f"%{search}%"),
                Customer.phone.ilike(f"%{search}%"),
                Customer.email.ilike(f"%{search}%"),
            )
        )
    total = query.count()
    customers = query.offset((page - 1) * limit).limit(limit).all()
    return {
        "status": "success",
        "data": [CustomerResponse.model_validate(c).model_dump() for c in customers],
        "total": total,
        "page": page,
        "limit": limit,
        "total_pages": (total + limit - 1) // limit,
    }


@router.get("/{customer_id}", response_model=CustomerResponse)
def get_customer(customer_id: int, db: Session = Depends(get_db), current_user: User = Depends(get_current_user)):
    customer = db.query(Customer).filter(Customer.id == customer_id).first()
    if not customer:
        raise HTTPException(status_code=404, detail="Customer not found")
    return CustomerResponse.model_validate(customer)


@router.post("/", response_model=CustomerResponse)
def create_customer(req: CustomerCreate, db: Session = Depends(get_db), current_user: User = Depends(get_pharmacist_or_admin)):
    customer = Customer(**req.model_dump())
    db.add(customer)
    db.commit()
    db.refresh(customer)
    return CustomerResponse.model_validate(customer)


@router.put("/{customer_id}", response_model=CustomerResponse)
def update_customer(customer_id: int, req: CustomerUpdate, db: Session = Depends(get_db), current_user: User = Depends(get_pharmacist_or_admin)):
    customer = db.query(Customer).filter(Customer.id == customer_id).first()
    if not customer:
        raise HTTPException(status_code=404, detail="Customer not found")
    for field, value in req.model_dump(exclude_unset=True).items():
        setattr(customer, field, value)
    db.commit()
    db.refresh(customer)
    return CustomerResponse.model_validate(customer)


@router.delete("/{customer_id}")
def delete_customer(customer_id: int, db: Session = Depends(get_db), current_user: User = Depends(get_admin_user)):
    customer = db.query(Customer).filter(Customer.id == customer_id).first()
    if not customer:
        raise HTTPException(status_code=404, detail="Customer not found")
    customer.is_active = 0
    db.commit()
    return {"status": "success", "message": "Customer deactivated"}


@router.get("/{customer_id}/sales")
def customer_sales(customer_id: int, db: Session = Depends(get_db), current_user: User = Depends(get_current_user)):
    sales = db.query(Sale).filter(Sale.customer_id == customer_id).order_by(Sale.created_at.desc()).all()
    from app.schemas.sale import SaleResponse
    return {"status": "success", "data": [SaleResponse.model_validate(s).model_dump() for s in sales]}
