from fastapi import APIRouter, Depends, HTTPException, Query
from fastapi.responses import StreamingResponse
from sqlalchemy.orm import Session
from app.database import get_db
from app.models.sale import Sale, SaleItem
from app.models.medicine import Medicine
from app.models.customer import Customer
from app.models.user import User
from app.models.notification import Notification
from app.schemas.sale import SaleCreate, SaleResponse
from app.api.deps import get_current_user, get_cashier_or_above, get_admin_user
from app.api.v1.notifications import sync_medicine_notifications
from typing import Optional
from datetime import datetime, date
import random, string

router = APIRouter()


@router.get("/", response_model=dict)
def list_sales(
    page: int = Query(1, ge=1),
    limit: int = Query(10, ge=1, le=100),
    start_date: Optional[date] = None,
    end_date: Optional[date] = None,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    query = db.query(Sale).order_by(Sale.created_at.desc())
    if start_date:
        query = query.filter(Sale.created_at >= start_date)
    if end_date:
        from datetime import timedelta
        query = query.filter(Sale.created_at <= end_date + timedelta(days=1))
    total = query.count()
    sales = query.offset((page - 1) * limit).limit(limit).all()
    return {
        "status": "success",
        "data": [SaleResponse.model_validate(s).model_dump() for s in sales],
        "total": total,
        "page": page,
        "limit": limit,
        "total_pages": (total + limit - 1) // limit,
    }


@router.get("/{sale_id}", response_model=SaleResponse)
def get_sale(sale_id: int, db: Session = Depends(get_db), current_user: User = Depends(get_current_user)):
    sale = db.query(Sale).filter(Sale.id == sale_id).first()
    if not sale:
        raise HTTPException(status_code=404, detail="Sale not found")
    return SaleResponse.model_validate(sale)


@router.post("/", response_model=SaleResponse)
def create_sale(req: SaleCreate, db: Session = Depends(get_db), current_user: User = Depends(get_cashier_or_above)):
    import traceback
    try:
        invoice = "SAL-" + datetime.now().strftime("%Y%m%d") + "-" + "".join(random.choices(string.digits, k=4))
        change = max(0, float(req.paid_amount) - float(req.total))

        sale = Sale(
            invoice_number=invoice,
            customer_id=req.customer_id,
            user_id=current_user.id,
            subtotal=float(req.subtotal),
            tax=float(req.tax),
            discount=float(req.discount),
            total=float(req.total),
            paid_amount=float(req.paid_amount),
            change_amount=change,
            payment_method=req.payment_method,
            payment_status="paid",
            notes=req.notes,
        )
        db.add(sale)
        db.flush()

        for item in req.items:
            med = db.query(Medicine).filter(Medicine.id == item.medicine_id).first()
            if not med:
                db.rollback()
                raise HTTPException(status_code=400, detail=f"Medicine ID {item.medicine_id} not found")
            if med.quantity < float(item.quantity):
                db.rollback()
                raise HTTPException(status_code=400, detail=f"Insufficient stock for {med.name} (available: {med.quantity}, requested: {item.quantity})")

            si = SaleItem(
                sale_id=sale.id,
                medicine_id=item.medicine_id,
                quantity=float(item.quantity),
                unit_price=float(item.unit_price),
                discount=float(item.discount),
                tax=float(item.tax),
                subtotal=float(item.subtotal),
            )
            db.add(si)

            before = med.quantity
            med.quantity -= float(item.quantity)

            # Sync notifications after stock change
            sync_medicine_notifications(db, med)

        if req.customer_id and req.customer_id != 0:
            cust = db.query(Customer).filter(Customer.id == req.customer_id).first()
            if cust:
                cust.total_purchases = (cust.total_purchases or 0) + float(req.total)
                cust.loyalty_points = (cust.loyalty_points or 0) + (float(req.total) * 0.01)

        db.commit()
        db.refresh(sale)
        print(f"[CHECKOUT] Sale #{sale.invoice_number} created successfully. Total: {sale.total}")
        return SaleResponse.model_validate(sale)

    except HTTPException:
        raise
    except Exception as e:
        db.rollback()
        print(f"[CHECKOUT ERROR] {traceback.format_exc()}")
        raise HTTPException(status_code=500, detail=f"Checkout failed: {str(e)}")


@router.get("/{sale_id}/invoice")
def download_invoice(sale_id: int, db: Session = Depends(get_db), current_user: User = Depends(get_current_user)):
    sale = db.query(Sale).filter(Sale.id == sale_id).first()
    if not sale:
        raise HTTPException(status_code=404, detail="Sale not found")
    from app.utils.pdf import generate_invoice_pdf
    from app.models.setting import Setting
    pharmacy_name = db.query(Setting).filter(Setting.key == "pharmacy_name").first()
    currency = db.query(Setting).filter(Setting.key == "currency").first()
    name = pharmacy_name.value if pharmacy_name else "Pharmacy"
    curr = currency.value if currency else "PKR"
    buffer = generate_invoice_pdf(sale, pharmacy_name=name, currency=curr)
    return StreamingResponse(buffer, media_type="application/pdf", headers={"Content-Disposition": f"inline; filename=invoice_{sale.invoice_number}.pdf"})


@router.post("/{sale_id}/refund")
def refund_sale(sale_id: int, db: Session = Depends(get_db), current_user: User = Depends(get_admin_user)):
    sale = db.query(Sale).filter(Sale.id == sale_id).first()
    if not sale:
        raise HTTPException(status_code=404, detail="Sale not found")
    if sale.payment_status == "refunded":
        raise HTTPException(status_code=400, detail="Sale already refunded")

    for item in sale.items:
        med = db.query(Medicine).filter(Medicine.id == item.medicine_id).first()
        if med:
            med.quantity += item.quantity
            sync_medicine_notifications(db, med)

    sale.payment_status = "refunded"
    db.commit()
    return {"status": "success", "message": "Sale refunded"}
