from fastapi import APIRouter, Depends, Query
from sqlalchemy.orm import Session
from sqlalchemy import func, extract
from app.database import get_db
from app.models.sale import Sale, SaleItem
from app.models.medicine import Medicine
from app.models.user import User
from app.api.deps import get_current_user
from fastapi.responses import StreamingResponse
from app.utils.excel import export_to_excel
from datetime import date, timedelta, datetime
from typing import Optional

router = APIRouter()


@router.get("/sales")
def sales_report(
    report_type: str = Query("daily"),
    start_date: Optional[str] = None,
    end_date: Optional[str] = None,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    query = db.query(
        func.date(Sale.created_at).label("date"),
        func.count(Sale.id).label("count"),
        func.coalesce(func.sum(Sale.total), 0).label("revenue"),
    )

    if report_type == "daily":
        query = query.filter(Sale.created_at >= date.today())
    elif report_type == "weekly":
        query = query.filter(Sale.created_at >= date.today() - timedelta(days=7))
    elif report_type == "monthly":
        query = query.filter(extract("month", Sale.created_at) == date.today().month)
        query = query.filter(extract("year", Sale.created_at) == date.today().year)
    elif report_type == "yearly":
        query = db.query(
            extract("month", Sale.created_at).label("date"),
            func.count(Sale.id).label("count"),
            func.coalesce(func.sum(Sale.total), 0).label("revenue"),
        )
        query = query.filter(extract("year", Sale.created_at) == date.today().year)
        query = query.filter(extract("month", Sale.created_at) <= date.today().month)

        results = query.group_by(extract("month", Sale.created_at)).order_by(extract("month", Sale.created_at)).all()
        return {
            "status": "success",
            "data": [{"date": f"{date.today().year}-{int(r.date):02d}", "count": r.count, "revenue": float(r.revenue)} for r in results],
        }

    if start_date:
        query = query.filter(Sale.created_at >= datetime.strptime(start_date, "%Y-%m-%d"))
    if end_date:
        query = query.filter(Sale.created_at <= datetime.strptime(end_date, "%Y-%m-%d") + timedelta(days=1))

    results = query.group_by(func.date(Sale.created_at)).order_by(func.date(Sale.created_at)).all()
    return {
        "status": "success",
        "data": [{"date": str(r.date), "count": r.count, "revenue": float(r.revenue)} for r in results],
    }


@router.get("/profit")
def profit_report(
    start_date: Optional[str] = None,
    end_date: Optional[str] = None,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    sales_query = db.query(
        func.date(Sale.created_at).label("date"),
        func.coalesce(func.sum(Sale.total), 0).label("revenue"),
    )
    if start_date:
        sales_query = sales_query.filter(Sale.created_at >= datetime.strptime(start_date, "%Y-%m-%d"))
    if end_date:
        sales_query = sales_query.filter(Sale.created_at <= datetime.strptime(end_date, "%Y-%m-%d") + timedelta(days=1))
    sales_data = sales_query.group_by(func.date(Sale.created_at)).order_by(func.date(Sale.created_at)).all()

    result = []
    for r in sales_data:
        d = str(r.date)
        revenue = float(r.revenue)
        result.append({"date": d, "revenue": revenue, "cost": 0, "profit": revenue})

    return {"status": "success", "data": result}


@router.get("/expired")
def expired_report(db: Session = Depends(get_db), current_user: User = Depends(get_current_user)):
    medicines = db.query(Medicine).filter(
        Medicine.is_active == 1, Medicine.expiry_date < func.date('now')
    ).all()
    return {"status": "success", "data": [{"id": m.id, "name": m.name, "expiry_date": str(m.expiry_date), "quantity": m.quantity} for m in medicines]}


@router.get("/best-selling")
def best_selling_report(
    limit: int = Query(10, ge=1, le=50),
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    results = db.query(
        SaleItem.medicine_id,
        func.sum(SaleItem.quantity).label("total_qty"),
        func.sum(SaleItem.subtotal).label("total_revenue"),
    ).group_by(SaleItem.medicine_id).order_by(func.sum(SaleItem.quantity).desc()).limit(limit).all()

    data = []
    for r in results:
        med = db.query(Medicine).filter(Medicine.id == r.medicine_id).first()
        data.append({
            "medicine_id": r.medicine_id,
            "medicine_name": med.name if med else "Unknown",
            "total_quantity": float(r.total_qty),
            "total_revenue": float(r.total_revenue),
        })
    return {"status": "success", "data": data}


@router.get("/export/excel")
def export_report_excel(
    report_type: str = Query("sales"),
    start_date: Optional[str] = None,
    end_date: Optional[str] = None,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    headers, rows = [], []
    if report_type == "sales":
        r = sales_report("daily" if not start_date else "custom", start_date, end_date, db, current_user)
        headers = ["Date", "Count", "Revenue"]
        rows = [[d["date"], d["count"], d["revenue"]] for d in r["data"]]
    elif report_type == "profit":
        r = profit_report(start_date, end_date, db, current_user)
        headers = ["Date", "Revenue", "Cost", "Profit"]
        rows = [[d["date"], d["revenue"], d["cost"], d["profit"]] for d in r["data"]]
    elif report_type == "expired":
        r = expired_report(db, current_user)
        headers = ["ID", "Name", "Expiry Date", "Quantity"]
        rows = [[d["id"], d["name"], d["expiry_date"], d["quantity"]] for d in r["data"]]
    elif report_type == "best_selling":
        r = best_selling_report(50, db, current_user)
        headers = ["Medicine ID", "Medicine Name", "Total Quantity", "Total Revenue"]
        rows = [[d["medicine_id"], d["medicine_name"], d["total_quantity"], d["total_revenue"]] for d in r["data"]]
    else:
        return {"status": "error", "message": "Unsupported report type"}

    buffer = export_to_excel(headers, rows, report_type.replace("_", " ").title())
    return StreamingResponse(buffer, media_type="application/vnd.openxmlformats-officedocument.spreadsheetml.sheet", headers={"Content-Disposition": f"attachment; filename={report_type}_report.xlsx"})
