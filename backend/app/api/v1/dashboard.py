from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session
from sqlalchemy import func, extract
from app.database import get_db
from app.models.sale import Sale
from app.models.medicine import Medicine
from app.models.medicine_category import MedicineCategory
from app.models.customer import Customer
from app.models.supplier import Supplier
from app.models.user import User
from app.api.deps import get_current_user
from app.schemas.dashboard import DashboardStats, ProfitOverview, CategoryCount
from datetime import timedelta, datetime

router = APIRouter()


@router.get("/")
def get_dashboard(db: Session = Depends(get_db), current_user: User = Depends(get_current_user)):
    sales_today = db.query(func.count(Sale.id)).filter(func.date(Sale.created_at) == func.date('now')).scalar() or 0
    revenue_today = db.query(func.coalesce(func.sum(Sale.total), 0)).filter(func.date(Sale.created_at) == func.date('now')).scalar() or 0.0

    sales_this_month = db.query(func.count(Sale.id)).filter(
        func.strftime("%Y-%m", Sale.created_at) == func.strftime("%Y-%m", func.now()),
    ).scalar() or 0

    monthly_revenue = db.query(func.coalesce(func.sum(Sale.total), 0)).filter(
        func.strftime("%Y-%m", Sale.created_at) == func.strftime("%Y-%m", func.now()),
    ).scalar() or 0.0

    total_medicines = db.query(func.count(Medicine.id)).filter(Medicine.is_active == 1).scalar() or 0
    low_stock = db.query(func.count(Medicine.id)).filter(Medicine.is_active == 1, Medicine.quantity <= Medicine.min_stock).scalar() or 0

    expired = db.query(func.count(Medicine.id)).filter(Medicine.is_active == 1, Medicine.expiry_date < func.date('now')).scalar() or 0

    total_customers = db.query(func.count(Customer.id)).filter(Customer.is_active == 1).scalar() or 0
    total_suppliers = db.query(func.count(Supplier.id)).filter(Supplier.is_active == 1).scalar() or 0

    inventory_value = db.query(func.coalesce(func.sum(Medicine.quantity * Medicine.purchase_price), 0)).filter(Medicine.is_active == 1).scalar() or 0.0

    recent_sales = db.query(Sale).order_by(Sale.created_at.desc()).limit(5).all()
    from app.schemas.sale import SaleResponse
    recent_sales_data = [SaleResponse.model_validate(s).model_dump() for s in recent_sales]

    profit_data = db.query(
        func.date(Sale.created_at).label("date"),
        func.coalesce(func.sum(Sale.total), 0).label("revenue"),
    ).filter(
        Sale.created_at >= func.datetime('now', '-30 days'),
    ).group_by(func.date(Sale.created_at)).order_by(func.date(Sale.created_at)).all()

    profit_overview = [ProfitOverview(date=str(d.date), revenue=float(d.revenue), profit=float(d.revenue) * 0.3) for d in profit_data]

    # Monthly sales data from Jan to current month only
    current_month = datetime.now().month
    current_year = datetime.now().year
    monthly_data = []
    for m in range(1, current_month + 1):
        month_rev = db.query(func.coalesce(func.sum(Sale.total), 0)).filter(
            extract("year", Sale.created_at) == current_year,
            extract("month", Sale.created_at) == m,
        ).scalar() or 0.0
        monthly_data.append(float(month_rev))

    # Category distribution for donut chart
    cat_rows = db.query(
        MedicineCategory.name,
        func.count(Medicine.id),
    ).join(Medicine, Medicine.category_id == MedicineCategory.id).filter(
        Medicine.is_active == 1,
    ).group_by(MedicineCategory.id, MedicineCategory.name).all()

    category_distribution = [CategoryCount(name=name, count=count) for name, count in cat_rows]

    # Include uncategorized medicines as "Others"
    uncategorized = db.query(func.count(Medicine.id)).filter(
        Medicine.is_active == 1,
        Medicine.category_id == None,
    ).scalar() or 0
    if uncategorized > 0:
        category_distribution.append(CategoryCount(name="Others", count=uncategorized))

    return {
        "status": "success",
        "data": DashboardStats(
            total_sales_today=sales_today,
            total_sales_this_month=sales_this_month,
            total_revenue_today=float(revenue_today),
            monthly_revenue=float(monthly_revenue),
            total_medicines=total_medicines,
            low_stock_medicines=low_stock,
            expired_medicines=expired,
            total_customers=total_customers,
            total_suppliers=total_suppliers,
            recent_sales=recent_sales_data,
            inventory_value=float(inventory_value),
            profit_overview=profit_overview,
            monthly_sales_data=monthly_data,
            category_distribution=category_distribution,
        ).model_dump(),
    }
