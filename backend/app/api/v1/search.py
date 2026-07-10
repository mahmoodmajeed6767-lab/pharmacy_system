from fastapi import APIRouter, Depends, Query
from sqlalchemy.orm import Session
from sqlalchemy import or_
from app.database import get_db
from app.models.medicine import Medicine
from app.models.customer import Customer
from app.models.supplier import Supplier
from app.models.user import User
from app.api.deps import get_current_user

router = APIRouter()


@router.get("/")
def global_search(q: str = Query(..., min_length=1), db: Session = Depends(get_db), current_user: User = Depends(get_current_user)):
    medicines = db.query(Medicine).filter(
        Medicine.is_active == 1,
        or_(
            Medicine.name.ilike(f"%{q}%"),
            Medicine.barcode.ilike(f"%{q}%"),
            Medicine.sku.ilike(f"%{q}%"),
            Medicine.batch_number.ilike(f"%{q}%"),
        ),
    ).limit(10).all()

    customers = db.query(Customer).filter(
        Customer.is_active == 1,
        or_(
            Customer.name.ilike(f"%{q}%"),
            Customer.phone.ilike(f"%{q}%"),
            Customer.email.ilike(f"%{q}%"),
        ),
    ).limit(10).all()

    suppliers = db.query(Supplier).filter(
        Supplier.is_active == 1,
        or_(
            Supplier.company_name.ilike(f"%{q}%"),
            Supplier.phone.ilike(f"%{q}%"),
            Supplier.contact_person.ilike(f"%{q}%"),
        ),
    ).limit(10).all()

    return {
        "status": "success",
        "data": {
            "medicines": [{"id": m.id, "name": m.name, "barcode": m.barcode, "type": "medicine"} for m in medicines],
            "customers": [{"id": c.id, "name": c.name, "phone": c.phone, "type": "customer"} for c in customers],
            "suppliers": [{"id": s.id, "company_name": s.company_name, "phone": s.phone, "type": "supplier"} for s in suppliers],
        },
    }
