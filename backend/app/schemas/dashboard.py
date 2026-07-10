from pydantic import BaseModel
from typing import Optional, List
from datetime import date


class ProfitOverview(BaseModel):
    revenue: float
    profit: float
    date: str


class CategoryCount(BaseModel):
    name: str
    count: int


class DashboardStats(BaseModel):
    total_sales_today: int = 0
    total_sales_this_month: int = 0
    total_revenue_today: float = 0.0
    monthly_revenue: float = 0.0
    total_medicines: int = 0
    low_stock_medicines: int = 0
    expired_medicines: int = 0
    total_customers: int = 0
    total_suppliers: int = 0
    recent_sales: List = []
    inventory_value: float = 0.0
    profit_overview: List[ProfitOverview] = []
    monthly_sales_data: List[float] = []
    category_distribution: List[CategoryCount] = []
